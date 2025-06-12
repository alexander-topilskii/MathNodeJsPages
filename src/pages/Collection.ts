/**
 * Моковый экран коллекции желаний.
 */
export function renderCollectionPage(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <div class="collection">
      <h2>Подарки на ДР 2025</h2>
      <p>Владелец: вы</p>
      <div class="wish-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">
        <div class="wish-card card">
          <div class="cover">[Фото: Наушники Sony]</div>
          <div class="title">Наушники Sony WH-1000XM5</div>
          <div class="status">⚠️ Уже дарит Анна Воробьева</div>
        </div>
        <div class="wish-card card">
          <div class="cover">[Фото: Умные часы]</div>
          <div class="title">Garmin Fenix 7</div>
          <button class="reserve-btn">🎁 Забронировать</button>
        </div>
        <div class="wish-card card">
          <div class="cover">[Фото: Книга 'Дюна']</div>
          <div class="title">Книга 'Дюна' (подарочное издание)</div>
        </div>
        <div class="wish-card card" style="display:flex;align-items:center;justify-content:center;">
          <button id="add-wish-btn">+ Добавить желание</button>
        </div>
      </div>
    </div>
  `;
  const reserve = appElement.querySelector('.reserve-btn') as HTMLButtonElement;
  if (reserve) {
    reserve.addEventListener('click', () => {
      reserve.disabled = true;
      reserve.textContent = '✅ Забронировано вами';
    });
  }
  const addBtn = appElement.querySelector('#add-wish-btn');
  if (addBtn) addBtn.addEventListener('click', () => alert('Окно добавления желания'));
}
