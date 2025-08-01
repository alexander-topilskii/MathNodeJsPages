import Navigo from 'navigo';
import { renderHomePage } from '../pages/Home';
import { renderCounterPage } from '../pages/Counter';
import { renderCubeScene, renderSphereScene } from '../pages/ThreeExamples';
import { renderComplexPlot } from '../pages/ComplexPlot';
import { renderRiemannZerosScene } from '../pages/RiemannZeros';
import { renderFormulaPlot } from '../pages/FormulaPlot';
import { renderUlamSpiralPage } from '../pages/UlamSpiral';
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
    .on('/function_plot', () => {
      renderComplexPlot(appElement);
    })
    .on('/formula_graph', () => {
      renderFormulaPlot(appElement);
    })
    .on('/ulam_spiral', () => {
      renderUlamSpiralPage(appElement);
    })
    .on('/riemann', () => {
      renderRiemannZerosScene(appElement);
    })
    .notFound(() => { // Обработка случая, когда страница не найдена
      appElement.innerHTML = '<h2>404 - Page Not Found</h2><a href="/MathNodeJsPages" data-navigo>Go Home</a>';
    })
    .resolve(); 
}