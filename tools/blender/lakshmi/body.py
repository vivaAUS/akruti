"""Seated four-armed figure from the MPFB2 human (quad mesh + rig).

The figure is posed in the statue's millimetre frame: hands are placed with a
two-bone IK solve at positions measured off the reference image (see LANDMARKS
in statue.py), so changing a landmark moves the hand, not a guessed angle.
"""
import bpy, bmesh, importlib, math, os
from mathutils import Vector, Matrix
import addon_utils

MPFB_TARGETS = None
HEAD_SCALE = 1.18


def load_mpfb():
    global MPFB_TARGETS
    addon_utils.enable("bl_ext.user_default.mpfb", default_set=True)
    m = lambda path, key: getattr(importlib.import_module("bl_ext.user_default.mpfb." + path), key)
    loc = m("services.locationservice", "LocationService")
    MPFB_TARGETS = loc.get_mpfb_data("targets")
    return (m("services.humanservice", "HumanService"),
            m("entities.objectproperties", "HumanObjectProperties"),
            m("services.targetservice", "TargetService"))


MACRO = dict(gender=0.0, age=0.42, muscle=0.3, weight=0.45, height=0.35,
             proportions=0.85, asian=0.65, african=0.05, caucasian=0.30)
# serene, rounded, slightly stylised face (target file -> weight)
FACE = {
    "head/head-round": 0.55,
    "head/head-scale-vert-incr": 0.25,
    "head/head-scale-horiz-incr": 0.20,
    "eyes/l-eye-scale-incr": 0.55, "eyes/r-eye-scale-incr": 0.55,
    "eyes/l-eye-height2-incr": 0.35, "eyes/r-eye-height2-incr": 0.35,
    "eyes/l-eye-corner1-up": 0.25, "eyes/r-eye-corner1-up": 0.25,
    "nose/nose-scale-horiz-decr": 0.35, "nose/nose-scale-vert-decr": 0.2,
    "nose/nose-point-width-decr": 0.3,
    "mouth/mouth-scale-horiz-decr": 0.25, "mouth/mouth-upperlip-volume-incr": 0.2,
    "chin/chin-width-decr": 0.25, "chin/chin-prominent-decr": 0.2,
    "cheek/l-cheek-volume-incr": 0.35, "cheek/r-cheek-volume-incr": 0.35,
    "expression/units/asian/mouth-corner-puller": 0.45,
    "neck/neck-scale-horiz-decr": 0.2,
    "breast/nipple-point-decr": 1.0, "breast/nipple-size-decr": 1.0, "breast/breast-point-decr": 0.6,
    "torso/torso-scale-horiz-decr": 0.25,
    "torso/measure-waist-circ-decr": 0.45, "torso/measure-shoulder-dist-decr": 0.9,
    "arms/r-lowerarm-scale-horiz-decr": 0.3, "arms/l-lowerarm-scale-horiz-decr": 0.3,
    "arms/r-upperarm-scale-horiz-decr": 0.3, "arms/l-upperarm-scale-horiz-decr": 0.3,
}


def make_human(name):
    HS, HOP, TS = load_mpfb()
    h = HS.create_human()
    for k, v in MACRO.items():
        HOP.set_value(k, v, entity_reference=h)
    TS.reapply_macro_details(h)
    for rel, w in FACE.items():
        path = os.path.join(MPFB_TARGETS, rel + ".target.gz")
        if os.path.exists(path):
            TS.load_target(h, path, weight=w)
        else:
            print("missing target", rel)
    rig = HS.add_builtin_rig(h, "default")
    h.name, rig.name = name, name + "_rig"
    return h, rig


# ------------------------------------------------------------------ posing helpers
def _upd():
    bpy.context.view_layer.update()


def aim(rig, bone, direction, roll_deg=None):
    """Rotate a pose bone (armature space) so head->tail points along direction."""
    pb = rig.pose.bones[bone]
    _upd()
    m = pb.matrix.copy()
    d = Vector(direction).normalized()
    cur = (m.to_3x3() @ Vector((0, 1, 0))).normalized()
    rot = cur.rotation_difference(d).to_matrix().to_4x4()
    if roll_deg is not None:
        rot = Matrix.Rotation(math.radians(roll_deg), 4, d) @ rot
    head = m.to_translation()
    pb.matrix = Matrix.Translation(head) @ rot @ Matrix.Translation(-head) @ m
    _upd()


def bone_head(rig, bone):
    _upd()
    return rig.pose.bones[bone].matrix.to_translation()


