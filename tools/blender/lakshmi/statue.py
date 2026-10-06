"""Lakshmi statue: MPFB figure + procedural ornament + reference-driven filigree relief.

All coordinates are millimetres. The reference image is mapped with
PX (mm per pixel) and its pixel origin; landmarks below were read off it.
Usage: python statue.py [align|full]
"""
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import kit, body, relief, fullwrap, hair
import cv2
import bmesh
import numpy as np

OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)
REF = os.path.join(HERE, "reference.jpg")
MODE = sys.argv[-1] if sys.argv[-1] in ("align", "front", "full") else "full"

# reference image -> statue frame: x right, z up, viewed from -Y
PX = 0.1228              # mm per pixel (base plinth 1010 px = 124 mm)
PX_CX, PX_BOTTOM = 640, 1525
def P(px, py, y=0.0):
    return ((px - PX_CX) * PX, y, (PX_BOTTOM - py) * PX)

LANDMARKS = dict(
    seat_z=P(0, 1275)[2],
    skull_top_z=P(0, 335)[2],
    body_y=4.0,
    abhaya_wrist=P(392, 975, -12),
    varada_wrist=P(965, 1035, -20),
    lotus_wrist_R=P(205, 705, 2),
    lotus_wrist_L=P(1078, 705, 2),
)


def to_px(x, z):
    return x / PX + PX_CX, PX_BOTTOM - z / PX


def revolve(name, profile, center, n=96, hide=True):
    """Elliptic loft: profile = [(z, rx, ry, dy)], closed ring per z."""
    bm = bmesh.new()
    rings = []
    for z, rx, ry, dy in profile:
        rings.append([bm.verts.new((center[0] + rx * math.cos(2 * math.pi * i / n),
                                    center[1] + dy + ry * math.sin(2 * math.pi * i / n), z))
                      for i in range(n)])
    for a, b in zip(rings, rings[1:]):
        for i in range(n):
            bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    ob.hide_render = hide
    return ob


def lap_bell(body_y):
    z0, z1 = LANDMARKS["seat_z"], P(0, 1000)[2]
    prof = []
    for i in range(25):
        t = i / 24
        z = z0 + (z1 - z0) * t
        rx = 17 + 42 * (1 - t) ** 1.6
        ry = 13 + 27 * (1 - t) ** 1.3
        prof.append((z, rx, ry, -6 * (1 - t)))
    return revolve("LapBell", prof, (0, body_y))


def crown_cone(head_y):
    z0, z1 = P(0, 398)[2], P(0, 0)[2]
    prof = [(z0 + (z1 - z0) * t, 20.5 * (1 - t) ** 0.85 + 1.0, 17.5 * (1 - t) ** 0.85 + 1.0, -1.5)
            for t in [i / 30 for i in range(31)]]
    return revolve("CrownCone", prof, (0, head_y))


def region_mask(shape):
    face = [(640, 476, 93, 106)]
    lotuses = [(215, 455, 108, 88), (1063, 455, 108, 88)]
    raised_L = [(115, 520), (300, 520), (330, 800), (338, 880), (250, 888), (128, 852), (108, 700)]
    raised_R = [(1280 - x, y) for x, y in raised_L]
    abhaya = [(318, 800), (450, 778), (472, 880), (458, 965), (424, 1048), (328, 1048), (298, 960)]
    varada = [(828, 868), (905, 852), (988, 988), (1082, 1048), (1112, 1150), (1102, 1218),
              (1028, 1212), (948, 1110), (872, 1012), (822, 952)]
    neck = [(588, 520), (692, 520), (700, 598), (580, 598)]
    allowed = np.ones(shape, bool)
    allowed[1278:, :] = False
    return relief.poly_mask(shape, [raised_L, raised_R, abhaya, varada, neck],
                            face + lotuses, value=False, base=allowed)


def torus(name, center, axis, R, r, coll):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=48,
                                     minor_segments=12, location=center)
    ob = bpy.context.active_object
    ob.name = name
    ob.rotation_euler = Vector(axis).to_track_quat("Z", "Y").to_euler()
    bpy.ops.object.shade_smooth()
    ob.data.materials.append(kit.ivory())
    return ob


def jhumka(top, coll):
    """Bell earring: stud, stem, dome, bead fringe and a drop."""
    def sphere(loc, r, sz=1.0):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=24, ring_count=12)
        o = bpy.context.active_object
        o.scale.z = sz
        bpy.ops.object.shade_smooth()
        o.data.materials.append(kit.ivory())
        return o
    sphere(top, 1.0)
    sphere(top + Vector((0, 0, -1.6)), 0.55)
    dome = sphere(top + Vector((0, 0, -4.2)), 2.3, 0.95)
    bm = bmesh.new()
    bm.from_mesh(dome.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.25], context="VERTS")
    bm.to_mesh(dome.data)
    bm.free()
    dome.modifiers.new("Shell", "SOLIDIFY").thickness = 0.35
    rim = top + Vector((0, 0, -4.6))
    for i in range(10):
        a = 2 * math.pi * i / 10
        sphere(rim + Vector((2.3 * math.cos(a), 2.3 * math.sin(a), 0)), 0.42)
    sphere(top + Vector((0, 0, -6.4)), 0.7)


