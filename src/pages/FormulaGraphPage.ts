import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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

  container.style.maxWidth = '100%';
  container.style.maxHeight = '100%';
  container.style.overflow = 'hidden';
  addFullscreenToggle(container);

  let controls: OrbitControls;
  const sceneInstance = setupThreeScene(container, {
    onInit: (scene, camera, renderer) => {
      camera.position.set(0, 0, 10);
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
  const imagMaterial = new THREE.LineDashedMaterial({ color: 0xff6347, dashSize: 0.2, gapSize: 0.1 });
  let realLine = new THREE.Line(new THREE.BufferGeometry(), realMaterial);
  let imagLine = new THREE.Line(new THREE.BufferGeometry(), imagMaterial);
  scene.add(realLine);
  scene.add(imagLine);

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

    realLine.geometry.dispose();
    imagLine.geometry.dispose();
    realLine.geometry = new THREE.BufferGeometry();
    realLine.geometry.setAttribute('position', new THREE.BufferAttribute(realPositions, 3));
    imagLine.geometry = new THREE.BufferGeometry();
    imagLine.geometry.setAttribute('position', new THREE.BufferAttribute(imagPositions, 3));
    imagLine.computeLineDistances();

    realLine.visible = realCheckbox.checked;
    imagLine.visible = imagCheckbox.checked;
  }

  plotBtn.addEventListener('click', draw);
  realCheckbox.addEventListener('change', draw);
  imagCheckbox.addEventListener('change', draw);
  draw();

  (appElement as HTMLElement & { cleanupThreeScene?: () => void }).cleanupThreeScene = () => {
    plotBtn.removeEventListener('click', draw);
    realCheckbox.removeEventListener('change', draw);
    imagCheckbox.removeEventListener('change', draw);
    cleanup();
  };
}
