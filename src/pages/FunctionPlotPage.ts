import * as THREE from 'three';
import { setupThreeScene } from '../utils/threeScene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/**
 * Render a 3D plot of z = sin(sqrt(x^2 + y^2)) with axes and tooltips.
 * @param appElement - HTML element to render the scene into.
 */
export function renderFunctionPlotScene(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <div id="three-container" style="width:100%;height:100%;position:relative;"></div>
    <div id="tooltip" style="position:absolute;pointer-events:none;background:rgba(0,0,0,0.7);color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;display:none;"></div>
  `;

  const container = appElement.querySelector<HTMLDivElement>('#three-container')!;
  const tooltip = appElement.querySelector<HTMLDivElement>('#tooltip')!;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let points: THREE.Points;
  let labelRenderer: CSS2DRenderer;
  let controls: OrbitControls;

  const resizeObservers: ResizeObserver[] = [];

  const sceneInstance = setupThreeScene(container, {
    onInit: (scene, camera) => {
      labelRenderer = new CSS2DRenderer();
      labelRenderer.domElement.style.position = 'absolute';
      labelRenderer.domElement.style.top = '0';
      labelRenderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(labelRenderer.domElement);

      controls = new OrbitControls(camera, labelRenderer.domElement);
      camera.position.set(20, 20, 20);
      controls.update();

      scene.add(new THREE.AmbientLight(0x404040));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(10, 10, 10);
      scene.add(dirLight);

      const axesLength = 15;
      const axes = [
        { dir: new THREE.Vector3(1, 0, 0), color: 0xff0000, label: 'X' },
        { dir: new THREE.Vector3(0, 1, 0), color: 0x00ff00, label: 'Y' },
        { dir: new THREE.Vector3(0, 0, 1), color: 0x0000ff, label: 'Z' },
      ];
      for (const { dir, color, label } of axes) {
        const pts = [new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(axesLength)];
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color });
        const line = new THREE.Line(geom, mat);
        scene.add(line);

        const div = document.createElement('div');
        div.textContent = label;
        div.style.color = '#fff';
        const obj = new CSS2DObject(div);
        obj.position.copy(pts[1]);
        scene.add(obj);
      }

      const pointGeometry = new THREE.BufferGeometry();
      const positions: number[] = [];
      const size = 50;
      const range = 20;
      for (let i = 0; i < size; i++) {
        const x = (i / (size - 1)) * range - range / 2;
        for (let j = 0; j < size; j++) {
          const y = (j / (size - 1)) * range - range / 2;
          const r = Math.sqrt(x * x + y * y);
          const z = Math.sin(r);
          positions.push(x, y, z);
        }
      }
      pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const pointMaterial = new THREE.PointsMaterial({ color: 0xff8800, size: 0.2 });
      points = new THREE.Points(pointGeometry, pointMaterial);
      scene.add(points);

      const observer = new ResizeObserver(() => {
        labelRenderer.setSize(container.clientWidth, container.clientHeight);
      });
      observer.observe(container);
      resizeObservers.push(observer);
    },
    onAnimationFrame: (scene, camera) => {
      controls.update();
      labelRenderer.render(scene, camera);
    },
  });

  function onPointerMove(event: PointerEvent): void {
    const rect = container.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, sceneInstance.camera);
    const intersects = raycaster.intersectObject(points);
    if (intersects.length > 0) {
      const p = intersects[0].point;
      tooltip.style.display = 'block';
      tooltip.style.left = `${event.clientX + 5}px`;
      tooltip.style.top = `${event.clientY + 5}px`;
      tooltip.textContent = `X: ${p.x.toFixed(2)}, Y: ${p.y.toFixed(2)}, Z: ${p.z.toFixed(2)}`;
    } else {
      tooltip.style.display = 'none';
    }
  }

  container.addEventListener('pointermove', onPointerMove);

  (appElement as HTMLElement & { cleanupThreeScene?: () => void }).cleanupThreeScene = () => {
    container.removeEventListener('pointermove', onPointerMove);
    resizeObservers.forEach(o => o.disconnect());
    sceneInstance.cleanup();
  };
}
