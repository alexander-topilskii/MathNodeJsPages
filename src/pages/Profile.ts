/**
 * Моковая страница профиля пользователя.
 */
export function renderProfilePage(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <div class="profile">
      <div class="profile-header" style="display:flex;align-items:center;gap:10px;">
        <div class="avatar">[Аватар Анны]</div>
        <div>
          <h2 style="margin:0;">Анна Воробьева</h2>
          <div>✓ Вы друзья</div>
        </div>
        <button style="margin-left:auto;">...</button>
      </div>
      <div class="tabs" style="margin-top:20px;">
        <button id="tab-boards" class="active">Публичные доски</button>
        <button id="tab-friends" style="margin-left:10px;">Друзья</button>
      </div>
      <div id="profile-content" style="margin-top:10px;">
        <div class="board-card card">
          <div class="cover">[Книжная полка]</div>
          <div class="title">Хочу прочитать</div>
          <div class="status">25 желаний • 🌎 Публичная</div>
        </div>
      </div>
    </div>
  `;
  const boardsTab = appElement.querySelector('#tab-boards') as HTMLButtonElement;
  const friendsTab = appElement.querySelector('#tab-friends') as HTMLButtonElement;
  const content = appElement.querySelector('#profile-content') as HTMLElement;
  if (friendsTab && boardsTab && content) {
    friendsTab.addEventListener('click', () => {
      content.innerHTML = '<p>Список общих друзей...</p>';
      friendsTab.classList.add('active');
      boardsTab.classList.remove('active');
    });
    boardsTab.addEventListener('click', () => {
      content.innerHTML = `<div class="board-card card"><div class="cover">[Книжная полка]</div><div class="title">Хочу прочитать</div><div class="status">25 желаний • 🌎 Публичная</div></div>`;
      boardsTab.classList.add('active');
      friendsTab.classList.remove('active');
    });
  }
}
