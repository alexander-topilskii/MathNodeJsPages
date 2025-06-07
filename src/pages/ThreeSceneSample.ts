import * as THREE from 'three';
import { setupThreeScene } from '../utils/threeScene';
import type { ThreeSceneInstance } from '../utils/threeScene';

declare global {
  interface HTMLElement {
    cleanupThreeScene?: () => void;
  }
}

export function renderThreeSamplePage(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <style>
      #three-container {
        width: 100%;
        height: 100%; 
        display: block;
      }
      #three-container canvas {
        display: block; 
        width: 100%;   
        height: 100%;  
      }
    </style>
    <div id="three-container"></div>
  `;

  const container = appElement.querySelector<HTMLDivElement>('#three-container');

  if (!container) {
    console.error('Контейнер Three.js (#three-container) не найден в appElement.');
    appElement.innerHTML = '<p>Ошибка: Не удалось инициализировать 3D-представление. Контейнер отсутствует.</p>';
    return;
  }

  let cubeInstance: THREE.Mesh | null = null;
  let sceneController: ThreeSceneInstance | null = null;


  const initThreeScene = () => {
    if (typeof THREE === 'undefined') {
      console.error('Библиотека THREE.js еще не загружена.');
      container.innerHTML = "<p>Ошибка: Библиотека 3D (THREE.js) недоступна.</p>";
      return;
    }

    sceneController = setupThreeScene(container, {
      onInit: (scene, camera) => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        cubeInstance = new THREE.Mesh(geometry, material);
        scene.add(cubeInstance);
        camera.position.z = 5;
      },
      onAnimationFrame: () => {
        if (cubeInstance) {
          cubeInstance.rotation.x += 0.01;
          cubeInstance.rotation.y += 0.01;
        }
      },
    });

    appElement.cleanupThreeScene = () => {
      console.log("Очистка сцены Three.js из appElement...");
      sceneController?.cleanup();
      cubeInstance = null;
      sceneController = null;
      console.log("Очистка сцены Three.js завершена.");
    };
  };


  if (typeof THREE !== 'undefined') {
    console.log("Three.js уже загружен.");
    initThreeScene();
  } else if (document.querySelector('script[src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"]')) {
    console.warn("Найден тег скрипта Three.js, но объект THREE может быть не готов. Попытка инициализации с задержкой...");
    setTimeout(() => {
        if (typeof THREE !== 'undefined') {
            initThreeScene();
        } else {
            console.error("Не удалось инициализировать Three.js даже после задержки. Существующий скрипт может быть проблемным.");
            if (container) container.innerHTML = "<p>Ошибка: Не удалось инициализировать 3D библиотеку. Конфликт или проблема загрузки.</p>";
        }
    }, 200);
  }
  else {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.async = true; 
    script.onload = () => {
      console.log("Three.js r128 загружен динамически.");
      initThreeScene();
    };
    script.onerror = () => {
      console.error("Не удалось загрузить скрипт Three.js с CDN.");
      if (container) {
        container.innerHTML = "<p>Ошибка: Не удалось загрузить 3D библиотеку. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова.</p>";
      }
    };
    document.head.appendChild(script);
  }  
}
