import { execSync, exec, spawn } from 'child_process';

// Test cases that should be flagged in TypeScript

// Template literal with type annotation (like global.setup.ts scenario)
function runPlaywrightTests(): void {
  const project: string = 'test-project';
  // ruleid: npx-usage-js
  const command: string = `npx playwright test --project ${project}`;
  execSync(command);
}

// Error message with npx example
function throwConfigError(): never {
  throw new Error(
    // ruleid: npx-usage-js
    'Please specify a project name with --project flag. Example: npx playwright test --project dummy-test-local'
  );
}

// Arrow function with template literal
const buildApp = (): void => {
  // ruleid: npx-usage-js
  execSync(`npx tsc --build`);
};

// Async function
async function deployApp(): Promise<void> {
  // ruleid: npx-usage-js
  await exec(`npx vercel deploy`);
}

// String literal with type assertion
function formatFiles(): void {
  // ruleid: npx-usage-js
  const cmd = "npx prettier --write ." as const;
  execSync(cmd);
}

// Template literal in class method
class TestRunner {
  runTests(): void {
    const coverage: boolean = true;
    // ruleid: npx-usage-js
    execSync(`npx jest ${coverage ? '--coverage' : ''}`);
  }
}

// Good examples that should NOT be flagged

function useYarnProperly(): void {
  // ok: npx-usage-js
  execSync('yarn test --coverage');
}

function useNpmScript(): void {
  // ok: npx-usage-js
  exec('npm run build');
}

function useYarnDlx(): void {
  // ok: npx-usage-js
  const cmd: string = `yarn dlx create-next-app my-app`;
  execSync(cmd);
}
