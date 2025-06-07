import * as THREE from 'three';


declare global {
  interface HTMLElement {
    cleanupThreeScene?: () => void;
  }
}

/**
 * Рендерит контент для страницы с примером Three.js.
 * @param appElement - HTML-элемент, в который будет встроен контент.
 */
export function renderThreeSamplePage(appElement: HTMLElement): void {
  // Очищаем предыдущее содержимое и настраиваем базовую структуру
  appElement.innerHTML = `
    <style>
      #three-container {
        width: 100%;
        height: 100%; 
        display: block;
        margin: 0;
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
  let stableOnResize: (() => void) | null = null; // Для корректного удаления слушателя window.resize

  // Переменные для хранения объектов Three.js для последующей очистки
  let sceneInstance: THREE.Scene | null = null;
  let cameraInstance: THREE.PerspectiveCamera | null = null;
  let rendererInstance: THREE.WebGLRenderer | null = null;
  let cubeInstance: THREE.Mesh | null = null;

  // Функция инициализации сцены Three.js
  const initThreeScene = () => {
    // Убеждаемся, что THREE доступен (должен быть, если эта функция вызывается из script.onload)
    if (typeof THREE === 'undefined') {
      console.error('Библиотека THREE.js еще не загружена.');
      container.innerHTML = "<p>Ошибка: Библиотека 3D (THREE.js) недоступна.</p>";
      return;
    }

    // Создаем сцену, камеру и рендерер
    sceneInstance = new THREE.Scene();
    
    // Используем размеры контейнера для камеры и рендерера
    cameraInstance = new THREE.PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000 );
    rendererInstance = new THREE.WebGLRenderer({ antialias: true }); // antialias для сглаживания
    
    rendererInstance.setSize( container.clientWidth, container.clientHeight );
    rendererInstance.setPixelRatio(window.devicePixelRatio); // Для четкого рендеринга на экранах с высоким DPI
    
    container.appendChild( rendererInstance.domElement );

    // Создаем куб
    const geometry = new THREE.BoxGeometry(1, 1, 1); // Указываем размеры для ясности
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    cubeInstance = new THREE.Mesh( geometry, material );
    sceneInstance.add( cubeInstance );

    cameraInstance.position.z = 5;

    // Обработка изменения размера окна/контейнера
    stableOnResize = () => {
      if (!container || !cameraInstance || !rendererInstance) return;
      cameraInstance.aspect = container.clientWidth / container.clientHeight;
      cameraInstance.updateProjectionMatrix();
      rendererInstance.setSize(container.clientWidth, container.clientHeight);
    };
    
    // Используем ResizeObserver для лучшей производительности и точности при изменении размера контейнера
    if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(stableOnResize);
        resizeObserver.observe(container);
    } else {
        window.addEventListener('resize', stableOnResize); // Запасной вариант
    }

    // Анимация
    function animate() {
      animationFrameId = requestAnimationFrame( animate ); // Сохраняем ID для отмены
      if (cubeInstance && rendererInstance && sceneInstance && cameraInstance) {
        cubeInstance.rotation.x += 0.01;
        cubeInstance.rotation.y += 0.01;
        rendererInstance.render( sceneInstance, cameraInstance );
      }
    }
    animate();
  };

  // Функция очистки, которая должна вызываться, когда "страница" размонтируется или заменяется
  // Это важно в SPA для предотвращения утечек памяти и остановки циклов анимации.
  appElement.cleanupThreeScene = () => {
    console.log("Очистка сцены Three.js из appElement...");
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    } else if (stableOnResize) { // Если использовался запасной вариант
      window.removeEventListener('resize', stableOnResize);
    }
    stableOnResize = null;

    // Освобождаем ресурсы WebGL
    if (rendererInstance) {
        // Удаляем canvas из DOM
        if (rendererInstance.domElement.parentElement) {
            rendererInstance.domElement.parentElement.removeChild(rendererInstance.domElement);
        }
        rendererInstance.dispose();
        rendererInstance = null;
    }
    
    if (sceneInstance) {
        sceneInstance.traverse(object => {
            if (object instanceof THREE.Mesh) { // Проверяем, что это Mesh
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    // Материал может быть массивом
                    if (Array.isArray(object.material)) {
                        object.material.forEach(mat => mat.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        });
        sceneInstance = null; // Обнуляем ссылку на сцену
    }

    cameraInstance = null;
    cubeInstance = null; // Геометрия и материал куба освобождаются через scene.traverse

    // Очищаем содержимое контейнера
    if (container) {
        container.innerHTML = "";
    }
    console.log("Очистка сцены Three.js завершена.");
  };

  // Загружаем скрипт Three.js динамически
  // Проверяем, загружен ли уже Three.js (например, другой "страницей")
  // Также можно проверить версию, если это важно: typeof THREE !== 'undefined' && THREE.REVISION === '128'
  if (typeof THREE !== 'undefined') {
    console.log("Three.js уже загружен.");
    initThreeScene();
  } else if (document.querySelector('script[src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"]')) {
    // Тег скрипта существует, но THREE может быть еще не готов.
    // Это сложный случай. Для простоты предположим, что если тег существует, мы немного подождем.
    console.warn("Найден тег скрипта Three.js, но объект THREE может быть не готов. Попытка инициализации с задержкой...");
    setTimeout(() => {
        if (typeof THREE !== 'undefined') {
            initThreeScene();
        } else {
            console.error("Не удалось инициализировать Three.js даже после задержки. Существующий скрипт может быть проблемным.");
            if (container) container.innerHTML = "<p>Ошибка: Не удалось инициализировать 3D библиотеку. Конфликт или проблема загрузки.</p>";
        }
    }, 200); // Небольшая задержка
  }
  else {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.async = true; // Асинхронная загрузка
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
