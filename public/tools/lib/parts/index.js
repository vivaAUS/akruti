import { rectBox, cylBox } from './box.js';
import { snapLid } from './snapLid.js';
import { screwLid } from './screwLid.js';
import { hinge } from './hinge.js';
import { texture } from './texture.js';
import { sphere, cone, hole, magnet, insert, divider } from './primitives.js';

export const partRegistry = {
  box:      rectBox,
  cyl:      cylBox,
  sphere,
  cone,
  snapLid,
  screwLid,
  hinge,
  texture,
  hole,
  magnet,
  insert,
  divider,
};

export const partTypeList = [
  { id: 'box',      label: 'Box (rect)',       group: 'Solids' },
  { id: 'cyl',      label: 'Cylinder',         group: 'Solids' },
  { id: 'sphere',   label: 'Sphere',           group: 'Solids' },
  { id: 'cone',     label: 'Cone',             group: 'Solids' },
  { id: 'snapLid',  label: 'Snap Lid',         group: 'Closures' },
  { id: 'screwLid', label: 'Screw Lid',        group: 'Closures' },
  { id: 'hinge',    label: 'Hinge',            group: 'Closures' },
  { id: 'divider',  label: 'Dividers',         group: 'Structure' },
  { id: 'hole',     label: 'Hole',             group: 'Cutouts' },
  { id: 'magnet',   label: 'Magnet Pocket',    group: 'Cutouts' },
  { id: 'insert',   label: 'Heat-set Insert',  group: 'Cutouts' },
  { id: 'texture',  label: 'Face Texture',     group: 'Surface' },
];
