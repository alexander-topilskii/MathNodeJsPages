import Navigo from 'navigo';
import { renderHomePage } from '../pages/HomePage';
import { renderCounterPage } from '../pages/CounterPage';
import { renderCubeScene, renderSphereScene } from '../pages/ThreeScenes';
import { renderRiemannHypothesisScene } from '../pages/RiemannHypothesisPage';
const router = new Navigo('/'); // '/' это корневой URL

export function setupRouter(): void {
  const appElement = document.getElementById('content');

  if (!appElement) {
    console.error('App element (#content) not found in the DOM.');
    return;
  }

  router
    .hooks({
      before: (done) => {
        const el = appElement as HTMLElement & { cleanupThreeScene?: () => void };
        if (typeof el.cleanupThreeScene === 'function') {
          el.cleanupThreeScene();
          delete el.cleanupThreeScene;
        }
        done();
      },
    })
    .on('/', () => {
      renderHomePage(appElement);
    })
    .on('/MathNodeJsPages', () => {
      renderHomePage(appElement);
    })
    .on('/counter', () => {
      renderCounterPage(appElement);
    })
    .on('/three_cube', () => {
      renderCubeScene(appElement);
    })
    .on('/three_sphere', () => {
      renderSphereScene(appElement);
    })
    .on('/riemann', () => {
      renderRiemannHypothesisScene(appElement);
    })
    .notFound(() => { // Обработка случая, когда страница не найдена
      appElement.innerHTML = '<h2>404 - Page Not Found</h2><a href="/MathNodeJsPages" data-navigo>Go Home</a>';
    })
    .resolve(); 
}