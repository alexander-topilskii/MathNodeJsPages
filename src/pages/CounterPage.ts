/**
 * Рендерит контент для страницы счетчика.
 * @param appElement - HTML-элемент, в который будет встроен контент.
 */
export function renderCounterPage(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <h2>Counter Page</h2>
    <p>A simple counter example.</p>
    <div style="margin-bottom: 10px;">
      Count: <span id="counter-value">0</span>
    </div>
    <button id="increment-btn">Increment</button>
    <button id="decrement-btn" style="margin-left: 5px;">Decrement</button>
  `;

  let count = 0;
  const counterValueElement = document.getElementById('counter-value') as HTMLSpanElement;
  const incrementBtn = document.getElementById('increment-btn') as HTMLButtonElement;
  const decrementBtn = document.getElementById('decrement-btn') as HTMLButtonElement;

  function updateCounterDisplay(): void {
    if (counterValueElement) {
      counterValueElement.textContent = count.toString();
    }
  }

  if (incrementBtn) {
    incrementBtn.addEventListener('click', () => {
      count++;
      updateCounterDisplay();
    });
  }

  if (decrementBtn) {
    decrementBtn.addEventListener('click', () => {
      count--;
      updateCounterDisplay();
    });
  }
}