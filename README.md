# Security Code Scanner Monorepo

> Unified security code scanning system with CodeQL and Semgrep

## 🏗️ Architecture

This monorepo provides a reusable security scanning workflow with automatic language detection and parallel execution:

- **`.github/workflows/security-scan.yml`** - Main reusable workflow (orchestrator)
- **`packages/language-detector/`** - Detects languages and creates scan matrix
- **`packages/codeql-action/`** - Custom CodeQL analysis with repo-specific configs
- **`packages/semgrep-action/`** - Semgrep pattern-based scanner

## 🚀 Quick Start

### Using the Scanner (Recommended)

Add to your repository's `.github/workflows/security.yml`:

```yaml
name: 'Security Scan'
on: [push, pull_request]

jobs:
  security-scan:
    uses: metamask/security-codescanner-monorepo/.github/workflows/security-scan.yml@main
    with:
      repo: ${{ github.repository }}
```

The workflow will:

1. Auto-detect languages in your repository
2. Load repo-specific config from `repo-configs/` (or use defaults)
3. Run CodeQL and Semgrep scans in parallel
4. Upload SARIF results to GitHub Security tab

### Custom Configuration

**Option 1: File-based config (recommended)**

Create `repo-configs/<your-repo-name>.js` in this monorepo:

```javascript
const config = {
  pathsIgnored: ['test', 'docs'],
  rulesExcluded: ['js/log-injection'],
  languages_config: [
    {
      language: 'java-kotlin',
      build_mode: 'manual',
      build_command: './gradlew build',
      version: '21',
      distribution: 'temurin',
    },
  ],
  queries: [
    { name: 'Security queries', uses: './query-suites/base.qls' },
    {
      name: 'Custom queries',
      uses: './custom-queries/query-suites/custom-queries.qls',
    },
  ],
};

export default config;
```

**Option 2: Workflow input (overrides file config)**

```yaml
jobs:
  security-scan:
    uses: metamask/security-codescanner-monorepo/.github/workflows/security-scan.yml@main
    with:
      repo: ${{ github.repository }}
      languages_config: |
        [
          {
            "language": "java-kotlin",
            "build_mode": "manual",
            "build_command": "./gradlew build",
            "version": "21"
          }
        ]
      paths_ignored: 'test,docs'
      rules_excluded: 'js/log-injection,py/sql-injection'
```

### Testing from Dev Branch

When testing changes to the security scanner itself from a dev branch, you must explicitly pass the `ref` input:

```yaml
jobs:
  security-scan:
    uses: metamask/security-codescanner-monorepo/.github/workflows/security-scan.yml@dev-branch
    with:
      repo: ${{ github.repository }}
      ref: dev-branch # Must explicitly pass the branch name
```

**Note**: The `@branch` in the `uses:` statement only affects which workflow file is used. The `ref` input ensures all internal monorepo checkouts use the same branch.

## 📦 Package Structure

```
security-scanner-monorepo/
├── .github/workflows/
│   └── security-scan.yml        # Main reusable workflow
├── packages/
│   ├── language-detector/       # Language detection & matrix creation
│   ├── codeql-action/          # CodeQL scanner
│   │   ├── repo-configs/       # Repository-specific configs
│   │   ├── query-suites/       # CodeQL query suites
│   │   ├── scripts/            # Config generation scripts
│   │   └── src/                # Shared utilities
│   └── semgrep-action/         # Semgrep scanner
└── SECURITY.md                  # Security model documentation
```

## 🔧 Development

### Setup

```bash
# Install dependencies
yarn install

# Run linting
yarn lint

# Fix formatting
yarn lint:fix
```

### Testing

```bash
# Test language detector
yarn workspace @metamask/language-detector test

# Test with integration tests
yarn workspace @metamask/language-detector test:integration
```

### Workspace Commands

```bash
# Run command in specific package
yarn workspace @metamask/language-detector <command>

# Run command in all packages
yarn workspaces foreach run <command>
```

## 📚 Configuration Schema

### Repo Config File (`repo-configs/<repo-name>.js`)

```javascript
{
  // Paths to ignore during scan
  pathsIgnored: ['test', 'vendor'],

  // Rule IDs to exclude
  rulesExcluded: ['js/log-injection'],

  // Per-language configuration
  languages_config: [
    {
      language: 'java-kotlin',      // CodeQL language
      ignore: false,                 // Skip this language (optional)
      build_mode: 'manual',          // 'none', 'autobuild', or 'manual'
      build_command: './gradlew build',
      version: '21',                 // Language/runtime version
      distribution: 'temurin'        // Distribution (Java/Node.js)
    }
  ],

  // CodeQL query suites
  queries: [
    { name: 'Base queries', uses: './query-suites/base.qls' }
  ]
}
```

### Supported Languages

**CodeQL:**

- JavaScript/TypeScript → `javascript-typescript`
- Python → `python`
- Java/Kotlin → `java-kotlin`
- Go → `go`
- C/C++ → `cpp`
- C# → `csharp`
- Ruby → `ruby`

**Semgrep:** All languages (language-agnostic pattern matching)

## 🎯 Key Features

### ✅ Automatic Language Detection

- Detects languages via GitHub API
- Maps to appropriate scanners
- Configurable per-repository

### ✅ Optimized Execution

- Parallel scanning per language
- Matrix-based job strategy
- Fail-fast for ignored languages

### ✅ Flexible Configuration

- File-based configs (single source of truth)
- Workflow input overrides
- Per-language build settings

### ✅ Security First

- Minimal token permissions (`contents: read`, `security-events: write`)
- Input validation and sanitization
- See [SECURITY.md](./SECURITY.md) for threat model

## 🔍 Troubleshooting

### Language not detected

- Check GitHub's language detection (repo insights → languages)
- Ensure language is in `LANGUAGE_MAPPING` in `language-detector/src/job-configurator.js`
- Add manual `languages_config` in workflow input

### Build failures

- Verify `build_command` in repo config
- Check if correct `version` and `distribution` are specified
- Review CodeQL build logs in Actions

### Config not loading

- Repo config filename must match repo name: `owner/repo` → `repo.js`
- Ensure config file exports with `export default config`
- Check config-loader logs in workflow output

### Permissions errors

- Add required permissions to calling workflow:
  ```yaml
  permissions:
    actions: read
    contents: read
    security-events: write
  ```

## 📄 License

ISC

## 🤝 Contributing

See [SECURITY.md](./SECURITY.md) for security model and [REVIEW_TRACKING.md](./REVIEW_TRACKING.md) for current development status.

### Package Documentation

- [CodeQL Action README](./packages/codeql-action/README.md)
- [Language Detector README](./packages/language-detector/README.md)
- [Semgrep Action README](./packages/semgrep-action/README.md)
