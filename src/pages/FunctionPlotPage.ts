import { addFullscreenToggle } from '../utils/fullscreenToggle';
import { generateSinData } from './functionPlot/generateData';
import { createPlot } from './functionPlot/plot';

/**
 * Render an interactive plot of f(z) = sin(z) on the complex plane using D3.
 * @param appElement - HTML element to render the scene into.
 */
export function renderFunctionPlotScene(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <div id="d3-container" style="width:100%;height:100%;position:relative;">
      <button id="reset-view" style="position:absolute;left:8px;top:8px;z-index:11;">↺</button>
      <div id="tooltip" style="position:absolute;pointer-events:none;background:rgba(0,0,0,0.7);color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;display:none;"></div>
    </div>
  `;

  const container = appElement.querySelector<HTMLDivElement>('#d3-container')!;
  container.style.maxWidth = '100%';
  container.style.maxHeight = '100%';
  container.style.overflow = 'hidden';
  addFullscreenToggle(container);

  const resetBtn = container.querySelector<HTMLButtonElement>('#reset-view')!;
  const tooltip = container.querySelector<HTMLDivElement>('#tooltip')!;

  const data = generateSinData(40, 20);
  const { svg, resizeObserver, reset } = createPlot(container, data, tooltip, 20);

  resetBtn.addEventListener('click', reset);

  (appElement as HTMLElement & { cleanupThreeScene?: () => void }).cleanupThreeScene = () => {
    resetBtn.removeEventListener('click', reset);
    resizeObserver.disconnect();
    svg.remove();
  };
}