def bone_len(rig, bone):
    return rig.data.bones[bone].length


def solve_arm(rig, side, wrist_target, pole, hand_dir, roll=None):
    """Two-bone IK: put the wrist at wrist_target (armature space), elbow toward pole."""
    up = [f"upperarm01.{side}", f"upperarm02.{side}"]
    lo = [f"lowerarm01.{side}", f"lowerarm02.{side}"]
    S = bone_head(rig, up[0])
    a = sum(bone_len(rig, b) for b in up)
    b = sum(bone_len(rig, x) for x in lo)
    T = Vector(wrist_target)
    D = T - S
    d = min(D.length, (a + b) * 0.999)
    u = D.normalized()
    x = (a * a - b * b + d * d) / (2 * d)
    h = math.sqrt(max(a * a - x * x, 0))
    p = Vector(pole) - u * Vector(pole).dot(u)
    p = p.normalized() if p.length > 1e-6 else Vector((0, 0, -1))
    E = S + u * x + p * h
    for bn in up:
        aim(rig, bn, E - S)
    W = S + u * d
    for bn in lo:
        aim(rig, bn, W - E)
    aim(rig, f"wrist.{side}", hand_dir, roll)


def curl(rig, side, deg, fingers=(1, 2, 3, 4, 5), thumb_scale=0.4):
    for f in fingers:
        for j in (1, 2, 3):
            n = f"finger{f}-{j}.{side}"
            if n in rig.pose.bones:
                pb = rig.pose.bones[n]
                pb.rotation_mode = "XYZ"
                pb.rotation_euler.x = math.radians(deg * (thumb_scale if f == 1 else 1.0))
    _upd()


def seat(rig):
    """Padmasana: thighs forward and out, shins folded across."""
    for side, sx in (("L", 1), ("R", -1)):
        for b in (f"upperleg01.{side}", f"upperleg02.{side}"):
            aim(rig, b, (0.62 * sx, -0.78, -0.08))
    for b in ("lowerleg01.L", "lowerleg02.L"):
        aim(rig, b, (-0.97, 0.10, 0.10))
    for b in ("lowerleg01.R", "lowerleg02.R"):
        aim(rig, b, (0.97, 0.18, 0.02))
    aim(rig, "foot.L", (-0.3, 0.2, 0.93))
    aim(rig, "foot.R", (0.3, 0.2, 0.93))


def bake(h):
    """Bake shape keys + pose into plain editable geometry."""
    bpy.context.view_layer.objects.active = h
    bpy.ops.object.select_all(action="DESELECT")
    h.select_set(True)
    if h.data.shape_keys:
        bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
    for m in list(h.modifiers):
        if m.type == "ARMATURE":
            bpy.ops.object.modifier_apply(modifier=m.name)
    return h


def evaluated_bounds(ob):
    dg = bpy.context.evaluated_depsgraph_get()
    me = ob.evaluated_get(dg).to_mesh()
    zs = [v.co.z for v in me.vertices]
    ob.evaluated_get(dg).to_mesh_clear()
    return min(zs), max(zs)


def keep_groups(ob, groups, thresh=0.5):
    """Delete every vertex whose summed weight in `groups` is below thresh."""
    idx = {ob.vertex_groups[g].index for g in groups if g in ob.vertex_groups}
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    dl = bm.verts.layers.deform.active
    kill = [v for v in bm.verts if sum(w for gi, w in v[dl].items() if gi in idx) < thresh]
    bmesh.ops.delete(bm, geom=kill, context="VERTS")
    bm.to_mesh(ob.data)
    bm.free()


ARM_GROUPS = lambda s: ([f"upperarm02.{s}", f"lowerarm01.{s}", f"lowerarm02.{s}", f"wrist.{s}"]
                        + [f"finger{f}-{j}.{s}" for f in range(1, 6) for j in (1, 2, 3)]
                        + [f"metacarpal{f}.{s}" for f in range(1, 5)])


def place(mesh, rig, k, off):
    """Scale/move via the rig only (the mesh is its child)."""
    target = rig if mesh.parent == rig else mesh
    for ob in {rig, target}:
        ob.scale = (k, k, k)
        ob.location = off
    _upd()


def freeze(ob):
    """Detach from the rig and bake the world transform into the mesh data."""
    mw = ob.matrix_world.copy()
    ob.parent = None
    ob.data.transform(mw)
    ob.matrix_world = Matrix.Identity(4)
    _upd()


