import * as d3 from 'd3';

const SIZE = 200;
const CELL_SIZE = 10;
const PRIME_COLOR = 'black';
const NON_PRIME_COLOR = 'white';
const BACKGROUND_COLOR = 'lightgray';

interface Point {
  x: number;
  y: number;
  value: number;
}

function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function generateSpiral(n: number): Point[] {
  const points: Point[] = [];
  let x = 0;
  let y = 0;
  let dx = 0;
  let dy = -1;
  let steps = 1;
  let stepCount = 0;
  let directionChanges = 0;

  for (let i = 1; i <= n * n; i++) {
    points.push({ x, y, value: i });

    x += dx;
    y += dy;
    stepCount++;

    if (stepCount === steps) {
      stepCount = 0;
      directionChanges++;
      const temp = dx;
      dx = -dy;
      dy = temp;
      if (directionChanges % 2 === 0) {
        steps++;
      }
    }
  }

  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  points.forEach(p => {
    p.x -= minX;
    p.y -= minY;
  });

  return points;
}

export function renderUlamSpiralPage(appElement: HTMLElement): void {
  appElement.innerHTML = '<div id="ulam-container" style="width:100%;height:100%;position:relative;"></div>';
  const container = appElement.querySelector<HTMLDivElement>('#ulam-container')!;
  container.style.maxWidth = '100%';
  container.style.maxHeight = '100%';
  container.style.overflow = 'hidden';

  const points = generateSpiral(SIZE);
  const width = (Math.max(...points.map(p => p.x)) + 1) * CELL_SIZE;
  const height = (Math.max(...points.map(p => p.y)) + 1) * CELL_SIZE;

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background-color', BACKGROUND_COLOR);

  const g = svg.append('g');

  g.selectAll('rect')
    .data(points)
    .enter()
    .append('rect')
    .attr('x', d => d.x * CELL_SIZE)
    .attr('y', d => d.y * CELL_SIZE)
    .attr('width', CELL_SIZE)
    .attr('height', CELL_SIZE)
    .attr('fill', d => (isPrime(d.value) ? PRIME_COLOR : NON_PRIME_COLOR))
    .attr('stroke', 'gray')
    .attr('stroke-width', 0.1);

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 10])
    .on('zoom', event => {
      g.attr('transform', event.transform as any);
    });

  svg.call(zoom as any);
  svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2));

  (appElement as HTMLElement & { cleanupThreeScene?: () => void }).cleanupThreeScene = () => {
    svg.remove();
  };
}
