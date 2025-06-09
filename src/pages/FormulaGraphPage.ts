import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as d3 from 'd3';
import { ComputeEngine } from '@cortex-js/compute-engine';
import 'mathlive';
import { create, all } from 'mathjs';
import type { Complex } from 'mathjs';
import { setupThreeScene } from '../utils/threeScene';
import { addFullscreenToggle } from '../utils/fullscreenToggle';

/**
 * Page that lets the user input a formula and plots it in 3D using Three.js.
 * X axis represents the domain, Y is the real part and Z is the imaginary part.
 * The graph can be rotated with the mouse to inspect the imaginary component.
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
    <div id="three-container" style="width:100%;height:400px;position:relative;"></div>
    <div id="d3-container" style="width:100%;height:300px;position:relative;margin-top:8px;"></div>
  `;

  const ce = new ComputeEngine();
  const math = create(all, {});
  const formulaField = appElement.querySelector('math-field#formula-input') as HTMLElement & { value: string };
  const startInput = appElement.querySelector<HTMLInputElement>('#domain-start')!;
  const endInput = appElement.querySelector<HTMLInputElement>('#domain-end')!;
  const plotBtn = appElement.querySelector<HTMLButtonElement>('#plot-btn')!;
  const realCheckbox = appElement.querySelector<HTMLInputElement>('#show-real')!;
  const imagCheckbox = appElement.querySelector<HTMLInputElement>('#show-imag')!;
  const threeContainer = appElement.querySelector<HTMLDivElement>('#three-container')!;
  const d3Container = appElement.querySelector<HTMLDivElement>('#d3-container')!;

  threeContainer.style.maxWidth = '100%';
  threeContainer.style.maxHeight = '100%';
  threeContainer.style.overflow = 'hidden';
  d3Container.style.maxWidth = '100%';
  d3Container.style.maxHeight = '100%';
  d3Container.style.overflow = 'hidden';
  addFullscreenToggle(threeContainer);
  addFullscreenToggle(d3Container);

  let controls: OrbitControls;
  const sceneInstance = setupThreeScene(threeContainer, {
    onInit: (scene, camera, renderer) => {
      // Start the camera at an angle so the imaginary Z axis is visible.
      // Looking straight down the Z axis hid the imaginary component,
      // giving the impression that it wasn't being drawn.
      camera.position.set(5, 5, 10);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      scene.add(new THREE.AxesHelper(5));
    },
    onAnimationFrame: () => {
      controls.update();
    },
  });

  const { scene, cleanup } = sceneInstance;
  const realMaterial = new THREE.LineBasicMaterial({ color: 0x4682b4 });
  // Imaginary component is drawn using a solid line to better visualize
  // functions like sin(x) where the imaginary part is non‑zero. Dashed lines
  // made the curve appear discontinuous.
  const imagMaterial = new THREE.LineBasicMaterial({ color: 0xff6347 });
  let realLine = new THREE.Line(new THREE.BufferGeometry(), realMaterial);
  let imagLine = new THREE.Line(new THREE.BufferGeometry(), imagMaterial);
  scene.add(realLine);
  scene.add(imagLine);

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  let width = d3Container.clientWidth - margin.left - margin.right;
  let height = d3Container.clientHeight - margin.top - margin.bottom;

  const svg = d3
    .select(d3Container)
    .append('svg')
    .style('display', 'block')
    .attr('width', d3Container.clientWidth)
    .attr('height', d3Container.clientHeight);

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

    const step = (domainEnd - domainStart) / 200;
    const xValues = [] as number[];
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
    const yValues = [
      ...realPoints.map(p => p.y),
      ...imagPoints.map(p => p.y),
    ];
    const yExtent = d3.extent(yValues) as [number, number];
    xScale.domain([domainStart, domainEnd]);
    yScale.domain(yExtent);
    xAxisGroup.call(d3.axisBottom(xScale));
    yAxisGroup.call(d3.axisLeft(yScale));
    const lineGenerator = d3
      .line<{ x: number; y: number }>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));
    realPath.attr('d', lineGenerator(realPoints));
    imagPath.attr('d', lineGenerator(imagPoints));

    realLine.geometry.dispose();
    imagLine.geometry.dispose();
    realLine.geometry = new THREE.BufferGeometry();
    realLine.geometry.setAttribute('position', new THREE.BufferAttribute(realPositions, 3));
    imagLine.geometry = new THREE.BufferGeometry();
    imagLine.geometry.setAttribute('position', new THREE.BufferAttribute(imagPositions, 3));
    imagLine.computeLineDistances();

    realLine.visible = realCheckbox.checked;
    imagLine.visible = imagCheckbox.checked;
    realPath.style('display', realCheckbox.checked ? 'inline' : 'none');
    imagPath.style('display', imagCheckbox.checked ? 'inline' : 'none');
  }

  plotBtn.addEventListener('click', draw);
  realCheckbox.addEventListener('change', draw);
  imagCheckbox.addEventListener('change', draw);
  draw();

  const resizeObserver = new ResizeObserver(() => {
    const rect = d3Container.getBoundingClientRect();
    svg.attr('width', rect.width).attr('height', rect.height);
    width = rect.width - margin.left - margin.right;
    height = rect.height - margin.top - margin.bottom;
    xScale.range([0, width]);
    yScale.range([height, 0]);
    xAxisGroup.attr('transform', `translate(0,${height})`).call(d3.axisBottom(xScale));
    yAxisGroup.call(d3.axisLeft(yScale));
    draw();
  });
  resizeObserver.observe(d3Container);

  (appElement as HTMLElement & { cleanupThreeScene?: () => void }).cleanupThreeScene = () => {
    plotBtn.removeEventListener('click', draw);
    realCheckbox.removeEventListener('change', draw);
    imagCheckbox.removeEventListener('change', draw);
    resizeObserver.disconnect();
    svg.remove();
    cleanup();
  };
}
