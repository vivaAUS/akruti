"""Sculpted-style hair: a thin cap over the skull plus long wavy locks.

Each lock is a bundle of round strands twisted round a centre-line that starts
on the scalp, falls under 'gravity', is pushed out of the body (BVH nearest
point), and gets a sine wave across the fall direction.
"""
import bpy, bmesh, math, random
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import kit


def _bvh(ob):
    dg = bpy.context.evaluated_depsgraph_get()
    me = ob.evaluated_get(dg).to_mesh()
    bvh = BVHTree.FromPolygons([ob.matrix_world @ v.co for v in me.vertices],
                               [list(p.vertices) for p in me.polygons])
    ob.evaluated_get(dg).to_mesh_clear()
    return bvh


def cap(body, head_center, brow_z, coll, thickness=0.9, offset=0.35):
    """Hair cap: head skin above the brow (front) / above the nape (back), lifted off the skull."""
    c = body.copy()
    c.data = body.data.copy()
    c.name = "HairCap"
    coll.objects.link(c)
    hc = Vector(head_center)
    bm = bmesh.new()
    bm.from_mesh(c.data)
    dl = bm.verts.layers.deform.active
    gi = c.vertex_groups["head"].index
    def keep(v):
        if v[dl].get(gi, 0) < 0.5:
            return False
        rel = v.co - hc
        front = rel.y < -0.35 * rel.length          # facing the viewer
        if front:
            return v.co.z > brow_z + 3.0 + 6.0 * max(0, 1 - abs(rel.x) / 9)  # centre-parted hairline
        return v.co.z > brow_z - 9.0                 # sides/back come down to the nape
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not keep(v)], context="VERTS")
    for v in bm.verts:
        v.co += v.normal * offset
    bm.to_mesh(c.data)
    bm.free()
    c.data.materials.clear()
    c.data.materials.append(kit.ivory())
    so = c.modifiers.new("Thick", "SOLIDIFY")
    so.thickness, so.offset = thickness, 1.0
    return c


def locks(body, head_center, coll, seed=3, count=16, front_locks=2):
    rnd = random.Random(seed)
    bvh = _bvh(body)
    hc = Vector(head_center)
    strands = []
    specs = []
    for i in range(count):  # behind the shoulders, round the back of the head
        az = math.radians(-120 + 240 * i / (count - 1)) + math.pi  # 0 = back
        specs.append((az, rnd.uniform(-2, 4), rnd.uniform(40, 55), False))
    for sd in (-1, 1):       # long locks over the shoulders onto the chest
        for k in range(front_locks):
            az = sd * math.radians(78 + 10 * k)
            specs.append((az, rnd.uniform(-1, 2), rnd.uniform(30, 36), True))
    for az, dz, length, front in specs:
        d = Vector((math.sin(az), -math.cos(az), 0.25)).normalized()
        hit = bvh.ray_cast(hc + d * 40, -d)
        if hit[0] is None:
            continue
        p = hit[0] + hit[1] * 0.8 + Vector((0, 0, dz))
        out = Vector((d.x, d.y, 0)).normalized()
        if front:
            fall = Vector((0.15 * math.copysign(1, d.x), -0.75, -1)).normalized()
        else:
            fall = (out * 0.25 + Vector((0, 0.15, -1))).normalized()
        pts = [p.copy()]
        step = 0.6
        dirn = (out * 0.9 + Vector((0, 0, -0.3))).normalized()
        for s in range(int(length / step)):
            dirn = (dirn * 0.82 + fall * 0.18).normalized()
            p = p + dirn * step
            near = bvh.find_nearest(p)
            if near[0] is not None:
                gap = (p - near[0]).dot(near[1])
                if gap < 1.6:
                    p += near[1] * (1.6 - gap)
            pts.append(p.copy())
        # wave across the fall direction + twisted strand bundle
        amp, freq, ph = rnd.uniform(1.6, 2.4), rnd.uniform(2.0, 2.8), rnd.uniform(0, 6.28)
        side = None
        lock_r = rnd.uniform(2.0, 2.6)
        nstr = 7
        bundle = [[] for _ in range(nstr)]
        for k, c in enumerate(pts):
            t = k / max(1, len(pts) - 1)
            tang = (pts[min(k + 1, len(pts) - 1)] - pts[max(k - 1, 0)]).normalized()
            near = bvh.find_nearest(c)
            nrm = near[1] if near[0] is not None else out
            side = tang.cross(nrm).normalized()
            w = amp * math.sin(2 * math.pi * freq * t + ph) * min(1, t * 4)
            centre = c + side * w
            r = lock_r * (1 - 0.55 * t)
            for b in range(nstr):
                a = 2 * math.pi * b / nstr + t * 9.0
                bundle[b].append(centre + (side * math.cos(a) + nrm * math.sin(a) * 0.6) * r * 0.5)
        strands += bundle
    cu = bpy.data.curves.new("HairLocks", "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = 0.95
    cu.bevel_resolution = 2
    cu.use_fill_caps = True
    for pl in strands:
        sp = cu.splines.new("POLY")
        sp.points.add(len(pl) - 1)
        for pt, co in zip(sp.points, pl):
            pt.co = (*co, 1)
            pt.radius = 1.0
        n = len(pl)
        for k, pt in enumerate(sp.points):
            pt.radius = 1.0 - 0.5 * k / n
    ob = bpy.data.objects.new("HairLocks", cu)
    coll.objects.link(ob)
    cu.materials.append(kit.ivory())
    return ob
