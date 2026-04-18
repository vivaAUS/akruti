import * as THREE from 'three';
import {
  Brush, Evaluator, ADDITION, SUBTRACTION, INTERSECTION,
} from 'three-bvh-csg';

const evaluator = new Evaluator();

function toBrush(input) {
  if (input instanceof Brush) return input;
  if (input instanceof THREE.BufferGeometry) {
    const b = new Brush(input);
    b.updateMatrixWorld();
    return b;
  }
  if (input?.isMesh) {
    const b = new Brush(input.geometry.clone());
    b.position.copy(input.position);
    b.quaternion.copy(input.quaternion);
    b.scale.copy(input.scale);
    b.updateMatrixWorld();
    return b;
  }
  throw new Error('csg: expected BufferGeometry, Mesh, or Brush');
}

function runOp(a, b, op) {
  const ba = toBrush(a);
  const bb = toBrush(b);
  const result = evaluator.evaluate(ba, bb, op);
  return result.geometry;
}

export function union(a, b) { return runOp(a, b, ADDITION); }
export function subtract(a, b) { return runOp(a, b, SUBTRACTION); }
export function intersect(a, b) { return runOp(a, b, INTERSECTION); }

export function unionMany(items) {
  if (!items?.length) return new THREE.BufferGeometry();
  let acc = toBrush(items[0]);
  for (let i = 1; i < items.length; i++) {
    const next = toBrush(items[i]);
    const result = evaluator.evaluate(acc, next, ADDITION);
    acc = new Brush(result.geometry);
    acc.updateMatrixWorld();
  }
  return acc.geometry;
}

export { Brush };
