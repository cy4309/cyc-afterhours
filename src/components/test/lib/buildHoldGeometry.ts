import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";
import { HOLE_RADIUS } from "./constants";
import { fbm } from "./noise";

function collapseDrawRange(geometry: THREE.BufferGeometry) {
  const start = geometry.drawRange.start;
  const count = geometry.drawRange.count;
  const posAttr = geometry.attributes.position;
  if (!Number.isFinite(count) || count < 0 || count >= posAttr.count) {
    return geometry;
  }

  const trimmed = new THREE.BufferGeometry();
  const from = start * 3;
  const to = (start + count) * 3;
  trimmed.setAttribute(
    "position",
    new THREE.BufferAttribute((posAttr.array as Float32Array).slice(from, to), 3),
  );
  return trimmed;
}

export function buildHoldGeometry() {
  const base = new THREE.IcosahedronGeometry(0.62, 5);
  const pos = base.attributes.position;
  const v = new THREE.Vector3();
  const dir = new THREE.Vector3();

  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i);
    v.x *= 1.4;
    v.y *= 0.84;
    v.z *= 0.56;
    if (v.z < 0) v.z *= 0.42;

    const coarse = fbm(v.x * 2.8, v.y * 2.8, v.z * 3.1);
    const fine = fbm(v.x * 9.5, v.y * 9.5, v.z * 8.6);
    dir.copy(v).normalize();
    v.addScaledVector(dir, (coarse - 0.4) * 0.13 + (fine - 0.5) * 0.04);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  base.computeVertexNormals();

  const hold = new Brush(base);
  hold.updateMatrixWorld();

  const cutter = new Brush(
    new THREE.CylinderGeometry(HOLE_RADIUS, HOLE_RADIUS, 1.8, 32),
  );
  cutter.rotation.x = Math.PI / 2;
  cutter.updateMatrixWorld();

  const result = new Evaluator().evaluate(hold, cutter, SUBTRACTION);
  const trimmed = collapseDrawRange(result.geometry);
  trimmed.deleteAttribute("normal");
  trimmed.deleteAttribute("uv");
  trimmed.deleteAttribute("uv2");
  trimmed.deleteAttribute("color");
  const geo = mergeVertices(trimmed, 0.001);
  result.geometry.dispose();

  const out = geo.attributes.position;
  const colors = new Float32Array(out.count * 3);
  for (let i = 0; i < out.count; i += 1) {
    v.fromBufferAttribute(out, i);
    const grain = fbm(v.x * 7.2, v.y * 7.2, v.z * 8.4);
    const pit = fbm(v.x * 22, v.y * 22, v.z * 18);
    const r = Math.hypot(v.x, v.y);
    const holeShade = r < HOLE_RADIUS + 0.05 ? 0.14 : 0;
    const shade = 0.46 + grain * 0.48 - pit * 0.2 - holeShade;
    colors[i * 3] = shade;
    colors[i * 3 + 1] = shade;
    colors[i * 3 + 2] = shade;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  return geo;
}
