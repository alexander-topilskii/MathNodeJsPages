import * as d3 from 'd3';
import type { FunctionPoint } from './generateData';

export interface PlotApi {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  resizeObserver: ResizeObserver;
  reset: () => void;
}

export function createPlot(
  container: HTMLDivElement,
  data: FunctionPoint[],
  tooltip: HTMLDivElement,
  range = 20,
): PlotApi {
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

  const xScale = d3
    .scaleLinear<number>()
    .domain([-range / 2, range / 2])
    .range([0, width]);

  const yScale = d3
    .scaleLinear<number>()
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
    .selectAll<SVGCircleElement, FunctionPoint>('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', 3)
    .attr('fill', d => colorScale(Math.log10(d.mag)));

  points
    .on('pointerover', (event: PointerEvent, d: FunctionPoint) => {
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

  function reset(): void {
    svg.transition().duration(750).call(zoomBehavior.transform, d3.zoomIdentity);
  }

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

  return { svg, resizeObserver, reset };
}
