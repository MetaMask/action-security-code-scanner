import { loadRepoConfig, getDefaultConfig } from '../src/config-loader.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('config-loader', () => {
  describe('getDefaultConfig', () => {
    test('returns default configuration', () => {
      const config = getDefaultConfig();

      expect(config).toHaveProperty('pathsIgnored');
      expect(config).toHaveProperty('rulesExcluded');
      expect(config).toHaveProperty('languages_config');
      expect(config).toHaveProperty('queries');

      expect(Array.isArray(config.pathsIgnored)).toBe(true);
      expect(Array.isArray(config.rulesExcluded)).toBe(true);
      expect(Array.isArray(config.queries)).toBe(true);
    });

    test('includes expected default values', () => {
      const config = getDefaultConfig();

      expect(config.pathsIgnored).toContain('test');
      expect(config.rulesExcluded).toContain('js/log-injection');
      expect(config.queries.length).toBeGreaterThan(0);
    });
  });

  describe('loadRepoConfig', () => {
    test('loads existing repo config', async () => {
      // Test with the existing lll.js config
      const configDir = path.join(__dirname, '..', 'repo-configs');
      const config = await loadRepoConfig('owner/lll', configDir);

      expect(config).toBeDefined();
      expect(config).toHaveProperty('pathsIgnored');
      expect(config).toHaveProperty('queries');
    });

    test('falls back to default.js when repo config not found', async () => {
      const configDir = path.join(__dirname, '..', 'repo-configs');
      const config = await loadRepoConfig('owner/nonexistent-repo', configDir);

      // Should return default config
      expect(config).toBeDefined();
      expect(config.pathsIgnored).toContain('test');
    });

    test('returns default config when config directory does not exist', async () => {
      const config = await loadRepoConfig('owner/repo', '/nonexistent/path');

      expect(config).toBeDefined();
      expect(config).toHaveProperty('pathsIgnored');
      expect(config).toHaveProperty('rulesExcluded');
    });

    test('handles malformed config gracefully', async () => {
      // Create temp directory with config that throws an error
      const tempDir = path.join(__dirname, 'temp-configs');
      fs.mkdirSync(tempDir, { recursive: true });

      try {
        // Write a config that will cause an error when evaluated (but is valid JS)
        const badConfigPath = path.join(tempDir, 'errorconfig.js');
        fs.writeFileSync(badConfigPath, 'throw new Error("Config error"); export default {};');

        const config = await loadRepoConfig('owner/errorconfig', tempDir);

        // Should fall back to default config
        expect(config).toBeDefined();
        expect(config.pathsIgnored).toContain('test');
      } finally {
        // Cleanup - ensure it runs even if test fails
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    });

    test('extracts repo name from owner/repo format', async () => {
      const configDir = path.join(__dirname, '..', 'repo-configs');

      // Should look for lll.js (not owner/lll.js)
      const config = await loadRepoConfig('metamask/lll', configDir);

      expect(config).toBeDefined();
      // If lll.js exists, it should load it; otherwise default
    });
  });
});
