// /Users/aleksandrtopilskii/AndroidStudioProjects/MathNodeJsPages/src/versionInfo.ts

/**
 * Создает и отображает блок с информацией о последнем коммите.
 * Информация извлекается из переменных окружения Vite (VITE_COMMIT_HASH, VITE_COMMIT_DATE).
 */
export function displayVersionBanner(): void {
  const existing = document.getElementById('version-info-banner');
  const versionElement = existing ?? document.createElement('div');
  versionElement.id = 'version-info-banner';

  // Применяем стили программно
  Object.assign(versionElement.style, {
    padding: '5px 10px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
    fontSize: '12px',
    color: '#6c757d',
    textAlign: 'center',
    fontFamily: 'sans-serif', // Добавим шрифт для консистентности
  });

  const commitHash: string | undefined = import.meta.env.VITE_COMMIT_HASH;
  const commitDateStr: string | undefined = import.meta.env.VITE_COMMIT_DATE;

  if (commitHash && commitDateStr) {
    try {
      const commitDate = new Date(commitDateStr);
      const formattedDate = commitDate.toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      });
      const formattedTime = commitDate.toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
      versionElement.innerHTML = `Commit: ${commitHash}<br>Date: ${formattedDate}<br>Time: ${formattedTime}`;
    } catch (e) {
      console.error("Error parsing commit date:", commitDateStr, e);
      versionElement.innerHTML = `Commit: ${commitHash}<br>(Date: ${commitDateStr})`;
    }
  } else {
    versionElement.textContent = 'Version information not available.';
    if (import.meta.env.DEV) {
      versionElement.textContent = 'Version info (commit hash/date) is populated during the build process.';
    }
  }

  if (!existing) {
    if (document.body) {
      document.body.prepend(versionElement);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.prepend(versionElement);
      });
    }
  }
}