def base_core(coll):
    """Solid plinth, recessed drum and seat; the ornament comes from the photo relief."""
    zb = lambda py: P(0, py)[2]
    kit.solid_disc("Plinth", 61.5, 0.0, zb(1492), coll, bevel=1.2)
    kit.solid_disc("DrumCore", 54.0, zb(1492) - 0.5, zb(1300) - zb(1492) + 1.0, coll, bevel=0.3)
    kit.solid_disc("Seat", 58.5, zb(1300), zb(1270) - zb(1300), coll, bevel=1.5)
    return zb(1270)


def base_relief(field):
    """The photo's base band (12 lotus-arch units of 30.9 mm) wrapped seamlessly round the drum."""
    relief.wrap_cylinder("BaseRelief", field, R=59.0, z0=P(0, 1497)[2], z1=P(0, 1266)[2],
                         px_of_z=lambda z: PX_BOTTOM - z / PX, unit_center_px=640,
                         unit_w_px=252, units=12, px_mm=PX, material=kit.ivory())


def garments_360(field, mask, torso, bell, crown, head_y):
    """Torso, lap and crown carved all the way round: photo on the front, synthesised elsewhere."""
    photo = cv2.imread(REF)
    mm = PX
    tx, ty = np.mean([v.co.x for v in torso.data.vertices]), np.mean([v.co.y for v in torso.data.vertices])
    jobs = [
        ("Lap", [bell], (0, LANDMARKS["body_y"]), LANDMARKS["seat_z"], P(0, 985)[2], 59, (1080, 1270, 260, 1020)),
        ("Bodice", [torso], (tx, ty), P(0, 1010)[2], P(0, 598)[2], 26, (650, 1000, 470, 800)),
        ("Crown", [crown], (0, head_y), P(0, 398)[2], P(0, 2)[2], 20, (60, 340, 470, 800)),
    ]
    for name, car, axis, z0, z1, r, (y0, y1, x0, x1) in jobs:
        U = fullwrap.unwrap(car, axis, z0, z1, r, mm, photo, mask, to_px)
        ex = photo[y0:y1, x0:x1]
        img = fullwrap.synthesize(U["img"], U["known"], ex, name)
        cv2.imwrite(os.path.join(OUT, f"unwrap_{name}.png"),
                    np.concatenate([U["img"], img], 0))
        f = fullwrap.analyse_array(img, scale=1.0, px_mm=mm)
        fullwrap.build(name + "360", U, f, lift=1.6, stride=2, material=kit.ivory())
        print(name, "unwrap", img.shape, "known %.0f%%" % (100 * U["known"].mean()))


