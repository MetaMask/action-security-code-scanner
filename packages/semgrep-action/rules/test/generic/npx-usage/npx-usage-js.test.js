const { execSync, exec, spawn, spawnSync } = require('child_process');

// Test cases that should be flagged

// Template literal with interpolation (like coverage-analysis.js:234)
function runTests() {
  const testArgs = 'test/*.js';
  // ruleid: npx-usage-js
  const cmd = `npx jest ${testArgs} --coverage --coverageReporters=lcov`;
  execSync(cmd);
}

// Template literal passed directly to exec
function lintCode() {
  // ruleid: npx-usage-js
  execSync(`npx eslint src/`);
}

// String literal in error message (like global.setup.ts:72)
// Now caught with regex - flags npx usage anywhere in strings including docs/examples
function throwError() {
  throw new Error(
    // ruleid: npx-usage-js
    'Please specify a project name with --project flag. Example: npx playwright test --project dummy-test-local',
  );
}

// String literal with scoped package
function formatCode() {
  // ruleid: npx-usage-js
  const command = 'npx @typescript-eslint/parser --version';
  exec(command);
}

// Template literal with output redirection
function generateFingerprint() {
  // ruleid: npx-usage-js
  exec(`npx @expo/fingerprint ./ > fingerprint.json`);
}

// Template literal with flags
function setupTool() {
  // ruleid: npx-usage-js
  const setupCmd = `npx --yes create-react-app my-app`;
  execSync(setupCmd);
}

// Template literal with environment variables
function runWithEnv() {
  const workspace = process.env.GITHUB_WORKSPACE;
  // ruleid: npx-usage-js
  spawn(`npx jest ${workspace} --coverage`);
}

// Template literal in command chain
function buildAndTest() {
  // ruleid: npx-usage-js
  execSync(`yarn build && npx jest --coverage`);
}

// String literal assigned to variable
function assignCommand() {
  // ruleid: npx-usage-js
  let cmd = 'npx prettier --write .';
  return cmd;
}

// Test cases that should NOT be flagged

// Using yarn instead
function goodYarnUsage() {
  // ok: npx-usage-js
  execSync(`yarn jest --coverage`);
}

// Using npm scripts
function goodNpmUsage() {
  // ok: npx-usage-js
  execSync('npm run test');
}

// Using yarn dlx
function goodYarnDlx() {
  // ok: npx-usage-js
  const cmd = `yarn dlx create-react-app my-app`;
  execSync(cmd);
}

// Direct node execution
function goodNodeUsage() {
  // ok: npx-usage-js
  exec('node scripts/build.js');
}

// Comment mentioning npx - should be ignored automatically
// This comment talks about npx but isn't code execution
function withComment() {
  // ok: npx-usage-js
  execSync('yarn test');
}

// Variable name contains "npx" but not executing it
function variableName() {
  // ok: npx-usage-js
  const shouldUseNpx = false;
  const npxWarning = 'Dont use npx!';
  console.log(npxWarning);
}
