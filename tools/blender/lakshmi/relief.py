"""Reference-driven filigree: turn the photo into carved, cut-through relief.

1. analyse(): from the image, find material (ivory) vs holes (dark shadowed
   openings) vs background, and build a height field where every strand gets a
   rounded profile from its distance to the nearest hole edge.
2. project(): sample that field on a fine grid in the statue's front view and
   drop each grid point onto 3D "carrier" surfaces (torso, lap bell, crown cone,
   backplate) by ray casting from the front. Material points are lifted along
   the surface normal by the strand height; hole points are left out, so the
   openings are real holes in the mesh.
"""
import bpy, bmesh, math
import numpy as np
import cv2
from mathutils import Vector
from mathutils.bvhtree import BVHTree


def analyse(path, strand_r_px=4.5, px_mm=0.1228, depth=1.7):
    im = cv2.imread(path)
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    S, V = hsv[..., 1].astype(np.float32), hsv[..., 2].astype(np.float32)
    background = ((V < 185) & (S < 70)) | (S < 28)
    background = cv2.morphologyEx(background.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)) > 0
    d = g - cv2.GaussianBlur(g, (0, 0), 12)
    holes = (d < -16) & (g < np.percentile(g, 45))
    holes = cv2.morphologyEx(holes.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    holes = cv2.morphologyEx(holes, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)) > 0
    n, lab, stats, _ = cv2.connectedComponentsWithStats(holes.astype(np.uint8), 8)
    holes = np.isin(lab, np.where(stats[:, cv2.CC_STAT_AREA] >= 25)[0][1:])
    material = ~holes & ~background
    dt = cv2.distanceTransform(material.astype(np.uint8), cv2.DIST_L2, 5)
    r = strand_r_px
    t = np.clip(dt / r, 0, 1)
    h = r * np.sqrt(1 - (1 - t) ** 2)                       # round strand profile
    h += 3.0 * np.clip((dt - r) / 25.0, 0, 1)                # broad motifs (lotus, beads) bulge
    detail = np.clip((g - cv2.GaussianBlur(g, (0, 0), 3)) / 40.0, -1, 1)
    h += 1.6 * detail * (t > 0.3)                            # carved shading detail
    h = cv2.GaussianBlur(h.astype(np.float32), (0, 0), 0.8)
    height_mm = h * px_mm * depth
    return dict(material=material, height=height_mm, holes=holes, background=background, shape=g.shape)


def _bvh_for(objects):
    dg = bpy.context.evaluated_depsgraph_get()
    verts, polys, owner = [], [], []
    for ob in objects:
        me = ob.evaluated_get(dg).to_mesh()
        mw = ob.matrix_world
        base = len(verts)
        verts += [mw @ v.co for v in me.vertices]
        polys += [[base + i for i in p.vertices] for p in me.polygons]
        ob.evaluated_get(dg).to_mesh_clear()
    return BVHTree.FromPolygons(verts, polys, epsilon=0.0)


