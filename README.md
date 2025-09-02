# `MetaMask/action-security-code-scanner`

## Overview

The Security Code Scanner GitHub Action is designed to enhance the security of your repositories by
performing thorough code scans. Currently, it utilizes the Appsec CodeQL scanner,
but the scope is planned to expand to include other security actions,
providing a more comprehensive security analysis.

## Inputs

- **`repo`**: (Required) The name of the repository you want to scan.
- **`slack_webhook`**: (false) Slack URL to report on scan failures.
- **`project_metrics_token`**: (optional) Token belonging to a mixpanel project that is used to track build passes & failures.
- **`paths_ignored`**: (optional) Code paths which are to be ignored. Each should be listed on a new line.
- **`rules_excluded`**: (optional) Code scanning rules to exclude. Each should be listed on a new line.

## Setup

To use the Security Code Scanner, create a `security-code-scanner.yml` file in your repository's `.github/workflows/` folder:

```yaml
name: 'MetaMask Security Code Scanner'

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

## Secrets

Repositories in the MetaMask GitHub organization will pass the following secrets to the scanner to assist with logging and monitoring. However, these values can be replaced if used in other contexts.

- SECURITY_SCAN_METRICS_TOKEN
- APPSEC_BOT_SLACK_WEBHOOK

## Features

- **CodeQL Analysis**: Leverages [MetaMask/Appsec-CodeQL](https://github.com/MetaMask/codeql-action), a wrapper around GitHub's [CodeQL engine](https://codeql.github.com/), to identify vulnerabilities in the codebase.

## Disclaimer

This action is developed for the MetaMask engineering team, and may require additional configuration if used in other organizations.
