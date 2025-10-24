import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Loads repository-specific configuration
 * @param {string} repo - Repository name in format 'owner/repo'
 * @param {string} configDir - Directory containing repo configs (optional, defaults to '../repo-configs')
 * @returns {Promise<Object>} Configuration object with pathsIgnored, rulesExcluded, languages_config, queries
 */
export async function loadRepoConfig(repo, configDir = null) {
  try {
    const repoName = repo.split('/')[1];

    // Determine config directory
    const baseDir = configDir || path.join(__dirname, '..', 'repo-configs');
    const repoConfigPath = path.join(baseDir, `${repoName}.js`);

    if (!fs.existsSync(repoConfigPath)) {
      // Try default config
      const defaultConfigPath = path.join(baseDir, 'default.js');

      if (!fs.existsSync(defaultConfigPath)) {
        return getDefaultConfig();
      }

      const defaultModule = await import(`file://${defaultConfigPath}`);
      return defaultModule.default;
    }

    const configModule = await import(`file://${repoConfigPath}`);
    return configModule.default;

  } catch (error) {
    console.error(`Error loading config for "${repo}": ${error.message}`);
    console.error('Falling back to default configuration');
    return getDefaultConfig();
  }
}

/**
 * Returns a basic default configuration when no config file is found
 * @returns {Object} Default configuration
 */
export function getDefaultConfig() {
  return {
    pathsIgnored: ['test'],
    rulesExcluded: ['js/log-injection'],
    languages_config: [],
    queries: [
      {
        name: 'Security-extended queries for JavaScript',
        uses: './query-suites/base.qls',
      },
      {
        name: 'Security Code Scanner Custom Queries',
        uses: './custom-queries/query-suites/custom-queries.qls',
      },
    ],
  };
}
