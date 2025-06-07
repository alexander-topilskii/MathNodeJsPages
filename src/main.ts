// /src/main.ts
import './styles/style.css'; // Импортируем глобальные стили
import { displayVersionBanner } from './components/versionInfo';
import { setupRouter } from './router';

/**
 * Основная точка входа приложения.
 */
function main() {
  // Отображаем баннер с информацией о версии
  displayVersionBanner();
  // Настраиваем и запускаем роутер
  setupRouter();
  console.log('Application started with router.');
}

// Запускаем основную функцию после загрузки DOM
document.addEventListener('DOMContentLoaded', main);