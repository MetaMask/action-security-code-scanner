# `MetaMask/action-security-code-scanner`

## Overview

The Security Code Scanner GitHub Action is designed to enhance the security of your repositories by
performing thorough code scans. Currently, it utilizes the Appsec CodeQL scanner,
but the scope is planned to expand to include other security actions,
providing a more comprehensive security analysis.

## Inputs

- **`repo`**: (Required) The name of the repository you want to scan.
- **`slack_webhook`**: (Optional) Slack webhook URL for notifications. Typically set to `${{ secrets.APPSEC_BOT_SLACK_WEBHOOK }}`.
- **`language`**: (Optional) Language to scan. Supported languages include `javascript-typescript`, `typescript`, `go`, and `java-kotlin`. Used for both single-language repos requiring specific language configuration and multi-language matrix scanning.
- **`build_mode`**: (Optional) Build mode for the language. Set to `manual` for compiled languages like `java-kotlin` that require explicit build commands before analysis.
- **`build_command`**: (Optional) Build command for the language. Required when `build_mode` is `manual`. For Java projects, typically `./gradlew build` or similar Gradle/Maven commands.
- **`project_metrics_token`**: (Optional) Token belonging to a mixpanel project that is used to track build passes & failures.
- **`paths_ignored`**: (Optional) Code paths which are to be ignored. Each should be listed on a new line.
- **`rules_excluded`**: (Optional) Code scanning rules to exclude. Each should be listed on a new line.

## Usage Examples

### Basic Single Language Scan

For a standard single-language repository, create a `security-code-scanner.yml` file in your repository's `.github/workflows/` folder:

```yaml
name: MetaMask Security Code Scanner

on:
  push:
    branches:
      - main
  pull_request:
  workflow_dispatch:

jobs:
  run-security-scan:
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    steps:
      - name: MetaMask Security Code Scanner
        uses: MetaMask/action-security-code-scanner@v1
        with:
          repo: ${{ github.repository }}
          paths_ignored: |
            .storybook/
            '**/__snapshots__/'
            '**/*.snap'
            '**/*.stories.js'
            '**/*.stories.tsx'
            '**/*.test.browser.ts*'
            '**/*.test.js*'
            '**/*.test.ts*'
            '**/fixtures/'
            '**/jest.config.js'
            '**/jest.environment.js'
            '**/mocks/'
            '**/test*/'
            docs/
            e2e/
            merged-packages/
            node_modules
            storybook/
            test*/
          rules_excluded: |
            rule1
          project_metrics_token: ${{ secrets.SECURITY_SCAN_METRICS_TOKEN }}
          slack_webhook: ${{ secrets.APPSEC_BOT_SLACK_WEBHOOK }}
```

### Multi-Language Matrix Scan

For repositories with multiple languages, use a matrix strategy:

```yaml
name: Matrix Security Code Scanner

on:
  push:
    branches:
      - main
  pull_request: null
  workflow_dispatch:

jobs:
  security-scan:
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    strategy:
      fail-fast: false
      matrix:
        include:
          - language: javascript-typescript
          - language: typescript
          - language: go
          - language: java-kotlin
            build-mode: manual
            build-command: "./gradlew :coordinator:app:build"

    name: Security Code Scan (${{ matrix.language }})
    steps:
      - name: Security Code Scanner - ${{ matrix.language }}
        uses: MetaMask/action-security-code-scanner@mo-multilang-support
        with:
          repo: ${{ github.repository }}
          language: ${{ matrix.language }}
          build_mode: ${{ matrix.build-mode }}
          build_command: ${{ matrix.build-command }}
          paths_ignored: |
            .storybook/
            '**/__snapshots__/'
            '**/*.snap'
            '**/*.stories.js'
            '**/*.stories.tsx'
            '**/*.test.browser.ts*'
            '**/*.test.js*'
            '**/*.test.ts*'
            '**/fixtures/'
            '**/jest.config.js'
            '**/jest.environment.js'
            '**/mocks/'
            '**/test*/'
            docs/
            e2e/
            merged-packages/
            node_modules
            storybook/
            test*/
          project_metrics_token: ${{ secrets.SECURITY_SCAN_METRICS_TOKEN }}
          slack_webhook: ${{ secrets.APPSEC_BOT_SLACK_WEBHOOK }}
```

## Secrets

Repositories in the MetaMask GitHub organization will pass the following secrets to the scanner to assist with logging and monitoring. However, these values can be replaced if used in other contexts.

- SECURITY_SCAN_METRICS_TOKEN
- APPSEC_BOT_SLACK_WEBHOOK

## Features

- **Multi-Language Support**: Supports scanning JavaScript/TypeScript, Go, Java/Kotlin, and other languages with customizable build configurations.
- **CodeQL Analysis**: Leverages [MetaMask/Appsec-CodeQL](https://github.com/MetaMask/codeql-action), a wrapper around GitHub's [CodeQL engine](https://codeql.github.com/), to identify vulnerabilities in the codebase.
- **Matrix Scanning**: Allows scanning multiple languages in parallel using GitHub Actions matrix strategy.
- **Flexible Build Configuration**: Supports automatic and manual build modes with custom build commands.

## Disclaimer

This action is developed for the MetaMask engineering team, and may require additional configuration if used in other organizations.
