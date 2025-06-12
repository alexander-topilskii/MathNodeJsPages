/**
 * Моковый дашборд авторизованного пользователя.
 * @param appElement - контейнер для вставки контента.
 */
export function renderDashboardPage(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <div class="dashboard">
      <div class="top-menu">
        <span class="icon">🔍</span>
        <span class="icon" style="margin-left:10px;">🔔</span>
        <span class="avatar" style="margin-left:auto;">[Аватар ▼]</span>
      </div>
      <h2>Мои доски</h2>
      <div class="board-list" style="display:flex;gap:10px;overflow-x:auto;">
        <a href="/collection" data-navigo class="card" style="min-width:200px;">
          <div class="cover">[Коллаж: наушники и книга]</div>
          <div class="title">Подарки на ДР 2025</div>
          <div class="status">12 желаний • 👥 Для друзей</div>
        </a>
        <div class="card" style="min-width:200px;">
          <div class="cover">[Палатка в горах]</div>
          <div class="title">Все для похода</div>
          <div class="status">8 желаний • 🔒 Личная</div>
        </div>
        <div class="card create" style="min-width:200px;display:flex;align-items:center;justify-content:center;">
          <button id="create-board-btn">+ Создать новую доску</button>
        </div>
      </div>
      <h2 style="margin-top:20px;">Активность друзей</h2>
      <div class="activity-feed">
        <div class="activity-item">[Аватар Анны] Анна Воробьева создала новую доску Идеи для дома.</div>
        <div class="activity-item">[Аватар Петра] Петр Иванов добавил новое желание в доску Гейминг.</div>
      </div>
    </div>
  `;
  const createBtn = appElement.querySelector('#create-board-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => alert('Окно создания доски')); 
  }
}
