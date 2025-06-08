export function addFullscreenToggle(container: HTMLElement): void {
  const button = document.createElement('button');
  button.className = 'fullscreen-toggle';
  button.textContent = '⛶';
  button.style.position = 'absolute';
  button.style.top = '8px';
  button.style.right = '8px';
  button.style.zIndex = '10';

  let isFullscreen = false;

  async function toggle() {
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        await container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      }
      isFullscreen = true;
      button.textContent = '✖';
    } else {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      isFullscreen = false;
      button.textContent = '⛶';
    }
  }

  button.addEventListener('click', toggle);

  container.addEventListener('fullscreenchange', () => {
    isFullscreen = document.fullscreenElement === container;
    button.textContent = isFullscreen ? '✖' : '⛶';
  });

  container.style.position = 'relative';
  container.appendChild(button);
}
