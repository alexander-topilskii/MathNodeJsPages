import * as THREE from 'three';

export interface SceneLifecycleHandlers {
  onInit?: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => void;
  onAnimationFrame?: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => void;
}

export interface ThreeSceneInstance {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  cleanup: () => void;
}

export function setupThreeScene(container: HTMLElement, handlers: SceneLifecycleHandlers = {}): ThreeSceneInstance {
  const scene = new THREE.Scene();
  const getDimensions = () => {
    const rect = container.getBoundingClientRect();
    const width = rect.width || container.clientWidth || container.parentElement?.clientWidth || window.innerWidth;
    const height = rect.height || container.clientHeight || container.parentElement?.clientHeight || window.innerHeight;
    return { width, height };
  };
  const { width: initWidth, height: initHeight } = getDimensions();
  const camera = new THREE.PerspectiveCamera(75, initWidth / initHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  // Configure pixel ratio before setting the render size and avoid
  // overwriting the canvas style width/height. Updating style here causes the
  // container's width to grow exponentially on each resize because the measured
  // width then includes the device pixel ratio multiplier.
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(initWidth, initHeight, false);
  container.appendChild(renderer.domElement);

  handlers.onInit?.(scene, camera, renderer);

  const onResize = () => {
    const { width, height } = getDimensions();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // Pass `false` to avoid altering the canvas's CSS width/height which is
    // controlled via stylesheet.
    renderer.setSize(width, height, false);
  };

  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);
  } else {
    window.addEventListener('resize', onResize);
  }

  let animationFrameId: number;
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    handlers.onAnimationFrame?.(scene, camera, renderer);
    renderer.render(scene, camera);
  };
  animate();

  const cleanup = () => {
    cancelAnimationFrame(animationFrameId);
    if (resizeObserver) {
      resizeObserver.disconnect();
    } else {
      window.removeEventListener('resize', onResize);
    }

    renderer.dispose();
    scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          object.material?.dispose();
        }
      }
    });
    container.innerHTML = '';
  };

  return { scene, camera, renderer, cleanup };
}
