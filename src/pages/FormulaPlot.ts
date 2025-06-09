import 'mathlive';
import { computeFormula } from './formulaPlot/compute';
import { createThreePlot } from './formulaPlot/threePlot';
import { createD3Plot } from './formulaPlot/d3Plot';

/**
 * Page that lets the user input a formula and plots it in 3D using Three.js.
 * X axis represents the domain, Y is the real part and Z is the imaginary part.
 * The graph can be rotated with the mouse to inspect the imaginary component.
 */
export function renderFormulaPlot(appElement: HTMLElement): void {
  appElement.innerHTML = `
    <div style="margin-bottom:8px;">
      <label>Formula: <math-field id="formula-input">\\sin(x)</math-field></label>
    </div>
    <div id="real-range" style="margin-bottom:8px;">
      <label>Domain start: <input id="domain-start" type="number" value="0" step="any"></label>
      <label style="margin-left:4px;">Domain end: <input id="domain-end" type="number" value="6.28" step="any"></label>
      <button id="plot-btn" style="margin-left:4px;">Plot</button>
    </div>
    <div id="imag-range" style="display:none;margin-bottom:8px;">
      <label>Imag start: <input id="imag-start" type="number" value="-1" step="any"></label>
      <label style="margin-left:4px;">Imag end: <input id="imag-end" type="number" value="1" step="any"></label>
    </div>
    <div style="margin-bottom:8px;">
      <label><input type="checkbox" id="show-real" checked> Real part</label>
      <label style="margin-left:4px;"><input type="checkbox" id="show-imag" checked> Imag part</label>
    </div>
    <div id="three-container" style="width:100%;height:400px;position:relative;"></div>
    <div id="d3-container" style="width:100%;height:300px;position:relative;margin-top:8px;"></div>
  `;

  const formulaField = appElement.querySelector('math-field#formula-input') as HTMLElement & { value: string };
  const startInput = appElement.querySelector<HTMLInputElement>('#domain-start')!;
  const endInput = appElement.querySelector<HTMLInputElement>('#domain-end')!;
  const plotBtn = appElement.querySelector<HTMLButtonElement>('#plot-btn')!;
  const realCheckbox = appElement.querySelector<HTMLInputElement>('#show-real')!;
  const imagCheckbox = appElement.querySelector<HTMLInputElement>('#show-imag')!;
  const realRangeDiv = appElement.querySelector<HTMLDivElement>('#real-range')!;
  const imagRangeDiv = appElement.querySelector<HTMLDivElement>('#imag-range')!;
  const imagStartInput = appElement.querySelector<HTMLInputElement>('#imag-start')!;
  const imagEndInput = appElement.querySelector<HTMLInputElement>('#imag-end')!;
  const threeContainer = appElement.querySelector<HTMLDivElement>('#three-container')!;
  const d3Container = appElement.querySelector<HTMLDivElement>('#d3-container')!;

  const threePlot = createThreePlot(threeContainer);
  const d3Plot = createD3Plot(d3Container);

  function toggleRealRange(): void {
    realRangeDiv.style.display = realCheckbox.checked ? 'block' : 'none';
  }

  function toggleImagRange(): void {
    imagRangeDiv.style.display = imagCheckbox.checked ? 'block' : 'none';
  }

  function draw(): void {
    const domainStart = parseFloat(startInput.value);
    const domainEnd = parseFloat(endInput.value);
    let data;
    let imagStart: number | undefined;
    let imagEnd: number | undefined;
    if (imagCheckbox.checked) {
      const imStart = parseFloat(imagStartInput.value);
      const imEnd = parseFloat(imagEndInput.value);
      if (!Number.isNaN(imStart) && !Number.isNaN(imEnd)) {
        imagStart = imStart;
        imagEnd = imEnd;
      }
    }
    try {
      data = computeFormula(
        formulaField.value || '',
        domainStart,
        domainEnd,
        imagStart,
        imagEnd,
      );
    } catch {
      return;
    }

    const yValues = [
      ...data.realPoints.map(p => p.y),
      ...data.imagPoints.map(p => p.y),
    ];
    if (typeof imagStart === 'number' && typeof imagEnd === 'number') {
      yValues.push(imagStart, imagEnd);
    }

    threePlot.draw(data.realPositions, data.imagPositions, realCheckbox.checked, imagCheckbox.checked);
    d3Plot.draw(data.realPoints, data.imagPoints, realCheckbox.checked, imagCheckbox.checked);
  }

  function handleImagChange(): void {
    toggleImagRange();
    draw();
  }

  function handleRealChange(): void {
    toggleRealRange();
    draw();
  }

  plotBtn.addEventListener('click', draw);
  realCheckbox.addEventListener('change', handleRealChange);
  imagCheckbox.addEventListener('change', handleImagChange);
  toggleRealRange();
  toggleImagRange();
  draw();

  (appElement as HTMLElement & { cleanupThreeScene?: () => void }).cleanupThreeScene = () => {
    plotBtn.removeEventListener('click', draw);
    realCheckbox.removeEventListener('change', handleRealChange);
    imagCheckbox.removeEventListener('change', handleImagChange);
    d3Plot.cleanup();
    threePlot.cleanup();
  };
}
