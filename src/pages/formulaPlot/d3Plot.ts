import * as d3 from 'd3';
import { addFullscreenToggle } from '../../utils/fullscreenToggle';

export interface D3Plot {
  draw: (
    real: { x: number; y: number }[],
    imag: { x: number; y: number }[],
    showReal: boolean,
    showImag: boolean,
  ) => void;
  cleanup: () => void;
}

export function createD3Plot(container: HTMLDivElement): D3Plot {
  container.style.maxWidth = '100%';
  container.style.maxHeight = '100%';
  container.style.overflow = 'hidden';
  addFullscreenToggle(container);

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
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

  const xScale = d3.scaleLinear().range([0, width]);
  const yScale = d3.scaleLinear().range([height, 0]);

  const xAxisGroup = plotArea
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`);

  const yAxisGroup = plotArea
    .append('g')
    .attr('class', 'y-axis');

  const realPath = plotArea
    .append('path')
    .attr('stroke', '#4682b4')
    .attr('fill', 'none');

  const imagPath = plotArea
    .append('path')
    .attr('stroke', '#ff6347')
    .attr('fill', 'none');

  let lastReal: { x: number; y: number }[] = [];
  let lastImag: { x: number; y: number }[] = [];
  let lastShowReal = true;
  let lastShowImag = true;

  function internalDraw(): void {
    const yValues = [...lastReal.map(p => p.y), ...lastImag.map(p => p.y)];
    const xValues = [...lastReal.map(p => p.x), ...lastImag.map(p => p.x)];
    const yExtent = d3.extent(yValues) as [number, number];
    const xExtent = d3.extent(xValues) as [number, number];
    xScale.domain(xExtent);
    yScale.domain(yExtent);
    xAxisGroup.call(d3.axisBottom(xScale));
    yAxisGroup.call(d3.axisLeft(yScale));
    const lineGenerator = d3
      .line<{ x: number; y: number }>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));
    realPath
      .attr('d', lineGenerator(lastReal))
      .style('display', lastShowReal ? 'inline' : 'none');
    imagPath
      .attr('d', lineGenerator(lastImag))
      .style('display', lastShowImag ? 'inline' : 'none');
  }

  function draw(
    real: { x: number; y: number }[],
    imag: { x: number; y: number }[],
    showReal: boolean,
    showImag: boolean,
  ): void {
    lastReal = real;
    lastImag = imag;
    lastShowReal = showReal;
    lastShowImag = showImag;
    internalDraw();
  }

  const resizeObserver = new ResizeObserver(() => {
    const rect = container.getBoundingClientRect();
    svg.attr('width', rect.width).attr('height', rect.height);
    width = rect.width - margin.left - margin.right;
    height = rect.height - margin.top - margin.bottom;
    xScale.range([0, width]);
    yScale.range([height, 0]);
    xAxisGroup.attr('transform', `translate(0,${height})`);
    internalDraw();
  });
  resizeObserver.observe(container);

  function cleanup(): void {
    resizeObserver.disconnect();
    svg.remove();
  }

  return { draw, cleanup };
}
