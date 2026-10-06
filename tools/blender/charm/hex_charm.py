"""Parametric Hex Charm Keychain built in Blender (bpy).

Every dimension is in PARAMS (millimetres). Override any of them with a JSON
string as the first CLI arg, e.g.  python hex_charm.py '{"cell": 6, "thickness": 5}'
Output: .blend (live, non-destructive modifier stack), .stl, .glb and renders.
"""
import bpy, bmesh, json, math, sys, os
from mathutils import Vector

PARAMS = dict(
    size=40.0,        # outer hexagon, flat-to-flat
    thickness=4.0,
    border=3.0,       # solid rim around the honeycomb
    cell=5.0,         # honeycomb cell, flat-to-flat
    wall=1.4,         # wall between cells
    corner_round=1.0, # outer edge rounding
    cut_round=0.3,    # chamfer on honeycomb + hole edges
    tab_radius=5.0,   # keyring tab
    hole_radius=2.2,
    tag="v1",
    color=(0.9, 0.32, 0.06),
)
if len(sys.argv) > 1 and sys.argv[-1].startswith("{"):
    PARAMS.update(json.loads(sys.argv[-1]))
P = PARAMS
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 0.001
scene.unit_settings.length_unit = "MILLIMETERS"


def hex_prism(name, apothem, depth, center=(0, 0), z0=None, coll=None, start=90):
    """Hexagonal prism (start=90 pointy-top, start=0 flat-top) as a clean 8-face mesh."""
    r = apothem / math.cos(math.radians(30))
    z0 = -depth / 2 if z0 is None else z0
    bm = bmesh.new()
    ring = [bm.verts.new((center[0] + r * math.cos(math.radians(start + 60 * k)),
                          center[1] + r * math.sin(math.radians(start + 60 * k)), z0))
            for k in range(6)]
    face = bm.faces.new(ring)
    ext = bmesh.ops.extrude_face_region(bm, geom=[face])
    top = [g for g in ext["geom"] if isinstance(g, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=top, vec=(0, 0, depth))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    (coll or scene.collection).objects.link(ob)
    return ob


def cylinder(name, radius, depth, center, coll=None, verts=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth,
                                        location=(center[0], center[1], 0))
    ob = bpy.context.active_object
    ob.name = name
    if coll:
        for c in ob.users_collection:
            c.objects.unlink(ob)
        coll.objects.link(ob)
    return ob


def inside_hex(pt, apothem):
    for ang in (0, 60, 120):
        n = (math.cos(math.radians(ang)), math.sin(math.radians(ang)))
        if abs(pt[0] * n[0] + pt[1] * n[1]) > apothem + 1e-6:
            return False
    return True


cutters = bpy.data.collections.new("Cutters")
scene.collection.children.link(cutters)

T = P["thickness"]
A = P["size"] / 2
body = hex_prism("HexCharm", A, T)
def round_silhouette(ob):
    m = ob.modifiers.new("RoundSilhouette", "BEVEL")
    m.width = P["corner_round"]
    m.segments = 5
    m.limit_method = "ANGLE"
    m.angle_limit = math.radians(25)
    m.profile = 0.6
    return m
round_silhouette(body)

# keyring tab at the top vertex
R_out = A / math.cos(math.radians(30))
tab_c = (0, R_out - P["tab_radius"] * 0.35)
tab = cylinder("Tab", P["tab_radius"], T, tab_c, coll=cutters)
round_silhouette(tab)

# honeycomb cells: keep only cells fully inside the inset hexagon
inner = A - P["border"]
ca = P["cell"] / 2
cr = ca / math.cos(math.radians(30))
pitch = P["cell"] + P["wall"]
row_h = pitch * math.sqrt(3) / 2
cells = []
n = int(A / row_h) + 2
for j in range(-n, n + 1):
    for i in range(-n, n + 1):
        cx = i * row_h
        cy = j * pitch + (i % 2) * pitch / 2
        corners = [(cx + cr * math.cos(math.radians(60 * k)),
                    cy + cr * math.sin(math.radians(60 * k))) for k in range(6)]
        if all(inside_hex(c, inner) for c in corners) and \
           math.dist((cx, cy), tab_c) > P["tab_radius"] + ca:
            cells.append(hex_prism(f"Cell_{i}_{j}", ca, T + 2, (cx, cy), coll=cutters, start=0))
# join cells into one cutter object (one boolean instead of dozens)
bpy.ops.object.select_all(action="DESELECT")
for c in cells:
    c.select_set(True)
bpy.context.view_layer.objects.active = cells[0]
bpy.ops.object.join()
honeycomb = bpy.context.active_object
honeycomb.name = "HoneycombCutter"

hole = cylinder("KeyHole", P["hole_radius"], T + 2, tab_c, coll=cutters)

for ob in cutters.objects:
    ob.display_type = "WIRE"
    ob.hide_render = True

# non-destructive modifier stack — this is what stays editable in Blender
def boolean(op, target):
    m = body.modifiers.new(f"{op.title()}_{target.name}", "BOOLEAN")
    m.operation = op
    m.object = target
    m.solver = "EXACT"
    return m

boolean("UNION", tab)
boolean("DIFFERENCE", honeycomb)
boolean("DIFFERENCE", hole)
bev = body.modifiers.new("SoftenCutEdges", "BEVEL")
bev.width = P["cut_round"]
bev.segments = 2
bev.limit_method = "ANGLE"
bev.angle_limit = math.radians(40)
bev.harden_normals = True
body.modifiers.new("WeightedNormals", "WEIGHTED_NORMAL").keep_sharp = True
bpy.context.view_layer.objects.active = body
for poly in body.data.polygons:
    poly.use_smooth = True
for k, v in P.items():
    body[k] = v  # parameters visible in the N-panel / Custom Properties

# material: matte PLA
mat = bpy.data.materials.new("PLA_Orange")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (*P["color"], 1)
bsdf.inputs["Roughness"].default_value = 0.42
body.data.materials.append(mat)

# ---- evaluate, validate, export ----
dg = bpy.context.evaluated_depsgraph_get()
ev = body.evaluated_get(dg)
me = bpy.data.meshes.new_from_object(ev)
bm = bmesh.new()
bm.from_mesh(me)
nonmanifold = sum(1 for e in bm.edges if not e.is_manifold)
vol = bm.calc_volume()
bm.free()
mass_g = vol / 1000 * 1.24 * 0.6  # PLA 1.24 g/cm3, ~60% effective with 15% infill + walls
print(f"[{P['tag']}] cells={len(cells)} faces={len(me.polygons)} non_manifold_edges={nonmanifold} "
      f"volume={vol:.0f}mm3 est_mass={mass_g:.1f}g")

bpy.ops.object.select_all(action="DESELECT")
body.select_set(True)
bpy.ops.wm.stl_export(filepath=f"{OUT}/hex_charm_{P['tag']}.stl", export_selected_objects=True,
                      apply_modifiers=True, global_scale=1.0)
bpy.ops.export_scene.gltf(filepath=f"{OUT}/hex_charm_{P['tag']}.glb", use_selection=True,
                          export_apply=True, export_yup=True)

# ---- render ----
world = bpy.data.worlds.new("W")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.92, 0.92, 0.93, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.35
scene.world = world
bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 0, -T / 2))
floor = bpy.context.active_object
fm = bpy.data.materials.new("Floor")
fm.use_nodes = True
fm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.95, 0.95, 0.95, 1)
floor.data.materials.append(fm)
bpy.ops.object.light_add(type="AREA", location=(-40, -50, 90))
key = bpy.context.active_object
key.data.energy = 3e5  # scene units are mm, lights think metres
key.data.size = 60
key.rotation_euler = (math.radians(35), 0, math.radians(-40))
bpy.ops.object.light_add(type="SUN", location=(0, 0, 100))
bpy.context.active_object.data.energy = 1.2
bpy.context.active_object.rotation_euler = (math.radians(30), math.radians(20), math.radians(60))

scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = scene.render.resolution_y = 900
scene.view_settings.view_transform = "AgX"
scene.view_settings.look = "AgX - Punchy"
scene.view_settings.exposure = -0.3

bpy.ops.object.camera_add()
cam = bpy.context.active_object
scene.camera = cam
cam.data.lens = 85
for view, loc in {"persp": (55, -95, 85), "top": (0, 0, 200)}.items():
    cam.location = loc
    d = Vector((0, 2, 0)) - cam.location
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    if view == "top":
        cam.data.lens = 85
        cam.data.type = "ORTHO"
        cam.data.ortho_scale = P["size"] * 1.55
    scene.render.filepath = f"{OUT}/hex_charm_{P['tag']}_{view}.png"
    bpy.ops.render.render(write_still=True)

bpy.ops.wm.save_as_mainfile(filepath=f"{OUT}/hex_charm_{P['tag']}.blend")
