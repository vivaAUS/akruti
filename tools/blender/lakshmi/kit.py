"""Procedural ornament kit for the Lakshmi figurine: lotus base, lotus flower, halo.

Filigree is built the way a jeweller thinks about it: 2D centre-lines (scrolls,
petal outlines, rails) mapped onto a surface and swept with a round profile.
Every motif is a function with numeric parameters, so it stays editable.
Usage: python kit.py [base|lotus|halo|all]   (renders a demo of each part)
"""
import bpy, bmesh, math, sys, os
from mathutils import Vector, Matrix

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out_lakshmi")
os.makedirs(OUT, exist_ok=True)


def new_scene():
    """Empty scene in millimetres."""
    global _bead_mesh
    _bead_mesh = None
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.scale_length = 0.001
    sc.unit_settings.length_unit = "MILLIMETERS"
    return sc

# ------------------------------------------------------------------ materials
def ivory():
    m = bpy.data.materials.get("Ivory")
    if m:
        return m
    m = bpy.data.materials.new("Ivory")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.80, 0.63, 0.38, 1)
    b.inputs["Roughness"].default_value = 0.38
    b.inputs["Subsurface Weight"].default_value = 0.12
    b.inputs["Subsurface Radius"].default_value = (1.0, 0.6, 0.35)
    b.inputs["Subsurface Scale"].default_value = 0.4
    return m

def link(ob, coll):
    coll.objects.link(ob)
    if ob.type in ("MESH", "CURVE"):
        ob.data.materials.append(ivory())
    return ob

# ------------------------------------------------------------------ 2D motif helpers
def petal_outline(height, half_width, base=(0, 0), angle=0.0, n=40, open_base=True):
    """Lotus-petal outline: widest a third of the way up, pointed tip."""
    pts = []
    for i in range(n + 1):
        s = i / n
        hw = half_width * math.sin(math.pi * (s + 0.25) / 1.25) ** 0.8
        pts.append((-hw, s * height))
    right = [(-x, y) for x, y in reversed(pts)]
    pts = pts + right[1:]
    ca, sa = math.cos(angle), math.sin(angle)
    return [(base[0] + x * ca - y * sa, base[1] + x * sa + y * ca) for x, y in pts]

def scroll(origin, size, turns=1.6, hand=1, start_angle=0.0, tail=None, n=60):
    """Logarithmic-spiral C-scroll, optionally preceded by a straight-ish tail."""
    b = math.log(6) / (turns * 2 * math.pi)  # shrinks ~6x over the turns
    pts = []
    for i in range(n + 1):
        t = i / n * turns * 2 * math.pi
        r = size * math.exp(-b * t)
        a = start_angle + hand * t
        pts.append((origin[0] + r * math.cos(a), origin[1] + r * math.sin(a)))
    if tail:
        pts = [tail] + pts
    return pts

def resample(pts, step=0.4):
    out = [pts[0]]
    for a, b in zip(pts, pts[1:]):
        d = math.dist(a, b)
        k = max(1, int(d / step))
        for j in range(1, k + 1):
            out.append((a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k))
    return out

def mirror_x(pts, cx=0.0):
    return [(2 * cx - x, y) for x, y in pts]

