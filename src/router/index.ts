import Navigo from 'navigo';
import { renderHomePage } from '../pages/HomePage';
import { renderCounterPage } from '../pages/CounterPage';

const router = new Navigo('/'); // '/' это корневой URL

/**
 * Настраивает и инициализирует роутер.
 */
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
    .on('/counter', () => {
      renderCounterPage(appElement);
    })
    .notFound(() => { // Обработка случая, когда страница не найдена
      appElement.innerHTML = '<h2>404 - Page Not Found</h2><a href="/" data-navigo>Go Home</a>';
    })
    .resolve(); // Запускаем роутер для обработки текущего URL

  // Navigo автоматически обрабатывает клики по ссылкам с атрибутом data-navigo
}