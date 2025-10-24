# Language Detector Action

Detects programming languages in a repository using the GitHub API and creates a scanner matrix configuration.

## Usage

```yaml
- name: Detect Languages
  id: detect
  uses: ./packages/language-detector
  with:
    repo: 'owner/repo-name'
    languages_config: |
      [
        {
          "language": "java-kotlin",
          "build_mode": "manual",
          "build_command": "./gradlew build",
          "version": "21",
          "distribution": "temurin"
        }
      ]

- name: Use Results
  run: |
    echo "Languages: ${{ steps.detect.outputs.languages }}"
    echo "Matrix: ${{ steps.detect.outputs.matrix }}"
```

## Development

### Install Dependencies

```bash
cd packages/language-detector
yarn install
```

### Testing

```bash
# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Test CLI scripts directly
yarn detect "owner/repo"
yarn matrix '["javascript", "java"]' '[{"language":"java","build_mode":"manual"}]'
```

### Test in GitHub Actions

Go to Actions → Test Language Detector → Run workflow

## Architecture

- `src/job-configurator.js` - Core language detection and matrix logic
- `src/detect-languages.js` - CLI script for language detection
- `src/create-matrix.js` - CLI script for matrix creation
- `__tests__/` - Jest test suite
- `action.yml` - GitHub Action wrapper

The JavaScript implementation provides:
- ✅ **Comprehensive test coverage with Jest** - Both unit and integration tests
- ✅ **Safe integration testing** - No shell execution, direct function calls
- ✅ **Fast and reliable tests** - ~1.3s runtime, no process spawning overhead
- ✅ **Better error handling and debugging** - Direct JavaScript error handling
- ✅ **Type safety with JSDoc** - Clear function signatures and documentation
- ✅ **Modular, testable code** - Clean separation of CLI and core logic