def project(name, field, to_px, region_mask, carriers, fallback_y, step=0.25,
            lift=0.35, max_jump=1.6, bbox=None, coll=None, material=None, thickness=0.9,
            from_back=False, smooth_edges=6):
    """Build the relief mesh.

    to_px(x, z) -> (px, py) maps statue mm to image pixels.
    region_mask: bool image, where relief is allowed.
    carriers: list of objects to project onto; fallback_y(x, z) used when nothing is hit.
    """
    bvh = _bvh_for(carriers) if carriers else None
    mat, hgt = field["material"], field["height"]
    H, W = mat.shape
    x0, x1, z0, z1 = bbox
    nx, nz = int((x1 - x0) / step) + 1, int((z1 - z0) / step) + 1
    bm = bmesh.new()
    grid = [[None] * nx for _ in range(nz)]
    depth = np.full((nz, nx), np.nan)
    sgn = -1.0 if from_back else 1.0          # ray direction along +Y (front) or -Y (back)
    fwd = Vector((0, sgn, 0))
    for j in range(nz):
        z = z0 + j * step
        for i in range(nx):
            x = x0 + i * step
            px, py = to_px(x, z)
            pi, pj = int(round(px)), int(round(py))
            if not (0 <= pi < W and 0 <= pj < H) or not region_mask[pj, pi] or not mat[pj, pi]:
                continue
            hit = bvh.ray_cast(Vector((x, -500.0 * sgn, z)), fwd) if bvh else (None,)
            if hit[0] is not None:
                p, n = hit[0], hit[1]
                if n.y * sgn > 0:
                    n = -n
                n = (n + Vector((0, -0.6 * sgn, 0))).normalized()
            else:
                y = fallback_y(x, z)
                if y is None:
                    continue
                p, n = Vector((x, y, z)), Vector((0, -sgn, 0))
            co = p + n * (lift + float(hgt[pj, pi]))
            grid[j][i] = bm.verts.new(co)
            depth[j, i] = co.y
    for j in range(nz - 1):
        for i in range(nx - 1):
            q = (grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i])
            if all(q):
                ds = depth[j:j + 2, i:i + 2]
                if np.nanmax(ds) - np.nanmin(ds) < max_jump:
                    bm.faces.new(q if not from_back else q[::-1])  # normal faces the viewer
    loose = [v for v in bm.verts if not v.link_faces]
    bmesh.ops.delete(bm, geom=loose, context="VERTS")
    # soften the pixel staircase along every hole edge
    for _ in range(smooth_edges):
        edge_verts = list({v for e in bm.edges if e.is_boundary for v in e.verts})
        bmesh.ops.smooth_vert(bm, verts=edge_verts, factor=0.5,
                              use_axis_x=True, use_axis_y=True, use_axis_z=True)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    (coll or bpy.context.scene.collection).objects.link(ob)
    if material:
        me.materials.append(material)
    so = ob.modifiers.new("Thickness", "SOLIDIFY")
    so.thickness = thickness
    so.offset = -1.0  # grow backwards, away from the viewer
    so.use_even_offset = False
    so.thickness_clamp = 0.6  # never thicker than 60% of a local edge: no spikes
    return ob


def poly_mask(shape, polys, ellipses=(), value=True, base=None):
    """Rasterise polygons/ellipses (pixel coords) into a bool mask."""
    m = np.zeros(shape, np.uint8) if base is None else base.astype(np.uint8).copy()
    v = 1 if value else 0
    for poly in polys:
        cv2.fillPoly(m, [np.array(poly, np.int32)], v)
    for (cx, cy, rx, ry) in ellipses:
        cv2.ellipse(m, (int(cx), int(cy)), (int(rx), int(ry)), 0, 0, 360, v, -1)
    return m > 0


def wrap_cylinder(name, field, R, z0, z1, px_of_z, unit_center_px, unit_w_px, units, px_mm,
                  step=0.25, lift=0.2, material=None, thickness=0.9, smooth_edges=6):
    """Wrap a repeating band from the image all the way round a cylinder.

    One motif unit (unit_w_px wide, centred on unit_center_px in the image) is
    tiled `units` times round the circumference, so the band is seamless and
    the sides/back carry the same carving as the front (front = -Y).
    """
    mat, hgt = field["material"], field["height"]
    H, W = mat.shape
    circ = 2 * math.pi * R
    U = circ / units
    ns, nz = int(circ / step), int((z1 - z0) / step) + 1
    bm = bmesh.new()
    grid = [[None] * ns for _ in range(nz)]
    for j in range(nz):
        z = z0 + j * step
        py = int(round(px_of_z(z)))
        if not 0 <= py < H:
            continue
        for i in range(ns):
            s = i * step
            u = ((s + U / 2) % U) - U / 2
            px = int(round(unit_center_px + u / U * unit_w_px))
            if not (0 <= px < W) or not mat[py, px]:
                continue
            phi = s / R
            r = R + lift + float(hgt[py, px])
            grid[j][i] = bm.verts.new((r * math.sin(phi), -r * math.cos(phi), z))
    for j in range(nz - 1):
        for i in range(ns):
            i2 = (i + 1) % ns
            q = (grid[j][i], grid[j][i2], grid[j + 1][i2], grid[j + 1][i])
            if all(q):
                bm.faces.new(q)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
    for _ in range(smooth_edges):
        ev = list({v for e in bm.edges if e.is_boundary for v in e.verts})
        bmesh.ops.smooth_vert(bm, verts=ev, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    if material:
        me.materials.append(material)
    so = ob.modifiers.new("Thickness", "SOLIDIFY")
    so.thickness, so.offset, so.thickness_clamp = thickness, -1.0, 0.6
    return ob
