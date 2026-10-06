# Blender model generators

Scripts that build print models procedurally with Blender's Python API (`bpy` 5.2),
so every model can be changed by editing numbers and re-running the script.

Setup (headless, no GUI needed):

```bash
python3 -m venv .venv && .venv/bin/pip install bpy==5.2.* opencv-python-headless scikit-image pillow
# MPFB2 (human base mesh) is installed as a Blender extension:
git clone --depth 1 https://github.com/makehumancommunity/mpfb2
cp -r mpfb2/src/mpfb "$(.venv/bin/python -c 'import bpy;print(bpy.utils.user_resource("EXTENSIONS", path="user_default", create=True))')/"
```

## charm/hex_charm.py
Parametric hex keychain. `python hex_charm.py '{"cell":3.2,"size":36}'` writes .blend/.stl/.glb + renders.

## lakshmi/
Seated four-armed Lakshmi statue built from `reference.jpg`.

| module | role |
|---|---|
| `kit.py` | ornament kit: filigree strands, bead rings, petals, lotus flower, halo, procedural base (`python kit.py base\|lotus\|halo`) |
| `body.py` | MPFB2 human (all-quad mesh + rig), face tuning, padmasana, 2-bone IK that puts each hand at a measured landmark, extra arm pair |
| `relief.py` | photo → filigree: finds holes/material in the reference, gives strands a rounded profile, projects them onto 3D carriers (or wraps a repeating band round a cylinder) as real cut-through geometry |
| `statue.py` | assembly; `LANDMARKS` and region masks are read off the reference (`PX` = mm per pixel). `python statue.py align` renders an overlay against the photo, `python statue.py full` builds and renders |

Known limits: filigree projected from one front photo reads best from the front; the
halo, side drapes and lap sides are relief panels rather than fully sculpted volumes.
