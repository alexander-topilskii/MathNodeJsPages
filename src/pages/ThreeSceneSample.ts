import * as THREE from 'three';


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

  let animationFrameId: number | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let stableOnResize: (() => void) | null = null; 

  let sceneInstance: THREE.Scene | null = null;
  let cameraInstance: THREE.PerspectiveCamera | null = null;
  let rendererInstance: THREE.WebGLRenderer | null = null;
  let cubeInstance: THREE.Mesh | null = null;


  const initThreeScene = () => {
    if (typeof THREE === 'undefined') {
      console.error('Библиотека THREE.js еще не загружена.');
      container.innerHTML = "<p>Ошибка: Библиотека 3D (THREE.js) недоступна.</p>";
      return;
    }

    sceneInstance = new THREE.Scene();
    
   
    cameraInstance = new THREE.PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000 );
    rendererInstance = new THREE.WebGLRenderer({ antialias: true }); 
    
    rendererInstance.setSize( container.clientWidth, container.clientHeight );
    rendererInstance.setPixelRatio(window.devicePixelRatio); 
    
    container.appendChild( rendererInstance.domElement );


    const geometry = new THREE.BoxGeometry(1, 1, 1); 
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    cubeInstance = new THREE.Mesh( geometry, material );
    sceneInstance.add( cubeInstance );

    cameraInstance.position.z = 5;

   
    stableOnResize = () => {
      if (!container || !cameraInstance || !rendererInstance) return;
      cameraInstance.aspect = container.clientWidth / container.clientHeight;
      cameraInstance.updateProjectionMatrix();
      rendererInstance.setSize(container.clientWidth, container.clientHeight);
    };
    
    if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(stableOnResize);
        resizeObserver.observe(container);
    } else {
        window.addEventListener('resize', stableOnResize); // Запасной вариант
    }

    function animate() {
      animationFrameId = requestAnimationFrame( animate );
      if (cubeInstance && rendererInstance && sceneInstance && cameraInstance) {
        cubeInstance.rotation.x += 0.01;
        cubeInstance.rotation.y += 0.01;
        rendererInstance.render( sceneInstance, cameraInstance );
      }
    }
    animate();
  };

   appElement.cleanupThreeScene = () => {
    console.log("Очистка сцены Three.js из appElement...");
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    } else if (stableOnResize) { 
      window.removeEventListener('resize', stableOnResize);
    }
    stableOnResize = null;

    if (rendererInstance) {
        if (rendererInstance.domElement.parentElement) {
            rendererInstance.domElement.parentElement.removeChild(rendererInstance.domElement);
        }
        rendererInstance.dispose();
        rendererInstance = null;
    }
    
    if (sceneInstance) {
        sceneInstance.traverse(object => {
            if (object instanceof THREE.Mesh) { 
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(mat => mat.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        });
        sceneInstance = null; 
    }

    cameraInstance = null;
    cubeInstance = null; 

    if (container) {
        container.innerHTML = "";
    }
    console.log("Очистка сцены Three.js завершена.");
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
