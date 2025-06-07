import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Math text </h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)


const displayVersionInfo = (): void => {
  const versionElement = document.getElementById('version-info');
  if (!versionElement) {
    console.warn('Version info element (#version-info) not found.');
    return;
  }

  const commitHash: string | undefined = import.meta.env.VITE_COMMIT_HASH;
  const commitDateStr: string | undefined = import.meta.env.VITE_COMMIT_DATE;

  if (commitHash && commitDateStr) {
    try {
      const commitDate = new Date(commitDateStr);
      // Format date and time for better readability
      const formattedDate = commitDate.toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      });
      const formattedTime = commitDate.toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
      versionElement.textContent = `Last commit: ${commitHash} on ${formattedDate} at ${formattedTime}`;
    } catch (e) {
      console.error("Error parsing commit date:", commitDateStr, e);
      // Fallback display if date parsing fails
      versionElement.textContent = `Commit: ${commitHash} (Date: ${commitDateStr})`;
    }
  } else {
    versionElement.textContent = 'Version information not available.';
    // Optionally, provide more specific feedback during development
    if (import.meta.env.DEV) {
      versionElement.textContent = 'Version info (commit hash/date) is populated during the build process.';
    }
  }
};

// Ensure the DOM is fully loaded before trying to manipulate it.
document.addEventListener('DOMContentLoaded', displayVersionInfo);
