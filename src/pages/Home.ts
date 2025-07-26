/**
 * Рендерит лендинг для неавторизованных пользователей.
 * @param appElement - HTML-элемент, в который будет встроен контент.
 */
export function renderHomePage(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <div class="landing">
      <h1>Math sampler</h1>
      <p>Some description</p>
    </div>
  `;
}
