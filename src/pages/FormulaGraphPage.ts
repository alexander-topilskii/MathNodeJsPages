import * as d3 from 'd3';
import { ComputeEngine } from '@cortex-js/compute-engine';
import 'mathlive';
import { create, all } from 'mathjs';
import type { Complex } from 'mathjs';

/**
 * Page that lets the user input a formula and plots it using D3.
 * The formula is entered with a MathLive <math-field> and parsed
 * using CortexJS Compute Engine.
 */
export function renderFormulaGraphPage(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <div style="margin-bottom:8px;">
      <label>Formula: <math-field id="formula-input">\\sin(x)</math-field></label>
    </div>
    <div style="margin-bottom:8px;">
      <label>Domain start: <input id="domain-start" type="number" value="0" step="any"></label>
      <label style="margin-left:4px;">Domain end: <input id="domain-end" type="number" value="6.28" step="any"></label>
      <button id="plot-btn" style="margin-left:4px;">Plot</button>
    </div>
    <div style="margin-bottom:8px;">
      <label><input type="checkbox" id="show-real" checked> Real part</label>
      <label style="margin-left:4px;"><input type="checkbox" id="show-imag"> Imag part</label>
    </div>
    <div id="plot-container" style="width:100%;height:400px;position:relative;"></div>
  `;

  const ce = new ComputeEngine();
  const math = create(all, {});
  const formulaField = appElement.querySelector('math-field#formula-input') as HTMLElement & { value: string };
  const startInput = appElement.querySelector<HTMLInputElement>('#domain-start')!;
  const endInput = appElement.querySelector<HTMLInputElement>('#domain-end')!;
  const plotBtn = appElement.querySelector<HTMLButtonElement>('#plot-btn')!;
  const realCheckbox = appElement.querySelector<HTMLInputElement>('#show-real')!;
  const imagCheckbox = appElement.querySelector<HTMLInputElement>('#show-imag')!;
  const container = appElement.querySelector<HTMLDivElement>('#plot-container')!;

  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  let width = container.clientWidth - margin.left - margin.right;
  let height = container.clientHeight - margin.top - margin.bottom;

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', container.clientWidth)
    .attr('height', container.clientHeight);

  const plotArea = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const xAxisGroup = plotArea.append('g').attr('class', 'x-axis');
  const yAxisGroup = plotArea.append('g').attr('class', 'y-axis');
  const realPath = plotArea
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2);
  const imagPath = plotArea
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', 'tomato')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4 2');

  function draw(): void {
    const domainStart = parseFloat(startInput.value);
    const domainEnd = parseFloat(endInput.value);
    const latex = formulaField.value || '';
    const expr = ce.parse(latex);
    const ascii = expr.toString();
    let compiled;
    try {
      compiled = math.compile(ascii);
    } catch {
      return;
    }

    const xValues = d3.range(domainStart, domainEnd, (domainEnd - domainStart) / 200);
    const data = xValues.map(x => {
      const v = compiled.evaluate({ x }) as number | Complex;
      if (typeof v === 'number') return { x, re: v, im: 0 };
      return { x, re: (v.re as unknown as number) ?? 0, im: (v.im as unknown as number) ?? 0 };
    });

    let yValues: number[] = [];
    if (realCheckbox.checked) yValues = yValues.concat(data.map(d => d.re));
    if (imagCheckbox.checked) yValues = yValues.concat(data.map(d => d.im));
    let yExtent = d3.extent(yValues) as [number | undefined, number | undefined];
    if (yExtent[0] === undefined || yExtent[1] === undefined) {
      yExtent = [0, 1];
    }
    const domainY = yExtent as [number, number];

    const xScale = d3.scaleLinear().domain([domainStart, domainEnd]).range([0, width]);
    const yScale = d3.scaleLinear().domain(domainY).nice().range([height, 0]);

    xAxisGroup
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    yAxisGroup.call(d3.axisLeft(yScale));

    const line = d3
      .line<{ x: number; y: number }>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));

    if (realCheckbox.checked) {
      realPath.style('display', null);
      realPath.datum(data.map(d => ({ x: d.x, y: d.re }))).attr('d', line);
    } else {
      realPath.style('display', 'none');
    }

    if (imagCheckbox.checked) {
      imagPath.style('display', null);
      imagPath.datum(data.map(d => ({ x: d.x, y: d.im }))).attr('d', line);
    } else {
      imagPath.style('display', 'none');
    }
  }

  plotBtn.addEventListener('click', draw);
  realCheckbox.addEventListener('change', draw);
  imagCheckbox.addEventListener('change', draw);
  draw();

  const resizeObserver = new ResizeObserver(() => {
    const rect = container.getBoundingClientRect();
    svg.attr('width', rect.width).attr('height', rect.height);
    width = rect.width - margin.left - margin.right;
    height = rect.height - margin.top - margin.bottom;
    draw();
  });
  resizeObserver.observe(container);

  (appElement as HTMLElement & { cleanupThreeScene?: () => void }).cleanupThreeScene = () => {
    plotBtn.removeEventListener('click', draw);
    realCheckbox.removeEventListener('change', draw);
    imagCheckbox.removeEventListener('change', draw);
    resizeObserver.disconnect();
    svg.remove();
  };
}