# ------------------------------------------------------------------ 3D builders
def strands(name, polylines3d, radius, coll, closed=False):
    """Sweep many 3D polylines with a round profile in one curve object."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 3
    cu.use_fill_caps = True
    for pl in polylines3d:
        sp = cu.splines.new("POLY")
        sp.points.add(len(pl) - 1)
        for p, co in zip(sp.points, pl):
            p.co = (*co, 1)
        sp.use_cyclic_u = closed
    ob = bpy.data.objects.new(name, cu)
    return link(ob, coll)

def ring(name, radius, z, tube, coll, n=256):
    pl = [(radius * math.cos(2 * math.pi * i / n), radius * math.sin(2 * math.pi * i / n), z)
          for i in range(n)]
    return strands(name, [pl], tube, coll, closed=True)

_bead_mesh = None
def beads_on_circle(name, radius, z, count, bead_r, coll, plane="XY", center=(0, 0, 0)):
    global _bead_mesh
    if _bead_mesh is None:
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=1.0)
        _bead_mesh = bpy.data.meshes.new("bead")
        bm.to_mesh(_bead_mesh)
        bm.free()
        for f in _bead_mesh.polygons:
            f.use_smooth = True
        _bead_mesh.materials.append(ivory())
    parent = bpy.data.objects.new(name, None)
    coll.objects.link(parent)
    for i in range(count):
        a = 2 * math.pi * i / count
        if plane == "XY":
            loc = (center[0] + radius * math.cos(a), center[1] + radius * math.sin(a), z)
        else:  # XZ plane, facing -Y
            loc = (center[0] + radius * math.cos(a), center[1] + z, center[2] + radius * math.sin(a))
        ob = bpy.data.objects.new(f"{name}_{i}", _bead_mesh)
        ob.location = loc
        ob.scale = (bead_r,) * 3
        ob.parent = parent
        coll.objects.link(ob)
    return parent

def solid_disc(name, radius, z0, height, coll, bevel=0.8):
    bpy.ops.mesh.primitive_cylinder_add(vertices=128, radius=radius, depth=height,
                                        location=(0, 0, z0 + height / 2))
    ob = bpy.context.active_object
    ob.name = name
    for c in ob.users_collection:
        c.objects.unlink(ob)
    m = ob.modifiers.new("Round", "BEVEL")
    m.width, m.segments, m.limit_method = bevel, 4, "ANGLE"
    bpy.ops.object.shade_smooth()
    return link(ob, coll)

# ------------------------------------------------------------------ LOTUS BASE
def build_base(coll, R=58.0, H=24.0):
    z = 0.0
    solid_disc("Plinth", R + 4, z, 4.0, coll, bevel=1.2); z += 4.0
    beads_on_circle("PlinthBeads", R + 2.2, z + 0.9, 150, 1.2, coll)
    ring("PlinthRail", R + 0.5, z + 1.4, 1.4, coll); z += 2.8

    # openwork drum: N repeating lotus-arch units mapped onto a cylinder
    N = 9
    W = 2 * math.pi * R / N
    solid_disc("DrumCore", R - 6.5, z - 1, H + 2, coll, bevel=0.3)  # recessed backing
    ring("DrumRailLow", R, z + 0.8, 1.5, coll)
    ring("DrumRailHigh", R, z + H - 0.8, 1.5, coll)
    lines2d, heavy = [], []
    y0, hp = z + 1.6, H - 3.6
    top = z + H - 1.6
    bud_me = petal_mesh(1, 1, cup=0.45, curl=0.10)
    def relief_petal(name, x, y, length, width, tilt=0.0):
        """Solid carved petal sitting on the drum surface, convex side out."""
        th = x / R
        n = Vector((math.cos(th), math.sin(th), 0))
        t = Vector((-math.sin(th), math.cos(th), 0))
        basis = Matrix((-t, Vector((0, 0, 1)), -n)).transposed().to_4x4()
        ob = bpy.data.objects.new(name, bud_me)
        ob.matrix_basis = (Matrix.Translation(n * (R - 0.6) + Vector((0, 0, y)))
                           @ basis @ Matrix.Rotation(tilt, 4, "Z")
                           @ Matrix.Diagonal((width, length, width * 0.9, 1)))
        so = ob.modifiers.new("Thick", "SOLIDIFY"); so.thickness = 0.12; so.offset = 0
        ob.modifiers.new("Smooth", "SUBSURF").levels = 1
        coll.objects.link(ob)
    for k in range(N):
        cx = k * W
        # double-lined pointed arch
        heavy.append(petal_outline(hp, W * 0.40, base=(cx, y0)))
        lines2d.append(petal_outline(hp * 0.80, W * 0.30, base=(cx, y0)))
        # carved lotus bud inside the arch
        relief_petal(f"Bud_{k}_c", cx, y0, hp * 0.74, W * 0.27)
        for sgn in (-1, 1):
            relief_petal(f"Bud_{k}_{sgn}a", cx + sgn * 1.6, y0, hp * 0.60, W * 0.22, tilt=-sgn * 0.50)
            relief_petal(f"Bud_{k}_{sgn}b", cx + sgn * 2.8, y0, hp * 0.40, W * 0.17, tilt=-sgn * 1.00)
        # spandrel between arches: stem + big mirrored scrolls + small bud outline
        sx = cx + W / 2
        sl = scroll((sx - 3.6, top - 7.5), 4.6, turns=1.45, hand=-1, start_angle=math.pi * 0.30,
                    tail=(sx, top))
        heavy.append(sl); heavy.append(mirror_x(sl, sx))
        lines2d.append(petal_outline(9.0, 3.4, base=(sx, y0)))
        # flank scrolls between the two arch lines, curling up
        fl = scroll((cx - W * 0.235, y0 + hp * 0.30), 2.6, turns=1.25, hand=1, start_angle=math.pi * 1.1,
                    tail=(cx - W * 0.30, y0 + 0.6))
        lines2d.append(fl); lines2d.append(mirror_x(fl, cx))
    def wrap(pl, r):
        pl = resample(pl, 0.35)
        return [(r * math.cos(x / R), r * math.sin(x / R), y) for x, y in pl]
    strands("DrumFiligree", [wrap(pl, R + 0.4) for pl in lines2d], 0.85, coll)
    strands("DrumArches", [wrap(pl, R + 0.6) for pl in heavy], 1.15, coll)
    # bead at every petal tip
    z += H

    # upper band: rail, bead row, rail, seat
    ring("TopRail1", R + 0.8, z + 0.6, 1.6, coll)
    beads_on_circle("TopBeads", R + 1.0, z + 3.0, 140, 1.25, coll)
    ring("TopRail2", R + 1.4, z + 5.2, 1.8, coll)
    solid_disc("Seat", R + 1.0, z + 4.5, 4.5, coll, bevel=1.6)
    beads_on_circle("SeatBeads", R - 1.0, z + 9.3, 130, 1.0, coll)
    return z + 10

# ------------------------------------------------------------------ LOTUS FLOWER
def petal_mesh(length, width, cup=0.35, curl=0.25, thick=0.6, nu=14, nv=24):
    bm = bmesh.new()
    grid = []
    for j in range(nv + 1):
        v = j / nv
        hw = width / 2 * max(0.02, math.sin(math.pi * (v + 0.18) / 1.18) ** 0.75)
        row = []
        for i in range(nu + 1):
            u = -1 + 2 * i / nu
            x = u * hw
            y = v * length
            zc = cup * width * (u ** 2) * (hw / (width / 2))      # cupped across
            zl = curl * length * v ** 2                            # tip curls up
            row.append(bm.verts.new((x, y, zc + zl)))
        grid.append(row)
    for j in range(nv):
        for i in range(nu):
            bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
    me = bpy.data.meshes.new("petal")
    bm.to_mesh(me)
    bm.free()
    for f in me.polygons:
        f.use_smooth = True
    me.materials.append(ivory())
    return me

def build_lotus(coll, loc=(0, 0, 0), scale=1.0):
    root = bpy.data.objects.new("Lotus", None)
    root.location = loc
    root.scale = (scale,) * 3
    coll.objects.link(root)
    layers = [  # (count, length, width, tilt from vertical deg, phase, cup)
        (8, 15.0, 8.5, 62, 0.0, 0.30),
        (8, 14.0, 8.0, 38, 0.5, 0.34),
        (6, 11.5, 7.0, 18, 0.0, 0.40),
        (5, 8.0, 5.5, 6, 0.5, 0.45),
    ]
    for li, (cnt, L, Wd, tilt, ph, cup) in enumerate(layers):
        me = petal_mesh(L, Wd, cup=cup, curl=0.18 if li < 2 else 0.08)
        for k in range(cnt):
            ob = bpy.data.objects.new(f"Petal_{li}_{k}", me)
            ob.parent = root
            az = 2 * math.pi * (k + ph) / cnt
            # petal is built along +Y lying in XY with cup toward +Z;
            # stand it up (Y->Z), tilt outward, then spin around the stem.
            ob.matrix_basis = (Matrix.Translation((0, 0, 2.0 + li * 0.6))
                               @ Matrix.Rotation(az, 4, "Z")
                               @ Matrix.Translation((0, 3.2 - li * 0.7, 0))
                               @ Matrix.Rotation(math.radians(-tilt), 4, "X")
                               @ Matrix.Rotation(math.radians(90), 4, "X"))
            so = ob.modifiers.new("Thick", "SOLIDIFY")
            so.thickness = 0.7
            so.offset = 0
            ob.modifiers.new("Smooth", "SUBSURF").levels = 1
            coll.objects.link(ob)
    # seed pod and sepal cup
    bpy.ops.mesh.primitive_uv_sphere_add(radius=3.0, location=(0, 0, 5.0), segments=32, ring_count=16)
    pod = bpy.context.active_object
    pod.scale = (1, 1, 0.55)
    pod.name = "SeedPod"
    for c in pod.users_collection:
        c.objects.unlink(pod)
    bpy.ops.object.shade_smooth()
    link(pod, coll).parent = root
    bpy.ops.mesh.primitive_uv_sphere_add(radius=4.2, location=(0, 0, 1.0), segments=32, ring_count=16)
    cupm = bpy.context.active_object
    cupm.scale = (1, 1, 0.6)
    cupm.name = "Receptacle"
    for c in cupm.users_collection:
        c.objects.unlink(cupm)
    bpy.ops.object.shade_smooth()
    link(cupm, coll).parent = root
    # stem
    stem = [(0.0, 0.0, 1.0 - t * 30) for t in [i / 30 for i in range(31)]]
    st = strands("Stem", [[(math.sin(p[2] * 0.06) * 2.0, 0, p[2]) for p in stem]], 1.4, coll)
    st.parent = root
    return root

# ------------------------------------------------------------------ HALO
def build_halo(coll, center=(0, 0, 0), R=46.0):
    cx, cy, cz = center
    def xz(pl, y=0.0):
        return [(cx + x, cy + y, cz + zz) for x, zz in pl]
    beads_on_circle("HaloBeadsOuter", R + 2.4, 0.0, 64, 1.9, coll, plane="XZ", center=center)
    rim_o = [(R * math.cos(2 * math.pi * i / 256), R * math.sin(2 * math.pi * i / 256)) for i in range(256)]
    r_in = R * 0.62
    rim_i = [(r_in * math.cos(2 * math.pi * i / 200), r_in * math.sin(2 * math.pi * i / 200)) for i in range(200)]
    strands("HaloRimOuter", [xz(rim_o)], 1.5, coll, closed=True)
    strands("HaloRimInner", [xz(rim_i)], 1.3, coll, closed=True)
    beads_on_circle("HaloBeadsInner", r_in - 2.0, 0.0, 44, 0.9, coll, plane="XZ", center=center)
    # radial lyre motif: mirrored scroll pair + teardrop, repeated
    N = 20
    motif = []
    band_mid = (R + r_in) / 2
    for k in range(N):
        a = 2 * math.pi * k / N
        local = []
        s = scroll((-2.6, band_mid - 2.0), 4.6, turns=1.35, hand=1, start_angle=math.pi * 0.1,
                   tail=(0.0, r_in + 0.8))
        local += [s, mirror_x(s)]
        local.append(petal_outline(6.5, 2.2, base=(0, band_mid + 2.0)))
        tiny = scroll((-5.2, R - 3.2), 1.8, turns=1.1, hand=-1, start_angle=0)
        local += [tiny, mirror_x(tiny)]
        for pl in local:
            pl = resample(pl, 0.35)
            # rotate so the motif's +Y axis points along angle a
            ca, sa = math.cos(a - math.pi / 2), math.sin(a - math.pi / 2)
            motif.append(xz([(x * ca - y * sa, x * sa + y * ca) for x, y in pl]))
    strands("HaloFiligree", motif, 0.7, coll)

# ------------------------------------------------------------------ render setup
def stage(cam_loc, target, lens=70, res=(1000, 1000), name="render"):
    scene = bpy.context.scene
    world = bpy.data.worlds.get("W") or bpy.data.worlds.new("W")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.42, 0.39, 0.36, 1)
    bg.inputs[1].default_value = 0.42
    scene.world = world
    if "Floor" not in bpy.data.objects:
        bpy.ops.mesh.primitive_plane_add(size=2000, location=(0, 0, -0.01))
        fl = bpy.context.active_object
        fl.name = "Floor"
        fm = bpy.data.materials.new("FloorM")
        fm.use_nodes = True
        fm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.55, 0.52, 0.48, 1)
        fl.data.materials.append(fm)
        bpy.ops.object.light_add(type="AREA", location=(-120, -160, 220))
        k = bpy.context.active_object
        k.data.energy, k.data.size = 2.2e6, 150
        k.rotation_euler = (Vector((0, 0, 30)) - k.location).to_track_quat("-Z", "Y").to_euler()
        bpy.ops.object.light_add(type="AREA", location=(170, -60, 120))
        f = bpy.context.active_object
        f.data.energy, f.data.size = 1.6e5, 200
        bpy.ops.object.light_add(type="AREA", location=(60, 220, 260))
        rim = bpy.context.active_object
        rim.data.energy, rim.data.size = 1.2e6, 120
        rim.rotation_euler = (Vector((0, 0, 90)) - rim.location).to_track_quat("-Z", "Y").to_euler()
        f.rotation_euler = (Vector((0, 0, 30)) - f.location).to_track_quat("-Z", "Y").to_euler()
        bpy.ops.object.camera_add()
        scene.camera = bpy.context.active_object
    cam = scene.camera
    cam.location = cam_loc
    cam.data.lens = lens
    cam.rotation_euler = (Vector(target) - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 64
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = res
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = -0.7
    scene.render.filepath = f"{OUT}/{name}.png"
    bpy.ops.render.render(write_still=True)

if __name__ == "__main__":
    WHAT = sys.argv[-1] if sys.argv[-1] in ("base", "lotus", "halo", "all") else "all"
    scene = new_scene()
    coll = scene.collection
    if WHAT == "base":
        top = build_base(coll)
        stage((0, -230, 95), (0, 0, 18), lens=70, name="base")
    elif WHAT == "lotus":
        build_lotus(coll, loc=(0, 0, 30), scale=2.0)
        stage((0, -120, 105), (0, 0, 38), lens=70, name="lotus")
    elif WHAT == "halo":
        build_halo(coll, center=(0, 0, 60))
        stage((0, -260, 75), (0, 0, 60), lens=60, name="halo")
    else:
        top = build_base(coll)
        build_halo(coll, center=(0, 22, top + 95), R=46)
        build_lotus(coll, loc=(-62, -8, top + 70), scale=1.0)
        build_lotus(coll, loc=(62, -8, top + 70), scale=1.0)
        stage((0, -330, 120), (0, 0, top + 45), lens=50, res=(900, 1100), name="assembly")
    bpy.ops.wm.save_as_mainfile(filepath=f"{OUT}/lakshmi_{WHAT}.blend")
