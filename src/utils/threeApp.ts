import * as THREE from 'three';
import { setupThreeScene } from './threeScene';
import type { ThreeSceneInstance } from './threeScene';

export interface SceneManager {
  addObject(object: THREE.Object3D): void;
  setOnUpdate(fn: () => void): void;
}

export function createThreeApp(appElement: HTMLElement, setupCallback: (manager: SceneManager) => void): void {
  appElement.innerHTML = `
    <style>
      #three-container { width: 100%; height: 100%; display: block; }
      #three-container canvas { display: block; width: 100%; height: 100%; }
    </style>
    <div id="three-container"></div>
  `;

  const container = appElement.querySelector<HTMLDivElement>('#three-container');
  if (!container) {
    console.error('Контейнер Three.js (#three-container) не найден в appElement.');
    appElement.innerHTML = '<p>Ошибка: Не удалось инициализировать 3D-представление. Контейнер отсутствует.</p>';
    return;
  }

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
