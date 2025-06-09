import { ComputeEngine } from '@cortex-js/compute-engine';
import { create, all } from 'mathjs';
import type { Complex } from 'mathjs';

const ce = new ComputeEngine();
const math = create(all, {});

export interface FormulaData {
  realPositions: Float32Array;
  imagPositions: Float32Array;
  realPoints: { x: number; y: number }[];
  imagPoints: { x: number; y: number }[];
}

export function computeFormula(
  latex: string,
  domainStart: number,
  domainEnd: number,
  steps = 200,
): FormulaData {
  const expr = ce.parse(latex);
  const ascii = expr.toString();
  let compiled;
  try {
    compiled = math.compile(ascii);
  } catch {
    throw new Error('Invalid formula');
  }
  const step = (domainEnd - domainStart) / steps;
  const xValues: number[] = [];
  for (let x = domainStart; x <= domainEnd; x += step) xValues.push(x);

  const realPositions = new Float32Array(xValues.length * 3);
  const imagPositions = new Float32Array(xValues.length * 3);
  xValues.forEach((x, i) => {
    const v = compiled.evaluate({ x }) as number | Complex;
    const re = typeof v === 'number' ? v : (v.re as unknown as number) ?? 0;
    const im = typeof v === 'number' ? 0 : (v.im as unknown as number) ?? 0;
    realPositions[i * 3] = x;
    realPositions[i * 3 + 1] = re;
    realPositions[i * 3 + 2] = 0;
    imagPositions[i * 3] = x;
    imagPositions[i * 3 + 1] = 0;
    imagPositions[i * 3 + 2] = im;
  });

  const realPoints = xValues.map((x, i) => ({ x, y: realPositions[i * 3 + 1] }));
  const imagPoints = xValues.map((x, i) => ({ x, y: imagPositions[i * 3 + 2] }));

  return { realPositions, imagPositions, realPoints, imagPoints };
}
