import Navigo from 'navigo';
import { renderHomePage } from '../pages/HomePage';
import { renderCounterPage } from '../pages/CounterPage';
import { renderThreeSamplePage } from '../pages/ThreeSceneSample';
const router = new Navigo('/'); // '/' это корневой URL

export function setupRouter(): void {
  const appElement = document.getElementById('app');

  if (!appElement) {
    console.error('App element (#app) not found in the DOM.');
    return;
  }

  router
   .on('/', () => {
      renderHomePage(appElement);
    })
    .on('/MathNodeJsPages', () => {
      renderHomePage(appElement);
    })
    .on('/counter', () => {
      renderCounterPage(appElement);
    })
    .on('/three_sample', () => {
      renderThreeSamplePage(appElement);
    })
    .notFound(() => { // Обработка случая, когда страница не найдена
      appElement.innerHTML = '<h2>404 - Page Not Found</h2><a href="/MathNodeJsPages" data-navigo>Go Home</a>';
    })
    .resolve(); 
}