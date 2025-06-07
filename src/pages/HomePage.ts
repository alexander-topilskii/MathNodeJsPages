/**
 * Рендерит контент для главной страницы.
 * @param appElement - HTML-элемент, в который будет встроен контент.
 */
export function renderHomePage(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <h1>Hello math</h1>
    <p>
      This is a simple example of using math in a web application. The math
      library is loaded dynamically.
    </p>
    <a href="/counter" data-navigo>Go to Counter Page</a>
    <a href="/three_sample" data-navigo>Go to Three sample page Page</a>
  `;
}