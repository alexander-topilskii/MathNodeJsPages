import './style.css'
import { setupApp, setupCounter } from './counter.ts'
import { displayVersionBanner } from './versionInfo.ts';

/**
 * Основная точка входа приложения.
 */
function main() {
  setupApp(document.querySelector<HTMLDivElement>('#app')!)
  setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

  displayVersionBanner();
}

// Запускаем основную функцию после загрузки DOM
document.addEventListener('DOMContentLoaded', main);