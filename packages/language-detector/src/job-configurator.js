/**
 * Language detection and matrix generation for code scanning
 */

import { loadRepoConfig } from '../../codeql-action/src/config-loader.js';

/**
 * Maps GitHub language names to CodeQL scanner language names
 */
const LANGUAGE_MAPPING = {
  'JavaScript': 'javascript',
  'TypeScript': 'typescript',
  'Python': 'python',
  'Go': 'go',
  'Java': 'java',
  'Kotlin': 'java', // Kotlin uses java scanner in CodeQL
  'C++': 'cpp',
  'C': 'cpp',
  'C#': 'csharp',
  'Ruby': 'ruby'
};

/**
 * Default scanner configurations for each language
 */
const DEFAULT_CONFIGS = {
  'javascript': { language: 'javascript-typescript' },
  'typescript': { language: 'javascript-typescript' },
  'python': { language: 'python' },
  'go': { language: 'go' },
  'java': { language: 'java-kotlin', build_mode: 'manual', build_command: './mvnw compile' },
  'cpp': { language: 'cpp' },
  'csharp': { language: 'csharp' },
  'ruby': { language: 'ruby' }
};

/**
 * Detects languages from GitHub API response
 * @param {Object} githubLanguages - GitHub API languages response
 * @returns {string[]} Array of detected language names for scanning
 */
export function detectLanguages(githubLanguages) {
  if (!githubLanguages || typeof githubLanguages !== 'object') {
    console.warn('Invalid GitHub languages data, defaulting to javascript');
    return ['javascript'];
  }

  const detectedLanguages = new Set();

  for (const [githubLang] of Object.entries(githubLanguages)) {
    const scannerLang = LANGUAGE_MAPPING[githubLang];
    if (scannerLang) {
      detectedLanguages.add(scannerLang);
    }
  }

  const languages = Array.from(detectedLanguages);

  if (languages.length === 0) {
    console.warn('No supported languages detected, defaulting to javascript');
    return ['javascript'];
  }

  return languages;
}

/**
 * Creates scanner matrix from detected languages and custom config
 * @param {string[]} detectedLanguages - Array of detected language names
 * @param {Object[]} languagesConfig - Custom language configurations
 * @returns {Object} Scanner matrix configuration
 */
export function createMatrix(detectedLanguages, languagesConfig = []) {
  const matrixIncludes = [];
  const customConfigMap = new Map();

  // Index custom configs by language
  for (const config of languagesConfig) {
    if (config.language) {
      customConfigMap.set(config.language, config);
    }
  }

  console.error('=== MATRIX CREATION DEBUG ===');
  console.error('Auto-detected languages:', detectedLanguages);
  console.error('Provided custom configs:', languagesConfig);

  // Remove duplicates from detected languages
  const uniqueLanguages = [...new Set(detectedLanguages)];

  for (const lang of uniqueLanguages) {
    // Check for custom config that matches this language
    const customConfig = Array.from(customConfigMap.values())
      .find(config => {
        // Match if the custom config language matches our detected language
        // or if it's the scanner language (e.g., 'java-kotlin' for 'java')
        return config.language === lang ||
               (DEFAULT_CONFIGS[lang] && config.language === DEFAULT_CONFIGS[lang].language);
      });

    const defaultConfig = DEFAULT_CONFIGS[lang];

    // Check if language should be ignored
    if (customConfig && customConfig.ignore === true) {
      console.error(`⚠️  ${lang} detected but marked as ignored - skipping`);
      continue;
    }

    if (customConfig && defaultConfig) {
      // Merge custom config with default config (custom config takes priority)
      const mergedConfig = { ...defaultConfig, ...customConfig };
      // Remove ignore property from final config as it's only for control flow
      delete mergedConfig.ignore;
      matrixIncludes.push(mergedConfig);
    } else if (customConfig) {
      // Remove ignore property from final config as it's only for control flow
      const finalConfig = { ...customConfig };
      delete finalConfig.ignore;
      matrixIncludes.push(finalConfig);
    } else if (defaultConfig) {
      matrixIncludes.push(defaultConfig);
    }
  }

  // Deduplicate matrix entries by language
  const seenLanguages = new Set();
  const uniqueMatrixIncludes = matrixIncludes.filter(entry => {
    if (seenLanguages.has(entry.language)) {
      return false;
    }
    seenLanguages.add(entry.language);
    return true;
  });

  const matrix = { include: uniqueMatrixIncludes };

  console.error('=== FINAL MATRIX DEBUG ===');
  console.error('Generated matrix:', JSON.stringify(matrix, null, 2));
  console.error(`Total matrix entries: ${uniqueMatrixIncludes.length}`);
  console.error('============================');

  return matrix;
}

