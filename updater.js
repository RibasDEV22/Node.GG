// updater.js - Sistema de Verificação de Atualizações

const REPO_OWNER = 'RibasDEV22';
const REPO_NAME = 'Zap-Zap-Website';
const CURRENT_VERSION = '1.0.0';

/**
 * Verifica se há uma nova versão publicada nas Releases do GitHub.
 */
async function checkForUpdates() {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': `${REPO_NAME}-Updater`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Nenhuma release encontrada no repositório.');
      }
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const latestVersion = data.tag_name.replace(/^v/, ''); // Limpa o "v" da tag (ex: v1.1.0 -> 1.1.0)

    const hasUpdate = isNewerVersion(CURRENT_VERSION, latestVersion);

    return {
      hasUpdate,
      currentVersion: CURRENT_VERSION,
      latestVersion,
      releaseName: data.name,
      downloadUrl: data.html_url,
      releaseNotes: data.body
    };
  } catch (error) {
    console.error('[Updater] Erro ao verificar atualizações:', error.message);
    return { hasUpdate: false, error: error.message };
  }
}

/**
 * Compara duas versões numéricas no formato SemVer (ex: 1.0.0 vs 1.1.0).
 */
function isNewerVersion(current, latest) {
  const c = current.split('.').map(Number);
  const l = latest.split('.').map(Number);

  for (let i = 0; i < Math.max(c.length, l.length); i++) {
    const currentNum = c[i] || 0;
    const latestNum = l[i] || 0;

    if (latestNum > currentNum) return true;
    if (latestNum < currentNum) return false;
  }

  return false;
}

// Exemplo de execução da verificação
checkForUpdates().then(result => {
  if (result.error) return;

  if (result.hasUpdate) {
    console.log(`Nova versão disponível! (Atual: ${result.currentVersion} -> Nova: ${result.latestVersion})`);
    console.log(`Acesse para baixar: ${result.downloadUrl}`);
  } else {
    console.log(`Você está executando a versão mais recente (${result.currentVersion}).`);
  }
});

if (typeof module !== 'undefined') {
  module.exports = { checkForUpdates, isNewerVersion };
}
