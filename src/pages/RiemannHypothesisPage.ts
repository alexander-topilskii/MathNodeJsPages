import * as THREE from 'three';
import { createThreeApp } from '../utils/threeApp';

/**
 * Render a simple Three.js visualization highlighting the non-trivial zeros
 * of the Riemann zeta function along the critical line. Each zero is
 * represented by a small sphere on a vertical axis.
 */
export function renderRiemannHypothesisScene(appElement: HTMLElement): void {
  createThreeApp(appElement, (sceneManager) => {
    // First several non-trivial zeros of the zeta function
    const zeros = [
      14.134725, 21.022040, 25.010858, 30.424876, 32.935062,
      37.586178, 40.918719, 43.327073, 48.005150, 49.773832,
    ];
    const scale = 0.05; // scale factor for visualizing the zeros

    const group = new THREE.Group();

    const zeroMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    for (const t of zeros) {
      const geometry = new THREE.SphereGeometry(0.1, 16, 16);
      const sphere = new THREE.Mesh(geometry, zeroMaterial);
      sphere.position.set(0, t * scale, 0);
      group.add(sphere);
    }

    const axisHeight = zeros[zeros.length - 1] * scale + 1;
    const axisGeometry = new THREE.CylinderGeometry(0.02, 0.02, axisHeight, 32);
    const axisMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const axis = new THREE.Mesh(axisGeometry, axisMaterial);
    axis.position.set(0, axisHeight / 2, 0);
    group.add(axis);

    sceneManager.addObject(group);

    sceneManager.setOnUpdate(() => {
      group.rotation.y += 0.01;
    });
  });
}