def build_figure(L):
    """Return (body, upper_arms) posed and placed in the statue frame (mm).

    L: landmark dict in mm (see statue.py).
    """
    body, rig = make_human("Body")
    seat(rig)
    zmin, zmax = evaluated_bounds(body)
    k = (L["skull_top_z"] - L["seat_z"]) / (zmax - zmin)
    off = Vector((0, L["body_y"], L["seat_z"] - zmin * k))
    to_local = lambda p: (Vector(p) - off) / k
    place(body, rig, k, off)

    solve_arm(rig, "R", to_local(L["abhaya_wrist"]), pole=(-0.4, 0.5, -1), hand_dir=(0.05, -0.25, 1), roll=-80)
    solve_arm(rig, "L", to_local(L["varada_wrist"]), pole=(1, 0.6, -0.3), hand_dir=(0.35, -0.45, -0.82), roll=20)
    curl(rig, "R", 3)
    curl(rig, "L", 10)
    rig.pose.bones["head"].scale = (HEAD_SCALE,) * 3
    _upd()
    marks = {n: rig.matrix_world @ rig.pose.bones[n].head for n in ("eye.L", "eye.R", "head", "neck01")}
    marks["head_top"] = rig.matrix_world @ rig.pose.bones["head"].tail
    marks["hand_R"] = rig.matrix_world @ rig.pose.bones["wrist.R"].head
    marks["hand_L"] = rig.matrix_world @ rig.pose.bones["wrist.L"].head
    marks["elbow_R"] = rig.matrix_world @ rig.pose.bones["lowerarm01.R"].head
    marks["elbow_L"] = rig.matrix_world @ rig.pose.bones["lowerarm01.L"].head
    body = bake(body)

    arms, rig2 = make_human("UpperArms")
    seat(rig2)
    place(arms, rig2, k, off)
    solve_arm(rig2, "R", to_local(L["lotus_wrist_R"]), pole=(-1, 0.5, -0.8), hand_dir=(-0.1, -0.15, 1), roll=0)
    solve_arm(rig2, "L", to_local(L["lotus_wrist_L"]), pole=(1, 0.5, -0.8), hand_dir=(0.1, -0.15, 1), roll=0)
    curl(rig2, "R", 70)
    curl(rig2, "L", 70)
    for sd in "LR":
        marks[f"lotus_wrist_{sd}"] = rig2.matrix_world @ rig2.pose.bones[f"wrist.{sd}"].head
        marks[f"lotus_elbow_{sd}"] = rig2.matrix_world @ rig2.pose.bones[f"lowerarm01.{sd}"].head
        marks[f"lotus_hand_{sd}"] = rig2.matrix_world @ rig2.pose.bones[f"wrist.{sd}"].tail
    arms = bake(arms)
    keep_groups(arms, ARM_GROUPS("L") + ARM_GROUPS("R"))

    for ob, r in ((body, rig), (arms, rig2)):
        freeze(ob)
        bpy.data.objects.remove(r)
    for ob in (body, arms):
        for p in ob.data.polygons:
            p.use_smooth = True
        ob.modifiers.new("Smooth", "SUBSURF").levels = 1
    return body, arms, k, marks


TORSO_GROUPS = (["spine01", "spine02", "spine03", "spine04", "spine05", "neck01", "neck02"]
                + [f"{b}.{s}" for s in "LR" for b in ("breast", "clavicle", "shoulder01",
                                                       "upperarm01", "upperarm02", "pelvis")])


def torso_carrier(body, name="TorsoCarrier"):
    """Copy of the body with only torso + upper-arm (sleeve) skin: the dress sits on this."""
    c = body.copy()
    c.data = body.data.copy()
    c.name = name
    bpy.context.scene.collection.objects.link(c)
    keep_groups(c, TORSO_GROUPS, 0.35)
    c.hide_render = True
    return c


LEG_GROUPS = [f"{b}.{s}" for s in "LR" for b in ("upperleg01", "upperleg02", "lowerleg01", "lowerleg02", "foot")] + \
             [f"toe{t}-{j}.{s}" for s in "LR" for t in range(1, 6) for j in (1, 2, 3)]


def drop_groups(ob, groups, thresh=0.5):
    """Delete vertices mostly weighted to `groups` (e.g. legs hidden under the sari)."""
    idx = {ob.vertex_groups[g].index for g in groups if g in ob.vertex_groups}
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    dl = bm.verts.layers.deform.active
    kill = [v for v in bm.verts if sum(w for gi, w in v[dl].items() if gi in idx) >= thresh]
    bmesh.ops.delete(bm, geom=kill, context="VERTS")
    bm.to_mesh(ob.data)
    bm.free()
