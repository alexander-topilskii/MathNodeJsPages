/**
 * Рендерит контент для главной страницы.
 * @param appElement - HTML-элемент, в который будет встроен контент.
 */
export function renderHomePage(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <p>
      This is a simple example of using math in a web application. The math
      library is loaded dynamically.
    </p>
  `;
}