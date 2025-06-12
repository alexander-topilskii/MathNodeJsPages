/**
 * Рендерит лендинг для неавторизованных пользователей.
 * @param appElement - HTML-элемент, в который будет встроен контент.
 */
export function renderHomePage(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <div class="landing">
      <h1>Wishlist: Создавай и делись желаниями легко</h1>
      <p>Больше никаких ненужных подарков. Собирай свои желания на досках и делись ими с друзьями и семьей.</p>
      <div class="illustration" style="margin: 20px 0;">[Иллюстрация с подарками]</div>
      <div class="actions">
        <a href="/login" data-navigo class="button">Войти</a>
        <a href="/register" data-navigo class="button" style="margin-left:10px;">Зарегистрироваться бесплатно</a>
      </div>
    </div>
  `;
}
