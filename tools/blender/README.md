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
| `fullwrap.py` | 360° garments: unwraps torso/lap/crown round a vertical axis, copies the photo where the front is visible, and fills sides, back and areas hidden by hands with [texture-synthesis](https://github.com/EmbarkStudios/texture-synthesis) inpainting before carving |
| `hair.py` | hair cap over the skull plus wavy strand-bundle locks that fall with gravity and are kept off the body |
| `statue.py` | assembly; `LANDMARKS` and region masks are read off the reference (`PX` = mm per pixel). `python statue.py align` renders an overlay against the photo; `front` = front-projection only; `full` = 360° build (front, 3/4 and back renders) |

`fullwrap.py` expects the texture-synthesis binary (release 0.8.2, linux-musl) at
`$TEXTURE_SYNTHESIS`.

Known limits: the halo and side drapes are flat openwork panels (as in the original);
synthesised back/side filigree follows the photo's style but is softer than the copied front.
