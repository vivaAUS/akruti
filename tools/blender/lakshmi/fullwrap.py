"""Full 360° filigree for a garment surface.

1. unwrap(): cast rays radially (around a vertical axis) onto the carrier to get a
   (theta, z) grid of surface points. Where a point is clearly visible in the
   front photo, copy the photo pixel; everywhere else (sides, back, under the
   hands) is marked unknown.
2. synthesize(): Embark's texture-synthesis (GitHub, CLI) inpaints the unknown
   pixels with filigree sampled from the known pixels + an example crop, so the
   back continues the photo's own pattern language.
3. build(): the filled unwrap goes through relief.analyse() and becomes cut-
   through relief on the surface points (seamless round the axis).
"""
import bpy, bmesh, math, os, subprocess, tempfile
import numpy as np
import cv2
from mathutils import Vector
import relief

TS_BIN = os.environ.get("TEXTURE_SYNTHESIS",
                        "/tmp/claude-0/-home-user-akruti/b5a3ff6b-a2b0-54dd-b287-90a327ef1c8e/"
                        "scratchpad/tools/texture-synthesis-0.8.2-x86_64-unknown-linux-musl/texture-synthesis")


def unwrap(carriers, axis, z0, z1, r_ref, mm_px, photo, allowed, to_px, min_facing=0.45):
    bvh = relief._bvh_for(carriers)
    W = int(2 * math.pi * r_ref / mm_px)
    Hh = int((z1 - z0) / mm_px) + 1
    P = np.full((Hh, W, 3), np.nan, np.float32)
    N = np.zeros((Hh, W, 3), np.float32)
    img = np.zeros((Hh, W, 3), np.uint8)
    known = np.zeros((Hh, W), bool)
    ph, pw = photo.shape[:2]
    fwd = Vector((0, 1, 0))
    for j in range(Hh):
        z = z1 - j * mm_px                      # row 0 = top
        for i in range(W):
            th = 2 * math.pi * i / W - math.pi   # column 0 = back, centre = front (-Y)
            d = Vector((math.sin(th), -math.cos(th), 0))
            o = Vector((axis[0], axis[1], z)) + d * 300
            hit = bvh.ray_cast(o, -d)
            if hit[0] is None:
                continue
            p, n = hit[0], hit[1]
            if n.dot(d) < 0:
                n = -n
            P[j, i] = p
            N[j, i] = n
            if -n.y < min_facing:
                continue
            px, py = to_px(p.x, p.z)
            pi_, pj = int(round(px)), int(round(py))
            if not (0 <= pi_ < pw and 0 <= pj < ph) or not allowed[pj, pi_]:
                continue
            front = bvh.ray_cast(Vector((p.x, -500, p.z)), fwd)
            if front[0] is None or abs(front[0].y - p.y) > 0.8:
                continue                         # hidden behind another part from the front
            img[j, i] = photo[pj, pi_]
            known[j, i] = True
    return dict(P=P, N=N, img=img, known=known, valid=~np.isnan(P[..., 0]))


def synthesize(img, known, example, tag, seed=7):
    """Inpaint unknown pixels with texture-synthesis (tiling horizontally)."""
    tmp = tempfile.mkdtemp(prefix=f"ts_{tag}_")
    src, msk, ex, out = (os.path.join(tmp, n) for n in ("src.png", "mask.png", "ex.png", "out.png"))
    # pad 64 px from the opposite edge on both sides so the seam is synthesised continuously
    pad = 64
    big = np.concatenate([img[:, -pad:], img, img[:, :pad]], 1)
    bigk = np.concatenate([known[:, -pad:], known, known[:, :pad]], 1)
    cv2.imwrite(src, big)
    cv2.imwrite(msk, (bigk * 255).astype(np.uint8))
    cv2.imwrite(ex, example)
    h, w = big.shape[:2]
    cmd = [TS_BIN, "--seed", str(seed), "--k-neighs", "50", "--m-rand", "50", "--backtrack-stages", "5",
           "--inpaint", msk, "--out-size", f"{w}x{h}", "--no-progress", "-o", out,
           "generate", src, ex]
    subprocess.run(cmd, check=True, capture_output=True)
    res = cv2.imread(out)
    return res[:, pad:pad + img.shape[1]]


def analyse_array(img, scale=1.0, depth=1.7, px_mm=0.1228):
    path = os.path.join(tempfile.mkdtemp(), "u.png")
    cv2.imwrite(path, img)
    return relief.analyse(path, strand_r_px=4.5 * scale, px_mm=px_mm, depth=depth, scale=scale)


def build(name, U, field, lift=1.6, stride=1, material=None, thickness=0.9, max_jump=1.6,
          keep=None, smooth_edges=5):
    P, N, valid = U["P"], U["N"], U["valid"]
    mat, hgt = field["material"], field["height"]
    if keep is not None:
        mat = mat & keep
    Hh, W = valid.shape
    bm = bmesh.new()
    rows = range(0, Hh, stride)
    cols = range(0, W, stride)
    grid = {}
    for j in rows:
        for i in cols:
            if valid[j, i] and mat[j, i]:
                n = Vector(N[j, i])
                grid[j, i] = bm.verts.new(Vector(P[j, i]) + n * (lift + float(hgt[j, i])))
    rl, cl = list(rows), list(cols)
    for a, j in enumerate(rl[:-1]):
        j2 = rl[a + 1]
        for b, i in enumerate(cl):
            i2 = cl[(b + 1) % len(cl)]
            q = [grid.get(k) for k in ((j, i), (j, i2), (j2, i2), (j2, i))]
            if all(q):
                d = [v.co for v in q]
                if max((x - y).length for x, y in zip(d, d[1:] + d[:1])) < max_jump * 2:
                    bm.faces.new(q[::-1])   # winding gives an outward normal (away from the axis)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
    for _ in range(smooth_edges):
        ev = list({v for e in bm.edges if e.is_boundary for v in e.verts})
        bmesh.ops.smooth_vert(bm, verts=ev, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
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
