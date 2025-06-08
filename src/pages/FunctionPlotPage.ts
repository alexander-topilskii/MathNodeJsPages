import * as d3 from 'd3';
import { addFullscreenToggle } from '../utils/fullscreenToggle';
import { create, all } from 'mathjs';
import type { Complex } from 'mathjs';

const math = create(all, {});

/**
 * Render an interactive plot of f(z) = sin(z) on the complex plane using D3.
 * Each point represents z = x + yi and is colored by |f(z)|.
 * @param appElement - HTML element to render the scene into.
 */
export function renderFunctionPlotScene(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <div id="d3-container" style="width:100%;height:100%;position:relative;">
      <button id="reset-view" style="position:absolute;left:8px;top:8px;z-index:11;">↺</button>
      <div id="tooltip" style="position:absolute;pointer-events:none;background:rgba(0,0,0,0.7);color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;display:none;"></div>
    </div>
  `;

  const container = appElement.querySelector<HTMLDivElement>('#d3-container')!;
  container.style.maxWidth = '100%';
  container.style.maxHeight = '100%';
  container.style.overflow = 'hidden';
  addFullscreenToggle(container);

  const resetBtn = container.querySelector<HTMLButtonElement>('#reset-view')!;
  const tooltip = container.querySelector<HTMLDivElement>('#tooltip')!;

  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  let width = container.clientWidth - margin.left - margin.right;
  let height = container.clientHeight - margin.top - margin.bottom;

  const svg = d3
    .select(container)
    .append('svg')
    .style('display', 'block')
    .attr('width', container.clientWidth)
    .attr('height', container.clientHeight);

  const plotArea = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const size = 40;
  const range = 20;
  const data: { x: number; y: number; re: number; im: number; mag: number }[] = [];

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

  const xScale = d3
    .scaleLinear()
    .domain([-range / 2, range / 2])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([-range / 2, range / 2])
    .range([height, 0]);

  const colorScale = d3
    .scaleSequential(d3.interpolateTurbo)
    .domain(d3.extent(data, d => Math.log10(d.mag)) as [number, number]);

  const xAxisGroup = plotArea
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  const yAxisGroup = plotArea
    .append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale));

  const points = plotArea
    .selectAll<SVGCircleElement, typeof data[number]>('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', 3)
    .attr('fill', d => colorScale(Math.log10(d.mag)));

  points
    .on('pointerover', (event: PointerEvent, d: typeof data[number]) => {
      tooltip.style.display = 'block';
      tooltip.textContent =
        `z = ${d.x.toFixed(2)} + ${d.y.toFixed(2)}i\n` +
        `sin(z) = ${d.re.toFixed(2)} + ${d.im.toFixed(2)}i\n` +
        `|sin(z)| = ${d.mag.toExponential(2)}`;
      tooltip.style.left = `${event.clientX + 5}px`;
      tooltip.style.top = `${event.clientY + 5}px`;
    })
    .on('pointermove', (event: PointerEvent) => {
      tooltip.style.left = `${event.clientX + 5}px`;
      tooltip.style.top = `${event.clientY + 5}px`;
    })
    .on('pointerout', () => {
      tooltip.style.display = 'none';
    });

  const zoomBehavior = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 10])
    .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      const transform = event.transform;
      const zx = transform.rescaleX(xScale);
      const zy = transform.rescaleY(yScale);
      xAxisGroup.call(d3.axisBottom(zx));
      yAxisGroup.call(d3.axisLeft(zy));
      points.attr('cx', d => zx(d.x)).attr('cy', d => zy(d.y));
    });

  svg.call(zoomBehavior as any);

  function resetView(): void {
    svg.transition().duration(750).call(zoomBehavior.transform, d3.zoomIdentity);
  }

  resetBtn.addEventListener('click', resetView);

  const resizeObserver = new ResizeObserver(() => {
    const rect = container.getBoundingClientRect();
    svg.attr('width', rect.width).attr('height', rect.height);
    width = rect.width - margin.left - margin.right;
    height = rect.height - margin.top - margin.bottom;
    xScale.range([0, width]);
    yScale.range([height, 0]);
    xAxisGroup.attr('transform', `translate(0,${height})`).call(d3.axisBottom(xScale));
    yAxisGroup.call(d3.axisLeft(yScale));
    points.attr('cx', d => xScale(d.x)).attr('cy', d => yScale(d.y));
  });
  resizeObserver.observe(container);

  (appElement as HTMLElement & { cleanupThreeScene?: () => void }).cleanupThreeScene = () => {
    resetBtn.removeEventListener('click', resetView);
    resizeObserver.disconnect();
    svg.remove();
  };
}
