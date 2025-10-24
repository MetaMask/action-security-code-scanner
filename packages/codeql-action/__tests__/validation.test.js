import {
  validateRequiredInputs,
  sanitizePath,
  sanitizeRuleId,
  escapeOutput
} from '../src/validation.js';

describe('validation', () => {
  describe('validateRequiredInputs', () => {
    test('passes when repo and language are provided', () => {
      const inputs = { repo: 'owner/repo', language: 'javascript' };
      expect(() => validateRequiredInputs(inputs)).not.toThrow();
    });

    test('throws when repo is missing', () => {
      const inputs = { language: 'javascript' };
      expect(() => validateRequiredInputs(inputs)).toThrow('Missing required inputs');
    });

    test('throws when language is missing', () => {
      const inputs = { repo: 'owner/repo' };
      expect(() => validateRequiredInputs(inputs)).toThrow('Missing required inputs');
    });

    test('throws when both are missing', () => {
      const inputs = {};
      expect(() => validateRequiredInputs(inputs)).toThrow('Missing required inputs');
    });

    test('throws when repo is empty string', () => {
      const inputs = { repo: '', language: 'javascript' };
      expect(() => validateRequiredInputs(inputs)).toThrow('Missing required inputs');
    });

    test('throws when language is empty string', () => {
      const inputs = { repo: 'owner/repo', language: '' };
      expect(() => validateRequiredInputs(inputs)).toThrow('Missing required inputs');
    });
  });

  describe('sanitizePath', () => {
    test('removes semicolons', () => {
      expect(sanitizePath('test;rm -rf /')).toBe('testrm -rf /');
    });

    test('removes pipes', () => {
      expect(sanitizePath('test|cat /etc/passwd')).toBe('testcat /etc/passwd');
    });

    test('removes backticks', () => {
      expect(sanitizePath('test`whoami`')).toBe('testwhoami');
    });

    test('removes dollar signs', () => {
      expect(sanitizePath('test$(whoami)')).toBe('testwhoami');
    });

    test('removes ampersands', () => {
      expect(sanitizePath('test&background')).toBe('testbackground');
    });

    test('removes parentheses', () => {
      expect(sanitizePath('test(subshell)')).toBe('testsubshell');
    });

    test('removes braces', () => {
      expect(sanitizePath('test{1,2,3}')).toBe('test1,2,3');
    });

    test('removes brackets', () => {
      expect(sanitizePath('test[0-9]')).toBe('test0-9');
    });

    test('removes angle brackets', () => {
      expect(sanitizePath('test<input>output')).toBe('testinputoutput');
    });

    test('preserves valid path characters', () => {
      expect(sanitizePath('src/components/Button.tsx')).toBe('src/components/Button.tsx');
      expect(sanitizePath('test-utils/helpers_v2.js')).toBe('test-utils/helpers_v2.js');
      expect(sanitizePath('./node_modules/@types')).toBe('./node_modules/@types');
    });

    test('handles multiple dangerous characters', () => {
      expect(sanitizePath('test;$(rm -rf /)|cat&')).toBe('testrm -rf /cat');
    });
  });

  describe('sanitizeRuleId', () => {
    test('preserves valid rule IDs', () => {
      expect(sanitizeRuleId('js/log-injection')).toBe('js/log-injection');
      expect(sanitizeRuleId('py/sql-injection')).toBe('py/sql-injection');
      expect(sanitizeRuleId('java/unsafe-deserialization')).toBe('java/unsafe-deserialization');
    });

    test('preserves underscores', () => {
      expect(sanitizeRuleId('js/unsafe_dynamic_access')).toBe('js/unsafe_dynamic_access');
    });

    test('removes special characters', () => {
      expect(sanitizeRuleId('js/rule;injection')).toBe('js/ruleinjection');
      expect(sanitizeRuleId('py/rule|pipe')).toBe('py/rulepipe');
      expect(sanitizeRuleId('java/rule@special')).toBe('java/rulespecial');
    });

    test('removes spaces', () => {
      expect(sanitizeRuleId('js/log injection')).toBe('js/loginjection');
    });

    test('removes shell metacharacters', () => {
      expect(sanitizeRuleId('js/rule$(whoami)')).toBe('js/rulewhoami');
      expect(sanitizeRuleId('js/rule`cmd`')).toBe('js/rulecmd');
    });

    test('handles empty string', () => {
      expect(sanitizeRuleId('')).toBe('');
    });
  });

  describe('escapeOutput', () => {
    test('escapes percent signs', () => {
      expect(escapeOutput('test%value')).toBe('test%25value');
      expect(escapeOutput('100%')).toBe('100%25');
    });

    test('escapes carriage returns', () => {
      expect(escapeOutput('test\rvalue')).toBe('test%0Dvalue');
    });

    test('escapes newlines', () => {
      expect(escapeOutput('test\nvalue')).toBe('test%0Avalue');
    });

    test('escapes multiple special characters', () => {
      expect(escapeOutput('line1\nline2\rvalue%')).toBe('line1%0Aline2%0Dvalue%25');
    });

    test('escapes percent before newlines (order matters)', () => {
      // Percent must be escaped first, otherwise %0A becomes %250A
      const result = escapeOutput('%\n');
      expect(result).toBe('%25%0A');
      expect(result).not.toBe('%250A');
    });

    test('handles empty values', () => {
      expect(escapeOutput('')).toBe('');
      expect(escapeOutput(null)).toBe('');
      expect(escapeOutput(undefined)).toBe('');
    });

    test('converts non-string values to string', () => {
      expect(escapeOutput(123)).toBe('123');
      expect(escapeOutput(true)).toBe('true');
    });

    test('handles values without special characters', () => {
      expect(escapeOutput('normal-value')).toBe('normal-value');
      expect(escapeOutput('test_123')).toBe('test_123');
    });

    test('prevents workflow variable injection', () => {
      // Example of potential injection attempt
      const malicious = 'value\nmalicious_var=injected';
      expect(escapeOutput(malicious)).toBe('value%0Amalicious_var=injected');
    });
  });
});