def build(scene, with_relief=True):
    coll = scene.collection
    base_top = base_core(coll)
    fig, arms, k, marks = body.build_figure(LANDMARKS)
    body.drop_groups(fig, body.LEG_GROUPS, 0.5)
    for ob in (fig, arms):
        ob.data.materials.clear()
        ob.data.materials.append(kit.ivory())
    print("base top", round(base_top, 1), "seat", round(LANDMARKS["seat_z"], 1), "scale", round(k, 2))
    head_y = (marks["head"].y + marks["head_top"].y) / 2

    # hair: cap over the skull + long wavy locks
    if MODE == "full":
        hc = (marks["head"] + marks["head_top"]) / 2
        hair.cap(fig, hc, marks["eye.L"].z + 1.5, coll)
        hair.locks(fig, hc, coll)

    # eyes
    for sd in "LR":
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.012 * k * 0.95, location=marks[f"eye.{sd}"],
                                             segments=32, ring_count=16)
        e = bpy.context.active_object
        e.name = f"Eye.{sd}"
        bpy.ops.object.shade_smooth()
        e.data.materials.append(kit.ivory())

    # carved irises: a ring and pupil on the front of each eye
    re_ = 0.012 * k * 0.95
    for sd in "LR":
        c = marks[f"eye.{sd}"] + Vector((0, -re_ * 0.93, 0))
        torus(f"Iris.{sd}", c, (0, -1, 0), re_ * 0.45, re_ * 0.07, coll)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=re_ * 0.16, location=c + Vector((0, -re_ * 0.02, 0)))
        bpy.context.active_object.data.materials.append(kit.ivory())

    # forehead tikka and jhumka earrings
    bvh = relief._bvh_for([fig])
    hit = bvh.ray_cast(Vector((0, -300, P(0, 383)[2])), Vector((0, 1, 0)))
    if hit[0] is not None:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1.05, location=hit[0] + Vector((0, -0.5, 0)))
        bpy.context.active_object.data.materials.append(kit.ivory())
        bpy.ops.object.shade_smooth()
    for px in (528, 752):
        top = Vector(P(px, 500, marks["head"].y))
        hit = bvh.ray_cast(Vector((top.x, -300, top.z)), Vector((0, 1, 0)))
        if hit[0] is not None:
            top.y = hit[0].y + 2.0
        jhumka(top, coll)

    # bangles: two per wrist, axis along the forearm
    for sd in "LR":
        for wrist, elbow, tag in ((marks[f"hand_{sd}"], marks[f"elbow_{sd}"], "low"),
                                  (marks[f"lotus_wrist_{sd}"], marks[f"lotus_elbow_{sd}"], "up")):
            ax = (wrist - elbow).normalized()
            for i, (off, R) in enumerate(((-2.2, 3.9), (-4.0, 4.1), (-5.8, 4.2))):
                torus(f"Bangle_{tag}_{sd}_{i}", wrist + ax * off, ax, R, 0.75, coll)

    # lotuses held in the raised hands
    for sd, px in (("R", 215), ("L", 1063)):
        hand = marks[f"lotus_hand_{sd}"]
        flower = Vector(P(px, 515, hand.y))
        root = kit.build_lotus(coll, loc=flower, scale=0.82)
        stem_dir = (flower - (hand + Vector((0, 0, -9)))).normalized()
        root.rotation_euler = stem_dir.to_track_quat("Z", "Y").to_euler()

    if with_relief:
        field = relief.analyse(REF, px_mm=PX)
        torso = body.torso_carrier(fig)
        sm = torso.modifiers.new("Drape", "SMOOTH")   # fabric skims the body, no anatomy detail
        sm.factor, sm.iterations = 1.0, 25
        bell = lap_bell(LANDMARKS["body_y"])
        lining = lap_bell(LANDMARKS["body_y"])
        lining.name = "LapLining"
        lining.hide_render = False
        lining.scale = (0.94, 0.9, 1.0)
        lining.location.y = LANDMARKS["body_y"] * 0.1
        lining.data.materials.append(kit.ivory())
        for p_ in lining.data.polygons:
            p_.use_smooth = True
        cap = lining.modifiers.new("Close", "SOLIDIFY")
        cap.thickness = 1.5
        crown = crown_cone(head_y)
        def fallback(x, z):
            if z > 141:
                return head_y + 9
            if z > 98:
                if abs(x) < 29 and MODE == "full":
                    return None            # 3D hair locks replace the photo hair here
                return head_y + 3 if abs(x) < 29 else head_y + 9
            return LANDMARKS["body_y"] + 4
        mask = region_mask(field["shape"])
        if MODE == "front":
            relief.project("Filigree", field, to_px, mask, [crown, torso, bell], fallback,
                           step=0.25, lift=1.8, bbox=(-72, 72, 31.0, 188.0), material=kit.ivory())
        else:
            garments_360(field, mask, torso, bell, crown, head_y)
            # halo, side drapes and loose hair stay as front relief panels (they are flat in the original)
            relief.project("Panels", field, to_px, mask, [], fallback, step=0.25, lift=0.0,
                           bbox=(-72, 72, 31.0, 188.0), material=kit.ivory(), thickness=1.4,
                           skip_if_hits=[crown, torso, bell])
        base_relief(field)
        # strut tying the halo to the back of the crown (printability)
        bpy.ops.mesh.primitive_cylinder_add(radius=3.0, depth=12, location=(0, head_y + 4, P(0, 300)[2]),
                                            rotation=(math.radians(90), 0, 0))
        bpy.context.active_object.data.materials.append(kit.ivory())
    return fig, arms, marks


def front_render(name, samples=96):
    scene = bpy.context.scene
    kit.stage((0, -520, 105), (0, 0, 98), lens=85, res=(1000, 1244), name=name)
    kit.stage((-300, -420, 150), (0, 0, 95), lens=85, res=(1000, 1244), name=name + "_34")
    kit.stage((260, 450, 150), (0, 0, 95), lens=85, res=(1000, 1244), name=name + "_back")


def ortho_front(name, res_scale=0.5):
    scene = bpy.context.scene
    W, H = 1284, 1598
    cam_data = bpy.data.cameras.new("Ortho")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = H * PX
    cam = bpy.data.objects.new("OrthoCam", cam_data)
    scene.collection.objects.link(cam)
    cx = 0.0
    cz = (PX_BOTTOM - H / 2) * PX
    cam.location = (cx + (W / 2 - PX_CX) * PX, -400, cz)
    cam.rotation_euler = (math.radians(90), 0, 0)
    cam_data.clip_end = 2000
    scene.camera = cam
    scene.render.resolution_x, scene.render.resolution_y = int(W * res_scale), int(H * res_scale)
    scene.render.filepath = os.path.join(OUT, name + ".png")
    bpy.ops.render.render(write_still=True)
    return scene.render.filepath


if __name__ == "__main__":
    scene = kit.new_scene()
    build(scene, with_relief=(MODE != "align"))
    if MODE in ("front", "full"):
        front_render("statue_" + MODE)
    if MODE == "align":
        kit.stage((0, -330, 120), (0, 0, 90), lens=50, res=(642, 799), name="_tmp")  # lights/world
        scene.cycles.samples = 16
        path = ortho_front("align_front")
        from PIL import Image
        a = Image.open(path).convert("RGB")
        r = Image.open(REF).convert("RGB").resize(a.size)
        Image.blend(r, a, 0.5).save(os.path.join(OUT, "align_overlay.png"))
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, f"statue_{MODE}.blend"))
