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
  imagArgRealPositions?: Float32Array;
  imagArgImagPositions?: Float32Array;
  imagArgRealPoints?: { x: number; y: number }[];
  imagArgImagPoints?: { x: number; y: number }[];
  grid?: { x: number; y: number; re: number; im: number }[];
}

export function computeFormula(
  latex: string,
  domainStart: number,
  domainEnd: number,
  imagStart?: number,
  imagEnd?: number,
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
  const stepImag =
    typeof imagStart === 'number' && typeof imagEnd === 'number'
      ? (imagEnd - imagStart) / steps
      : 0;
  const xValues: [number, number][] = [];
  if (stepImag === 0) {
    for (let x = domainStart; x <= domainEnd; x += step) {
      xValues.push([x, imagStart ?? 0]);
    }
  } else {
    for (let x = domainStart; x <= domainEnd; x += step) {
      for (let y = imagStart!; y <= imagEnd!; y += stepImag) {
        xValues.push([x, y]);
      }
    }
  }

  const realPositions = new Float32Array(xValues.length * 3);
  const imagPositions = new Float32Array(xValues.length * 3);
  xValues.forEach(([x, y], i) => {
    const v = compiled.evaluate({ x: math.complex(x, y) }) as number | Complex;
    const re = typeof v === 'number' ? v : (v.re as unknown as number) ?? 0;
    const im = typeof v === 'number' ? 0 : (v.im as unknown as number) ?? 0;
    realPositions[i * 3] = x;
    realPositions[i * 3 + 1] = re;
    realPositions[i * 3 + 2] = 0;
    imagPositions[i * 3] = x;
    imagPositions[i * 3 + 1] = 0;
    imagPositions[i * 3 + 2] = im;
  });

  const realPoints = xValues.map(([x], i) => ({ x, y: realPositions[i * 3 + 1] }));
  const imagPoints = xValues.map(([x], i) => ({ x, y: imagPositions[i * 3 + 2] }));

  let imagArgRealPositions: Float32Array | undefined;
  let imagArgImagPositions: Float32Array | undefined;
  let imagArgRealPoints: { x: number; y: number }[] | undefined;
  let imagArgImagPoints: { x: number; y: number }[] | undefined;
  let grid: { x: number; y: number; re: number; im: number }[] | undefined;

  if (
    typeof imagStart === 'number' &&
    typeof imagEnd === 'number' &&
    !Number.isNaN(imagStart) &&
    !Number.isNaN(imagEnd)
  ) {
    const stepImag = (imagEnd - imagStart) / steps;
    const yValues: number[] = [];
    for (let y = imagStart; y <= imagEnd; y += stepImag) yValues.push(y);
    imagArgRealPositions = new Float32Array(yValues.length * 3);
    imagArgImagPositions = new Float32Array(yValues.length * 3);
    yValues.forEach((y, i) => {
      const arg = math.complex(0, y);
      const v = compiled.evaluate({ x: arg }) as number | Complex;
      const re = typeof v === 'number' ? v : (v.re as unknown as number) ?? 0;
      const im = typeof v === 'number' ? 0 : (v.im as unknown as number) ?? 0;
      imagArgRealPositions![i * 3] = 0;
      imagArgRealPositions![i * 3 + 1] = re;
      imagArgRealPositions![i * 3 + 2] = y;
      imagArgImagPositions![i * 3] = 0;
      imagArgImagPositions![i * 3 + 1] = im;
      imagArgImagPositions![i * 3 + 2] = y;
    });
    imagArgRealPoints = yValues.map((y, i) => ({ x: y, y: imagArgRealPositions![i * 3 + 1] }));
    imagArgImagPoints = yValues.map((y, i) => ({ x: y, y: imagArgImagPositions![i * 3 + 1] }));
    grid = xValues.map(([xVal, yVal], idx) => ({
      x: xVal,
      y: yVal,
      re: realPositions[idx * 3 + 1],
      im: imagPositions[idx * 3 + 2],
    }));
  }

  return {
    realPositions,
    imagPositions,
    realPoints,
    imagPoints,
    imagArgRealPositions,
    imagArgImagPositions,
    imagArgRealPoints,
    imagArgImagPoints,
    grid,
  };
}
