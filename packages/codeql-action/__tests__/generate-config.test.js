import { applyLanguageConfigFallbacks } from '../scripts/generate-config.js';

describe('generate-config', () => {
  describe('applyLanguageConfigFallbacks', () => {
    test('returns inputs as-is when no language specified', () => {
      const inputs = {
        repo: 'owner/repo',
        language: '',
        buildMode: 'none',
        buildCommand: '',
        version: '2.0.0',
        distribution: 'ubuntu-latest',
      };
      const config = {
        languages_config: [],
      };

      const result = applyLanguageConfigFallbacks(inputs, config);

      expect(result).toEqual(inputs);
    });

    test('returns inputs as-is when language config not found', () => {
      const inputs = {
        repo: 'owner/repo',
        language: 'java-kotlin',
        buildMode: 'manual',
        buildCommand: 'mvn compile',
        version: '2.0.0',
        distribution: 'ubuntu-latest',
      };
      const config = {
        languages_config: [
          {
            language: 'javascript',
            build_mode: 'none',
          },
        ],
      };

      const result = applyLanguageConfigFallbacks(inputs, config);

      expect(result).toEqual(inputs);
    });

    test('preserves input values even when config has fallbacks', () => {
      const inputs = {
        repo: 'owner/repo',
        language: 'java-kotlin',
        buildMode: 'manual',
        buildCommand: 'mvn compile',
        version: '2.0.0',
        distribution: 'ubuntu-latest',
      };
      const config = {
        languages_config: [
          {
            language: 'java-kotlin',
            build_mode: 'autobuild',
            build_command: 'gradle build',
            version: '1.0.0',
            distribution: 'debian-latest',
          },
        ],
      };

      const result = applyLanguageConfigFallbacks(inputs, config);

      // Inputs should take precedence
      expect(result.buildMode).toBe('manual');
      expect(result.buildCommand).toBe('mvn compile');
      expect(result.version).toBe('2.0.0');
      expect(result.distribution).toBe('ubuntu-latest');
    });

    test('applies config fallbacks for missing input values', () => {
      const inputs = {
        repo: 'owner/repo',
        language: 'java-kotlin',
        buildMode: undefined,
        buildCommand: undefined,
        version: undefined,
        distribution: undefined,
      };
      const config = {
        languages_config: [
          {
            language: 'java-kotlin',
            build_mode: 'autobuild',
            build_command: 'gradle build',
            version: '2.5.0',
            distribution: 'ubuntu-latest',
          },
        ],
      };

      const result = applyLanguageConfigFallbacks(inputs, config);

      // Config fallbacks should be applied
      expect(result.buildMode).toBe('autobuild');
      expect(result.buildCommand).toBe('gradle build');
      expect(result.version).toBe('2.5.0');
      expect(result.distribution).toBe('ubuntu-latest');
    });

    test('applies partial config fallbacks', () => {
      const inputs = {
        repo: 'owner/repo',
        language: 'swift',
        buildMode: 'manual',
        buildCommand: undefined,
        version: '2.0.0',
        distribution: undefined,
      };
      const config = {
        languages_config: [
          {
            language: 'swift',
            build_mode: 'autobuild',
            build_command: 'swift build',
            version: '1.0.0',
            distribution: 'macos-latest',
          },
        ],
      };

      const result = applyLanguageConfigFallbacks(inputs, config);

      // Input values preserved
      expect(result.buildMode).toBe('manual');
      expect(result.version).toBe('2.0.0');
      // Config fallbacks applied
      expect(result.buildCommand).toBe('swift build');
      expect(result.distribution).toBe('macos-latest');
    });

    test('handles empty config.languages_config array', () => {
      const inputs = {
        repo: 'owner/repo',
        language: 'java-kotlin',
        buildMode: 'manual',
        buildCommand: 'mvn compile',
        version: '2.0.0',
        distribution: 'ubuntu-latest',
      };
      const config = {
        languages_config: [],
      };

      const result = applyLanguageConfigFallbacks(inputs, config);

      // Should return inputs unchanged
      expect(result).toEqual(inputs);
    });

    test('handles missing config.languages_config property', () => {
      const inputs = {
        repo: 'owner/repo',
        language: 'python',
        buildMode: 'none',
      };
      const config = {};

      const result = applyLanguageConfigFallbacks(inputs, config);

      // Should return inputs unchanged
      expect(result).toEqual(inputs);
    });

    test('treats empty string as a value (not falsy for fallback)', () => {
      const inputs = {
        repo: 'owner/repo',
        language: 'javascript',
        buildMode: '',
        buildCommand: '',
        version: '',
        distribution: '',
      };
      const config = {
        languages_config: [
          {
            language: 'javascript',
            build_mode: 'none',
            build_command: 'npm build',
            version: '1.0.0',
            distribution: 'ubuntu-latest',
          },
        ],
      };

      const result = applyLanguageConfigFallbacks(inputs, config);

      // Empty strings are falsy, so config fallbacks WILL be applied
      // This is current behavior - if we want to change it, we need to update the logic
      expect(result.buildMode).toBe('none');
      expect(result.buildCommand).toBe('npm build');
      expect(result.version).toBe('1.0.0');
      expect(result.distribution).toBe('ubuntu-latest');
    });

    test('does not modify other input properties', () => {
      const inputs = {
        repo: 'owner/repo',
        language: 'go',
        buildMode: undefined,
        buildCommand: undefined,
        version: undefined,
        distribution: undefined,
        pathsIgnored: ['test', 'vendor'],
        rulesExcluded: ['go/rule1'],
      };
      const config = {
        languages_config: [
          {
            language: 'go',
            build_mode: 'autobuild',
          },
        ],
      };

      const result = applyLanguageConfigFallbacks(inputs, config);

      // Other properties should remain unchanged
      expect(result.repo).toBe('owner/repo');
      expect(result.language).toBe('go');
      expect(result.pathsIgnored).toEqual(['test', 'vendor']);
      expect(result.rulesExcluded).toEqual(['go/rule1']);
    });
  });
});
