import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupThreeScene } from '../../utils/threeScene';
import { addFullscreenToggle } from '../../utils/fullscreenToggle';

export interface ThreePlot {
  draw: (
    realPositions: Float32Array,
    imagPositions: Float32Array,
    showReal: boolean,
    showImag: boolean,
  ) => void;
  cleanup: () => void;
}

export function createThreePlot(container: HTMLDivElement): ThreePlot {
  container.style.maxWidth = '100%';
  container.style.maxHeight = '100%';
  container.style.overflow = 'hidden';
  addFullscreenToggle(container);

  let controls: OrbitControls;
  const sceneInstance = setupThreeScene(container, {
    onInit: (scene, camera, renderer) => {
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
  const imagMaterial = new THREE.LineBasicMaterial({ color: 0xff6347 });
  let realLine = new THREE.Line(new THREE.BufferGeometry(), realMaterial);
  let imagLine = new THREE.Line(new THREE.BufferGeometry(), imagMaterial);
  scene.add(realLine);
  scene.add(imagLine);

  function draw(
    realPositions: Float32Array,
    imagPositions: Float32Array,
    showReal: boolean,
    showImag: boolean,
  ): void {
    realLine.geometry.dispose();
    imagLine.geometry.dispose();
    realLine.geometry = new THREE.BufferGeometry();
    realLine.geometry.setAttribute('position', new THREE.BufferAttribute(realPositions, 3));
    imagLine.geometry = new THREE.BufferGeometry();
    imagLine.geometry.setAttribute('position', new THREE.BufferAttribute(imagPositions, 3));
    imagLine.computeLineDistances();
    realLine.visible = showReal;
    imagLine.visible = showImag;
  }

  return {
    draw,
    cleanup,
  };
}
