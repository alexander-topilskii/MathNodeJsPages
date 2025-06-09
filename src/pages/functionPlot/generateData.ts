import { create, all } from 'mathjs';
import type { Complex } from 'mathjs';

const math = create(all, {});

export interface FunctionPoint {
  x: number;
  y: number;
  re: number;
  im: number;
  mag: number;
}

export function generateSinData(size: number, range: number): FunctionPoint[] {
  const data: FunctionPoint[] = [];
  for (let i = 0; i < size; i++) {
    const x = (i / (size - 1)) * range - range / 2;
    for (let j = 0; j < size; j++) {
      const y = (j / (size - 1)) * range - range / 2;
      const z: Complex = math.sin(math.complex(x, y));
      const re = z.re as unknown as number;
      const im = z.im as unknown as number;
      const mag = math.abs(z) as unknown as number;
      data.push({ x, y, re, im, mag });
    }
  }
  return data;
}
