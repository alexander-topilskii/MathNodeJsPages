import * as d3 from 'd3';
import { addFullscreenToggle } from '../utils/fullscreenToggle';

/**
 * Render a simple D3 visualization highlighting the non-trivial zeros
 * of the Riemann zeta function along the critical line.
 */
export function renderRiemannHypothesisScene(appElement: HTMLElement): void {
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

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(zeros)! * 1.1])
    .range([height, 0]);

  const xPos = width / 2;
  const yAxisGroup = plotArea.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale));

  const axisLine = plotArea
    .append('line')
    .attr('x1', xPos)
    .attr('x2', xPos)
    .attr('y1', 0)
    .attr('y2', height)
    .attr('stroke', '#00ff00')
    .attr('stroke-width', 2);

  const circles = plotArea
    .selectAll<SVGCircleElement, number>('circle')
    .data(zeros)
    .enter()
    .append('circle')
    .attr('cx', xPos)
    .attr('cy', d => yScale(d))
    .attr('r', 4)
    .attr('fill', '#ff0000');

  let currentTransform = d3.zoomIdentity;

  const zoomBehavior = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 10])
    .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      const zy = event.transform.rescaleY(yScale);
      currentTransform = event.transform;
      yAxisGroup.call(d3.axisLeft(zy));
      circles.attr('cy', d => zy(d));
    });

  svg.call(zoomBehavior as any);

  function showTooltip(event: PointerEvent): void {
    const [, py] = d3.pointer(event, plotArea.node() as SVGGElement);
    const zy = currentTransform.rescaleY(yScale);
    const value = zy.invert(py);
    let nearest = zeros[0];
    for (const z of zeros) {
      if (Math.abs(z - value) < Math.abs(nearest - value)) {
        nearest = z;
      }
    }
    tooltip.textContent = `0.5 + ${nearest.toFixed(6)}i`;
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.clientX + 5}px`;
    tooltip.style.top = `${event.clientY + 5}px`;
  }

  function hideTooltip(): void {
    tooltip.style.display = 'none';
  }

  svg.on('pointermove', showTooltip).on('pointerleave', hideTooltip);

  function resetView(): void {
    svg.transition().duration(750).call(zoomBehavior.transform, d3.zoomIdentity);
  }

  resetBtn.addEventListener('click', resetView);

  const resizeObserver = new ResizeObserver(() => {
    const rect = container.getBoundingClientRect();
    svg.attr('width', rect.width).attr('height', rect.height);
    width = rect.width - margin.left - margin.right;
    height = rect.height - margin.top - margin.bottom;
    yScale.range([height, 0]);
    yAxisGroup.call(d3.axisLeft(yScale));
    axisLine
      .attr('x1', width / 2)
      .attr('x2', width / 2)
      .attr('y2', height);
    circles
      .attr('cx', width / 2)
      .attr('cy', d => yScale(d));
  });
  resizeObserver.observe(container);

  (appElement as HTMLElement & { cleanupThreeScene?: () => void }).cleanupThreeScene = () => {
    resetBtn.removeEventListener('click', resetView);
    resizeObserver.disconnect();
    svg.remove();
  };
}
