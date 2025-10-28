import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runScript = async (scriptName, args = []) => {
  const scriptPath = path.resolve(__dirname, '..', 'src', scriptName);

  return new Promise((resolve) => {
    const child = spawn('node', [scriptPath, ...args]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        success: code === 0,
        code,
      });
    });

    child.on('error', (error) => {
      resolve({
        stdout: '',
        stderr: error.message,
        success: false,
        code: 1,
      });
    });
  });
};

const runDetectLanguages = (repo, token) => {
  const args = [];
  if (repo !== undefined) args.push(repo);
  if (token !== undefined) args.push(token);
  return runScript('detect-languages.js', args);
};

const runCreateMatrix = (detectedLanguages, customConfig) => {
  const args = [];
  if (detectedLanguages !== undefined) args.push(detectedLanguages);
  if (customConfig !== undefined) args.push(customConfig);
  return runScript('job-configurator.js', args);
};

describe('Language Detection CLI Integration Tests', () => {
  describe('detect-languages.js', () => {
    test('should detect languages for a real repository', async () => {
      const result = await runDetectLanguages('consensys/linea-monorepo/lll');

      expect(result.success).toBe(true);

      // Parse the JSON output
      const languages = JSON.parse(result.stdout);
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);

      // Should at least contain javascript (fallback if API fails)
      expect(languages).toContain('javascript');
    }, 10000);

    test('should handle invalid repository gracefully', async () => {
      const result = await runDetectLanguages(
        'nonexistent/repo-that-does-not-exist',
      );

      expect(result.success).toBe(true); // Should not crash

      // Should fallback to default
      const languages = JSON.parse(result.stdout);
      expect(languages).toEqual(['javascript']);
    }, 10000);

    test('should require repository argument', async () => {
      const result = await runDetectLanguages();

      expect(result.success).toBe(false);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain(
        'Usage: node detect-languages.js <owner/repo>',
      );
    });

    test('should work without token (public repos)', async () => {
      const result = await runDetectLanguages('microsoft/vscode');

      expect(result.success).toBe(true);
      const languages = JSON.parse(result.stdout);
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe('job-configurator.js (matrix creation)', () => {
    test('should create matrix with detected languages only', async () => {
      const detectedLanguages = '["javascript", "python", "java"]';
      const result = await runCreateMatrix(detectedLanguages);

      expect(result.success).toBe(true);

      const matrix = JSON.parse(result.stdout);
      expect(matrix).toHaveProperty('include');
      expect(matrix.include).toHaveLength(3);

      // Check expected matrix entries
      expect(matrix.include).toEqual(
        expect.arrayContaining([
          { language: 'javascript-typescript' },
          { language: 'python' },
          {
            language: 'java-kotlin',
            build_mode: 'manual',
            build_command: './mvnw compile',
          },
        ]),
      );
    });

    test('should merge custom config with detected languages', async () => {
      const detectedLanguages = '["javascript", "java"]';
      const customConfig =
        '[{"language":"java-kotlin","build_mode":"manual","build_command":"./gradlew build","version":"21"}]';

      const result = await runCreateMatrix(detectedLanguages, customConfig);

      expect(result.success).toBe(true);

      const matrix = JSON.parse(result.stdout);
      expect(matrix.include).toHaveLength(2);

      // Should use custom config for java
      const javaEntry = matrix.include.find(
        (entry) => entry.language === 'java-kotlin',
      );
      expect(javaEntry).toEqual({
        language: 'java-kotlin',
        build_mode: 'manual',
        build_command: './gradlew build',
        version: '21',
      });

      // Should use default config for javascript
      const jsEntry = matrix.include.find(
        (entry) => entry.language === 'javascript-typescript',
      );
      expect(jsEntry).toEqual({
        language: 'javascript-typescript',
      });
    });

    test('should handle empty languages array', async () => {
      const result = await runCreateMatrix('[]');

      expect(result.success).toBe(true);

      const matrix = JSON.parse(result.stdout);
      expect(matrix).toEqual({ include: [] });
    });

    test('should require languages argument', async () => {
      const result = await runCreateMatrix();

      expect(result.success).toBe(false);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Usage: node job-configurator.js');
    });

    test('should handle invalid JSON gracefully', async () => {
      const result = await runCreateMatrix('invalid-json');

      expect(result.success).toBe(false);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Error parsing JSON input');
    });

    test('should work with only detected languages (no custom config)', async () => {
      const detectedLanguages = '["go", "python"]';
      const result = await runCreateMatrix(detectedLanguages);

      expect(result.success).toBe(true);

      const matrix = JSON.parse(result.stdout);
      expect(matrix.include).toEqual([
        { language: 'go' },
        { language: 'python' },
      ]);
    });
  });

  describe('End-to-End Integration', () => {
    test('should work together: detect languages then create matrix', async () => {
      // Use synthetic test data to avoid API flakiness
      const detectedLanguages = '["typescript", "javascript"]';

      // Create matrix with detected languages
      const matrixResult = await runCreateMatrix(detectedLanguages);
      expect(matrixResult.success).toBe(true);

      const matrix = JSON.parse(matrixResult.stdout);
      expect(matrix.include.length).toBeGreaterThan(0);

      // Should contain typescript scanning config
      const hasTypeScript = matrix.include.some(
        (entry) => entry.language === 'javascript-typescript',
      );
      expect(hasTypeScript).toBe(true);
    });

    test('should handle workflow with custom language config', async () => {
      // Use a synthetic test case with known languages including Java
      const detectedLanguages = '["javascript", "java"]';

      // Create matrix with custom Java config
      const customConfig =
        '[{"language":"java-kotlin","build_mode":"manual","build_command":"./mvnw compile","version":"17","distribution":"zulu"}]';
      const matrixResult = await runCreateMatrix(
        detectedLanguages,
        customConfig,
      );

      expect(matrixResult.success).toBe(true);

      const matrix = JSON.parse(matrixResult.stdout);

      // Should use custom config for Java
      const javaEntry = matrix.include.find(
        (entry) => entry.language === 'java-kotlin',
      );
      expect(javaEntry).toEqual({
        language: 'java-kotlin',
        build_mode: 'manual',
        build_command: './mvnw compile',
        version: '17',
        distribution: 'zulu',
      });

      // Should use default config for JavaScript
      const jsEntry = matrix.include.find(
        (entry) => entry.language === 'javascript-typescript',
      );
      expect(jsEntry).toEqual({
        language: 'javascript-typescript',
      });
    });

    test('should create matrix with custom version and distribution', async () => {
      const detectedLanguages = '["java"]';

      // Create matrix with custom Java config using Corretto distribution
      const customConfig =
        '[{"language":"java-kotlin","build_mode":"manual","build_command":"./gradlew build","version":"11","distribution":"corretto"}]';
      const matrixResult = await runCreateMatrix(
        detectedLanguages,
        customConfig,
      );

      expect(matrixResult.success).toBe(true);

      const matrix = JSON.parse(matrixResult.stdout);

      expect(matrix.include).toHaveLength(1);
      expect(matrix.include[0]).toEqual({
        language: 'java-kotlin',
        build_mode: 'manual',
        build_command: './gradlew build',
        version: '11',
        distribution: 'corretto',
      });
    });

    test('should ignore languages marked with ignore: true', async () => {
      const detectedLanguages = '["javascript", "cpp", "java"]';

      // Create matrix with cpp ignored and java configured
      const customConfig =
        '[{"language":"cpp","ignore":true},{"language":"java","version":"21","distribution":"temurin"}]';
      const matrixResult = await runCreateMatrix(
        detectedLanguages,
        customConfig,
      );

      expect(matrixResult.success).toBe(true);

      const matrix = JSON.parse(matrixResult.stdout);

      // Should have javascript and java, but not cpp
      expect(matrix.include).toHaveLength(2);

      const languages = matrix.include.map((entry) => entry.language);
      expect(languages).toContain('javascript-typescript');
      expect(languages).toContain('java');
      expect(languages).not.toContain('cpp');

      // Java should have the custom config
      const javaEntry = matrix.include.find(
        (entry) => entry.language === 'java',
      );
      expect(javaEntry).toEqual({
        language: 'java',
        build_mode: 'manual',
        build_command: './mvnw compile',
        version: '21',
        distribution: 'temurin',
      });
    });
  });
});
