import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ejs from 'ejs';
import { loadRepoConfig } from '../src/config-loader.js';
import {
  validateRequiredInputs,
  sanitizePath,
  sanitizeRuleId,
  escapeOutput,
} from '../src/validation.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const applyLanguageConfigFallbacks = (inputs, config) => {
  // If no language is specified, return inputs as-is
  if (!inputs.language) {
    return inputs;
  }

  // Find matching language config from languages_config array
  const languageConfig = config.languages_config?.find(
    (langConfig) => langConfig.language === inputs.language,
  );

  if (!languageConfig) {
    return inputs;
  }

  // Note: Ignore checking is now handled by language-detector during matrix creation
  // Languages marked as ignored won't appear in the matrix, so we don't need to check here

  // Apply fallbacks for missing inputs
  const inputsWithFallbacks = { ...inputs };

  if (!inputsWithFallbacks.buildMode && languageConfig.build_mode) {
    inputsWithFallbacks.buildMode = languageConfig.build_mode;
  }

  if (!inputsWithFallbacks.buildCommand && languageConfig.build_command) {
    inputsWithFallbacks.buildCommand = languageConfig.build_command;
  }

  if (!inputsWithFallbacks.version && languageConfig.version) {
    inputsWithFallbacks.version = languageConfig.version;
  }

  if (!inputsWithFallbacks.distribution && languageConfig.distribution) {
    inputsWithFallbacks.distribution = languageConfig.distribution;
  }

  return inputsWithFallbacks;
};

// Main execution function
async function main() {
  const outputFile = process.env.GITHUB_OUTPUT;
  const template = fs.readFileSync('config/codeql-template.yml', 'utf8');

  const {
    REPO,
    LANGUAGE,
    BUILD_MODE,
    BUILD_COMMAND,
    VERSION,
    DISTRIBUTION,
    PATHS_IGNORED,
    RULES_EXCLUDED,
  } = process.env;

  const inputs = {
    repo: REPO,
    language: LANGUAGE,
    buildMode: BUILD_MODE,
    buildCommand: BUILD_COMMAND,
    version: VERSION,
    distribution: DISTRIBUTION,
    pathsIgnored: PATHS_IGNORED
      ? PATHS_IGNORED.split('\n')
          .filter((line) => line.trim() !== '')
          .map(sanitizePath)
      : [],
    rulesExcluded: RULES_EXCLUDED
      ? RULES_EXCLUDED.split('\n')
          .filter((line) => line.trim() !== '')
          .map(sanitizeRuleId)
      : [],
  };

  // Validate required inputs
  validateRequiredInputs(inputs);

  const config = await loadRepoConfig(
    inputs.repo,
    path.join(__dirname, '..', 'repo-configs'),
  );

  // Apply language-specific config fallbacks
  const finalInputs = applyLanguageConfigFallbacks(inputs, config);

  // set languages output (safely escaped) - inputs take precedence over config
  const languages = inputs.language || config.languages || '';
  fs.appendFileSync(outputFile, `languages=${escapeOutput(languages)}\n`);

  // set resolved values - inputs take precedence, then config fallbacks (safely escaped)
  const buildMode = inputs.buildMode || finalInputs.buildMode || '';
  const buildCommand = inputs.buildCommand || finalInputs.buildCommand || '';
  const version = inputs.version || finalInputs.version || '';
  const distribution = inputs.distribution || finalInputs.distribution || '';

  fs.appendFileSync(outputFile, `build_mode=${escapeOutput(buildMode)}\n`);
  fs.appendFileSync(
    outputFile,
    `build_command=${escapeOutput(buildCommand)}\n`,
  );
  fs.appendFileSync(outputFile, `version=${escapeOutput(version)}\n`);
  fs.appendFileSync(outputFile, `distribution=${escapeOutput(distribution)}\n`);

  const output = ejs.render(template, {
    pathsIgnored: [...config.pathsIgnored, ...finalInputs.pathsIgnored],
    rulesExcluded: [...config.rulesExcluded, ...finalInputs.rulesExcluded],
    queries: config.queries,
  });

  // Write to workspace root (or current directory if GITHUB_WORKSPACE not set)
  const outputPath = process.env.GITHUB_WORKSPACE
    ? path.join(process.env.GITHUB_WORKSPACE, 'codeql-config-generated.yml')
    : 'codeql-config-generated.yml';

  fs.writeFileSync(outputPath, output);
}

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}
