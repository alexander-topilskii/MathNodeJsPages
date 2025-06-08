import * as THREE from 'three';
import { setupThreeScene } from '../utils/threeScene';
import { addFullscreenToggle } from '../utils/fullscreenToggle';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/**
 * Render a 3D plot of z = sin(sqrt(x^2 + y^2)) with axes and tooltips.
 * @param appElement - HTML element to render the scene into.
 */
export function renderFunctionPlotScene(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <div id="three-container" style="width:100%;height:100%;position:relative;">
      <button id="reset-view" style="position:absolute;left:8px;top:8px;z-index:11;">↺</button>
      <button id="rotate-world" style="position:absolute;left:40px;top:8px;z-index:11;">🌐</button>
      <button id="rotate-object" style="position:absolute;left:72px;top:8px;z-index:11;">🎯</button>
      <div id="control-hint" style="position:absolute;bottom:8px;left:8px;z-index:11;background:rgba(0,0,0,0.5);color:#fff;padding:2px 6px;border-radius:4px;font-size:12px;">Drag to rotate, scroll to zoom, R to reset</div>
    </div>
    <div id="tooltip" style="position:absolute;pointer-events:none;background:rgba(0,0,0,0.7);color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;display:none;"></div>
  `;

  const container = appElement.querySelector<HTMLDivElement>('#three-container')!;
  container.style.maxWidth = '100%';
  container.style.maxHeight = '100%';
  container.style.overflow = 'hidden';
  addFullscreenToggle(container);
  const resetBtn = appElement.querySelector<HTMLButtonElement>('#reset-view')!;
  const rotateWorldBtn = appElement.querySelector<HTMLButtonElement>('#rotate-world')!;
  const rotateObjectBtn = appElement.querySelector<HTMLButtonElement>('#rotate-object')!;
  const tooltip = appElement.querySelector<HTMLDivElement>('#tooltip')!;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let points: THREE.Points;
  let labelRenderer: CSS2DRenderer;
  let controls: OrbitControls;
  let selectedObject: THREE.Object3D | null = null;

  const defaultColor = 0xff8800;
  const highlightColor = 0xffff00;

  const resizeObservers: ResizeObserver[] = [];

  const sceneInstance = setupThreeScene(container, {
    onInit: (scene, camera) => {
      labelRenderer = new CSS2DRenderer();
      labelRenderer.domElement.style.position = 'absolute';
      labelRenderer.domElement.style.top = '0';
      labelRenderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(labelRenderer.domElement);

      controls = new OrbitControls(camera, labelRenderer.domElement);
      controls.enableDamping = true;
      controls.target.set(0, 0, 0);
      camera.position.set(20, 20, 20);
      camera.lookAt(0, 0, 0);
      controls.update();
      controls.saveState();

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

  function onPointerDown(event: PointerEvent): void {
    const rect = container.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, sceneInstance.camera);
    const intersects = raycaster.intersectObject(points);
    if (intersects.length > 0) {
      // simple highlight for selected point cloud
      if (selectedObject) {
        const mat = (selectedObject as THREE.Points).material as THREE.PointsMaterial;
        mat.color.set(defaultColor);
      }
      selectedObject = points;
      ((points.material as THREE.PointsMaterial).color).set(highlightColor);
    }
  }

  function resetCamera() {
    controls.reset();
  }

  let autoRotateMode: 'world' | 'object' | null = null;

  function stopRotation() {
    controls.autoRotate = false;
    autoRotateMode = null;
  }

  function startWorldRotation() {
    controls.target.set(0, 0, 0);
    controls.autoRotate = true;
    autoRotateMode = 'world';
  }

  function startObjectRotation() {
    if (!selectedObject) return;
    controls.target.copy(selectedObject.position);
    controls.autoRotate = true;
    autoRotateMode = 'object';
  }

  function toggleWorldRotation() {
    if (autoRotateMode === 'world') {
      stopRotation();
    } else {
      startWorldRotation();
    }
  }

  function toggleObjectRotation() {
    if (!selectedObject) return;
    if (autoRotateMode === 'object') {
      stopRotation();
    } else {
      startObjectRotation();
    }
  }

  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerdown', onPointerDown);
  const onContextMenu = (e: Event) => e.preventDefault();
  container.addEventListener('contextmenu', onContextMenu);
  resetBtn.addEventListener('click', resetCamera);
  rotateWorldBtn.addEventListener('click', toggleWorldRotation);
  rotateObjectBtn.addEventListener('click', toggleObjectRotation);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'r' || e.key === 'R') {
      resetCamera();
    }
  };
  window.addEventListener('keydown', onKeyDown);

  (appElement as HTMLElement & { cleanupThreeScene?: () => void }).cleanupThreeScene = () => {
    container.removeEventListener('pointermove', onPointerMove);
    container.removeEventListener('pointerdown', onPointerDown);
    container.removeEventListener('contextmenu', onContextMenu);
    resetBtn.removeEventListener('click', resetCamera);
    rotateWorldBtn.removeEventListener('click', toggleWorldRotation);
    rotateObjectBtn.removeEventListener('click', toggleObjectRotation);
    window.removeEventListener('keydown', onKeyDown);
    resizeObservers.forEach(o => o.disconnect());
    if (selectedObject) {
      const mat = (selectedObject as THREE.Points).material as THREE.PointsMaterial;
      mat.color.set(defaultColor);
    }
    sceneInstance.cleanup();
  };
}
