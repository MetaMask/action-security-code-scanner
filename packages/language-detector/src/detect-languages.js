#!/usr/bin/env node

/**
 * CLI script to detect languages for a repository
 * Usage: node detect-languages.js <owner/repo> [github_token]
 */

import { fetchGitHubLanguages, detectLanguages } from './job-configurator.js';

async function main() {
  const [repo, token] = process.argv.slice(2);

  if (!repo) {
    console.error(
      'Usage: node detect-languages.js <owner/repo> [github_token]',
    );
    process.exit(1);
  }

  console.error(`Fetching languages for repository: ${repo}`);

  const githubLanguages = await fetchGitHubLanguages(repo, token);
  const detectedLanguages = detectLanguages(githubLanguages);

  // Debug output (goes to stderr, won't interfere with JSON output)
  console.error(
    '\n=================== LANGUAGE DETECTION DEBUG ===================',
  );
  console.error(`Repository: ${repo}`);
  console.error('\nDetected Languages:');
  console.error(JSON.stringify(detectedLanguages, null, 2));
  console.error('\nMatrix parsed:');
  try {
    const parsed = JSON.parse(JSON.stringify(detectedLanguages));
    console.error(JSON.stringify(parsed, null, 2));
  } catch (error) {
    console.error('Failed to parse matrix JSON:', error.message);
  }
  console.error(
    '=================================================================\n',
  );

  // Output JSON to stdout for consumption by GitHub Actions
  console.log(JSON.stringify(detectedLanguages));
}

// Only run main function when script is executed directly, not when imported
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}
