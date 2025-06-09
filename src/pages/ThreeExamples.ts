import * as THREE from 'three';
import { createThreeApp } from '../utils/threeApp';

export function renderCubeScene(appElement: HTMLElement): void {
  createThreeApp(appElement, (sceneManager) => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);

    sceneManager.addObject(cube);

    sceneManager.setOnUpdate(() => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    });
  });
}

export function renderSphereScene(appElement: HTMLElement): void {
  createThreeApp(appElement, (sceneManager) => {
    const geometry = new THREE.SphereGeometry(1, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
    const sphere = new THREE.Mesh(geometry, material);

    sceneManager.addObject(sphere);

    sceneManager.setOnUpdate(() => {
      sphere.rotation.y += 0.005;
    });
  });
}
