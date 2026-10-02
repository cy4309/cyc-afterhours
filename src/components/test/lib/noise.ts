export function hash(x: number, y: number, z = 0) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}

export function valueNoise(x: number, y: number, z = 0) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const w = fz * fz * (3 - 2 * fz);
  const n = (i: number, j: number, k: number) => hash(i, j, k);
  const x1 = n(ix, iy, iz) * (1 - u) + n(ix + 1, iy, iz) * u;
  const x2 = n(ix, iy + 1, iz) * (1 - u) + n(ix + 1, iy + 1, iz) * u;
  const x3 = n(ix, iy, iz + 1) * (1 - u) + n(ix + 1, iy, iz + 1) * u;
  const x4 = n(ix, iy + 1, iz + 1) * (1 - u) + n(ix + 1, iy + 1, iz + 1) * u;
  const y1 = x1 * (1 - v) + x2 * v;
  const y2 = x3 * (1 - v) + x4 * v;
  return y1 * (1 - w) + y2 * w;
}

export function fbm(x: number, y: number, z = 0) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 5; i += 1) {
    sum += amp * valueNoise(x * freq, y * freq, z * freq);
    freq *= 2.05;
    amp *= 0.5;
  }
  return sum;
}
