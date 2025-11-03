# CodeQL Action

Custom CodeQL analysis action with repository-specific configurations and custom query suites.

## Overview

This action provides flexible CodeQL scanning with:

- **Automatic language detection** via GitHub API
- **Repository-specific configurations** in `repo-configs/`
- **Custom query suites** for specialized security analysis
- **Per-language build settings** (version, distribution, build commands)

## Architecture

The action works as part of the security scanning workflow:

1. **Language detector** creates scan matrix from detected languages
2. **Config loader** reads repo-specific config from `repo-configs/<repo-name>.js`
3. **Config generator** merges inputs with repo config and generates CodeQL config
4. **CodeQL** performs analysis and uploads SARIF results

## Inputs

| Input            | Required | Description                                                               |
| ---------------- | -------- | ------------------------------------------------------------------------- |
| `repo`           | ✅       | Repository name (format: `owner/repo`)                                    |
| `language`       | ✅       | Language to scan (e.g., `javascript-typescript`, `java-kotlin`, `python`) |
| `paths_ignored`  | ❌       | Newline-delimited paths to ignore                                         |
| `rules_excluded` | ❌       | Newline-delimited CodeQL rule IDs to exclude                              |
| `build_mode`     | ❌       | Build mode: `none`, `autobuild`, or `manual`                              |
| `build_command`  | ❌       | Build command for `manual` build mode                                     |
| `version`        | ❌       | Language/runtime version (e.g., `21` for Java, `3.10` for Python)         |
| `distribution`   | ❌       | Distribution (e.g., `temurin`, `zulu` for Java)                           |

## Usage

### Via Reusable Workflow (Recommended)

```yaml
name: Security Scan
on: [push, pull_request]

jobs:
  security-scan:
    uses: MetaMask/action-security-code-scanner/.github/workflows/security-scan.yml@v2
    with:
      scanner-ref: v2
    permissions:
      actions: read
      contents: read
      security-events: write
```

### Direct Action Usage

```yaml
- name: Run CodeQL Analysis
  uses: metamask/security-codescanner-monorepo/packages/codeql-action@main
  with:
    repo: ${{ github.repository }}
    language: javascript-typescript
    paths_ignored: |
      test/
      docs/
    rules_excluded: |
      js/log-injection
```

## Repository Configuration

### File-Based Config

Create `repo-configs/<repo-name>.js`:

```javascript
const config = {
  // Paths to ignore during scan
  pathsIgnored: ['test', 'vendor', 'node_modules'],

  // Rule IDs to exclude
  rulesExcluded: ['js/log-injection', 'js/unsafe-dynamic-method-access'],

  // Per-language configuration
  languages_config: [
    {
      language: 'java-kotlin',
      build_mode: 'manual',
      build_command: './gradlew :coordinator:app:build',
      version: '21',
      distribution: 'temurin',
    },
    {
      language: 'javascript-typescript',
      // Uses default config (no build needed)
    },
    {
      language: 'cpp',
      ignore: true, // Skip C++ scanning
    },
  ],

  // CodeQL query suites
  queries: [
    { name: 'Base security queries', uses: './query-suites/base.qls' },
    {
      name: 'Custom queries',
      uses: './custom-queries/query-suites/custom-queries.qls',
    },
  ],
};

export default config;
```

### Configuration Priority

1. **Workflow input** (highest priority) - overrides everything
2. **Repo config file** - `repo-configs/<repo-name>.js`
3. **Default config** - `repo-configs/default.js`

### Default Configurations

The action includes sensible defaults for common languages:

```javascript
const DEFAULT_CONFIGS = {
  javascript: { language: 'javascript-typescript' },
  typescript: { language: 'javascript-typescript' },
  python: { language: 'python' },
  go: { language: 'go' },
  java: {
    language: 'java-kotlin',
    build_mode: 'manual',
    build_command: './mvnw compile',
  },
  cpp: { language: 'cpp' },
  csharp: { language: 'csharp' },
  ruby: { language: 'ruby' },
};
```

## Supported Languages

| GitHub Language | CodeQL Language         | Build Required                     |
| --------------- | ----------------------- | ---------------------------------- |
| JavaScript      | `javascript-typescript` | No                                 |
| TypeScript      | `javascript-typescript` | No                                 |
| Python          | `python`                | No                                 |
| Java            | `java-kotlin`           | Yes (defaults to `./mvnw compile`) |
| Kotlin          | `java-kotlin`           | Yes                                |
| Go              | `go`                    | No                                 |
| C/C++           | `cpp`                   | Yes                                |
| C#              | `csharp`                | Yes                                |
| Ruby            | `ruby`                  | No                                 |

## Build Modes

### `none`

No build needed (interpreted languages like JavaScript, Python)

### `autobuild`

CodeQL automatically detects and runs build (works for simple projects)

### `manual`

Specify exact build command:

```javascript
{
  language: 'java-kotlin',
  build_mode: 'manual',
  build_command: './gradlew clean build'
}
```

## Custom Query Suites

Query suites define which CodeQL queries to run:

**Built-in suites:**

- `./query-suites/base.qls` - Standard security queries
- `./query-suites/linea-monorepo.qls` - Project-specific queries

**Custom queries:**

- Checked out from `metamask/CodeQL-Queries` repository
- Available at `./custom-queries/query-suites/custom-queries.qls`

## Troubleshooting

### Config not loading

- Filename must match repo: `owner/repo` → `repo.js`
- Must use ESM: `export default config`
- Check logs: `[config-loader] Loading config for repository: ...`

### Build failures

- Verify `build_command` works locally
- Check Java version matches `version` input
- Review build step logs in Actions

### Language not detected

- Check GitHub language stats (repo → Insights → Languages)
- Add language manually via `languages_config` in repo config
- Verify language mapping in `language-detector/src/job-configurator.js`

### SARIF upload errors

- Ensure workflow has `security-events: write` permission
- Check SARIF file is generated in `${{ steps.codeql-analysis.outputs.sarif-output }}`
- Review CodeQL analysis logs

## Security

See [SECURITY.md](../../SECURITY.md) for:

- Threat model and security boundaries
- Input validation approach
- Token permissions model

## Development

### Testing Config Changes

```bash
# Run config generator locally
cd packages/codeql-action
REPO=owner/repo LANGUAGE=javascript node scripts/generate-config.js

# Validate generated config
cat codeql-config-generated.yml
```

### Adding New Language Support

1. Add to `LANGUAGE_MAPPING` in `language-detector/src/job-configurator.js`
2. Add default config in `language-detector/src/job-configurator.js` → `DEFAULT_CONFIGS`
3. Update this README's supported languages table

## License

ISC
