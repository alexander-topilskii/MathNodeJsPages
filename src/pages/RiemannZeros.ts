import * as d3 from 'd3';
import { addFullscreenToggle } from '../utils/fullscreenToggle';
import { create, all } from 'mathjs';

const math = create(all, {});

/**
 * Render a simple D3 visualization highlighting the non-trivial zeros
 * of the Riemann zeta function along the critical line.
 */
export function renderRiemannZerosScene(appElement: HTMLElement): void {
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
  const margin = { top: 20, right: 20, bottom: 20, left: 40 };
  let width = container.clientWidth - margin.left - margin.right;
  let height = container.clientHeight - margin.top - margin.bottom;

  const svg = d3
    .select(container)
    .append('svg')
    .style('display', 'block')
    .attr('width', container.clientWidth)
    .attr('height', container.clientHeight);

  const plotArea = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const zeros = [
    14.134725, 21.02204, 25.010858, 30.424876, 32.935062,
    37.586178, 40.918719, 43.327073, 48.00515, 49.773832,
  ];

  const xRange = [-5, 2];
  const yRange = [-30, 30];
  const xSteps = 40;
  const ySteps = 60;

  const data: { x: number; y: number; value: number }[] = [];
  for (let i = 0; i < xSteps; i++) {
    const x = xRange[0] + (i / (xSteps - 1)) * (xRange[1] - xRange[0]);
    for (let j = 0; j < ySteps; j++) {
      const y = yRange[0] + (j / (ySteps - 1)) * (yRange[1] - yRange[0]);
      const z = math.zeta(math.complex(x, y));
      const value = math.abs(z) as unknown as number;
      data.push({ x, y, value });
    }
  }

  const xScale = d3.scaleLinear().domain(xRange).range([0, width]);
  const yScale = d3.scaleLinear().domain(yRange).range([height, 0]);

  const colorScale = d3
    .scaleSequential(d3.interpolatePlasma)
    .domain(d3.extent(data, d => Math.log10(d.value)) as [number, number]);

  const xAxisGroup = plotArea
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  const yAxisGroup = plotArea
    .append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale));

  const cellWidth = width / xSteps;
  const cellHeight = height / ySteps;

  const cells = plotArea
    .selectAll<SVGRectElement, typeof data[number]>('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => xScale(d.x) - cellWidth / 2)
    .attr('y', d => yScale(d.y) - cellHeight / 2)
    .attr('width', cellWidth)
    .attr('height', cellHeight)
    .attr('fill', d => colorScale(Math.log10(d.value)));

  const zeroPoints = plotArea
    .selectAll<SVGCircleElement, number>('circle.zero')
    .data(zeros)
    .enter()
    .append('circle')
    .attr('class', 'zero')
    .attr('cx', xScale(0.5))
    .attr('cy', d => yScale(d))
    .attr('r', 3)
    .attr('fill', '#ff0000');

  const pole = plotArea
    .append('circle')
    .attr('cx', xScale(1))
    .attr('cy', yScale(0))
    .attr('r', 5)
    .attr('fill', 'orange');

  const zoomBehavior = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 10])
    .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      const zx = event.transform.rescaleX(xScale);
      const zy = event.transform.rescaleY(yScale);
      xAxisGroup.call(d3.axisBottom(zx));
      yAxisGroup.call(d3.axisLeft(zy));
      cells
        .attr('x', d => zx(d.x) - cellWidth / 2)
        .attr('y', d => zy(d.y) - cellHeight / 2);
      zeroPoints.attr('cx', zx(0.5)).attr('cy', d => zy(d));
      pole.attr('cx', zx(1)).attr('cy', zy(0));
    });

  svg.call(zoomBehavior as any);

  function showTooltip(event: PointerEvent, d: typeof data[number]): void {
    tooltip.style.display = 'block';
    tooltip.textContent = `s = ${d.x.toFixed(2)} + ${d.y.toFixed(2)}i, |ζ| = ${d.value.toExponential(2)}`;
    const rect = container.getBoundingClientRect();
    tooltip.style.left = `${event.clientX - rect.left + 5}px`;
    tooltip.style.top = `${event.clientY - rect.top + 5}px`;
  }

  function hideTooltip(): void {
    tooltip.style.display = 'none';
  }

  cells
    .on('pointerover', showTooltip)
    .on('pointermove', showTooltip)
    .on('pointerout', hideTooltip);

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
    const w = width / xSteps;
    const h = height / ySteps;
    cells
      .attr('x', d => xScale(d.x) - w / 2)
      .attr('y', d => yScale(d.y) - h / 2)
      .attr('width', w)
      .attr('height', h);
    zeroPoints.attr('cx', xScale(0.5)).attr('cy', d => yScale(d));
    pole.attr('cx', xScale(1)).attr('cy', yScale(0));
  });
  resizeObserver.observe(container);

  (appElement as HTMLElement & { cleanupThreeScene?: () => void }).cleanupThreeScene = () => {
    resetBtn.removeEventListener('click', resetView);
    resizeObserver.disconnect();
    svg.remove();
  };
}
