import * as THREE from 'three';
import { setupThreeScene } from './threeScene';
import type { ThreeSceneInstance } from './threeScene';
import { addFullscreenToggle } from './fullscreenToggle';

export interface SceneManager {
  addObject(object: THREE.Object3D): void;
  setOnUpdate(fn: () => void): void;
}

export function createThreeApp(appElement: HTMLElement, setupCallback: (manager: SceneManager) => void): void {
  appElement.innerHTML = `
    <div id="three-container"></div>
  `;

  const container = appElement.querySelector<HTMLDivElement>('#three-container');
  if (!container) {
    console.error('Контейнер Three.js (#three-container) не найден в appElement.');
    appElement.innerHTML = '<p>Ошибка: Не удалось инициализировать 3D-представление. Контейнер отсутствует.</p>';
    return;
  }

  // Ensure the container is visible before initializing Three.js
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.maxWidth = '100%';
  container.style.maxHeight = '100%';
  container.style.overflow = 'hidden';
  container.style.display = 'block';

  // Also make sure any canvas added by Three.js fills the container
  const style = document.createElement('style');
  style.textContent = `#three-container canvas { display: block; width: 100%; height: 100%; }`;
  appElement.appendChild(style);

  addFullscreenToggle(container);

  const objects: THREE.Object3D[] = [];
  let updateFn: (() => void) | null = null;

  const manager: SceneManager = {
    addObject(object: THREE.Object3D) {
      objects.push(object);
    },
    setOnUpdate(fn: () => void) {
      updateFn = fn;
    },
  };

  setupCallback(manager);

  const sceneInstance: ThreeSceneInstance = setupThreeScene(container, {
    onInit: (scene, camera) => {
      objects.forEach(obj => scene.add(obj));
      camera.position.z = 5;
    },
    onAnimationFrame: () => {
      if (updateFn) updateFn();
    },
  });

  (appElement as HTMLElement & { cleanupThreeScene?: () => void }).cleanupThreeScene = () => {
    sceneInstance.cleanup();
  };
}