// CLI functionality for when this script is run directly
async function main() {
  const [detectedLanguagesJson, languagesConfigJson, repo, configDir] = process.argv.slice(2);

  if (!detectedLanguagesJson) {
    console.error('Usage: node job-configurator.js <detected_languages_json> [languages_config_json] [repo] [config_dir]');
    console.error('Example: node job-configurator.js \'{"Java": 1000, "JavaScript": 500}\' \'[{"language":"java","version":"21"}]\' \'owner/repo\' \'/path/to/configs\'');
    process.exit(1);
  }

  try {
    const githubLanguagesOrArray = JSON.parse(detectedLanguagesJson);
    let languagesConfig = languagesConfigJson ? JSON.parse(languagesConfigJson) : [];

    // Load repo-specific config from file if repo and configDir are provided
    if (repo && configDir) {
      // Use shared config loader from codeql-action package
      const repoConfig = await loadRepoConfig(repo, configDir);
      const fileLanguagesConfig = repoConfig.languages_config || [];

      // Merge configs: workflow input takes precedence over file config
      // Create a map of file configs by language
      const fileConfigMap = new Map();
      for (const config of fileLanguagesConfig) {
        if (config.language) {
          fileConfigMap.set(config.language, config);
        }
      }

      // Create a map of workflow input configs by language
      const inputConfigMap = new Map();
      for (const config of languagesConfig) {
        if (config.language) {
          inputConfigMap.set(config.language, config);
        }
      }

      // Merge: start with file configs, then add/override with workflow inputs
      const mergedConfigs = [...fileLanguagesConfig];
      for (const [lang, inputConfig] of inputConfigMap.entries()) {
        const fileConfig = fileConfigMap.get(lang);
        if (fileConfig) {
          // Merge: workflow input overrides file config
          const mergedConfig = { ...fileConfig, ...inputConfig };
          const index = mergedConfigs.findIndex(c => c.language === lang);
          mergedConfigs[index] = mergedConfig;
        } else {
          // New language only in workflow input
          mergedConfigs.push(inputConfig);
        }
      }

      languagesConfig = mergedConfigs;
    }

    // Handle both GitHub API format (object) and pre-processed array
    let detectedLanguages;
    if (Array.isArray(githubLanguagesOrArray)) {
      // Already processed array of language names
      detectedLanguages = githubLanguagesOrArray;
    } else {
      // GitHub API response format - process it
      detectedLanguages = detectLanguages(githubLanguagesOrArray);
    }

    const matrix = createMatrix(detectedLanguages, languagesConfig);

    // Output JSON to stdout for consumption by GitHub Actions
    console.log(JSON.stringify(matrix));
  } catch (error) {
    console.error('Error parsing JSON input:', error.message);
    process.exit(1);
  }
}

// Only run main function when script is executed directly, not when imported
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

/**
 * Fetches language data from GitHub API
 * @param {string} repo - Repository in format 'owner/repo'
 * @param {string} token - GitHub token (optional)
 * @returns {Promise<Object>} GitHub languages API response
 */
export async function fetchGitHubLanguages(repo, token) {
  const url = `https://api.github.com/repos/${repo}/languages`;
  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.error('=== GITHUB API RESPONSE ===');
    console.error('Raw API response:', JSON.stringify(data, null, 2));
    console.error('GitHub languages with byte counts:');
    for (const [lang, bytes] of Object.entries(data)) {
      console.error(`  ${lang}: ${bytes} bytes`);
    }
    console.error('===========================');

    return data;
  } catch (error) {
    console.error('Failed to fetch GitHub languages:', error.message);
    return {};
  }
}


