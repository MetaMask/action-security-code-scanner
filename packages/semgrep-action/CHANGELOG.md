# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.0]

### Changed

- Update CodeQL action version in Semgrep workflow for consistency
- Update actions/checkout to latest commit for consistency across workflows
- Update GitHub Actions to use latest versions of dependencies

## [2.0.6]

### Changed

- fix(semgrep): prevent shell injection by using environment variable for paths_ignored

## [2.0.5]

### Added

- feat: add rule to catch npx usage in JS/TS/YAML

### Fixed

- refactor: simplify Semgrep action by removing unnecessary file copy step
- fix: update .semgrepignore to include .security-scanner directory

## [2.0.2]

## [2.0.1]

### Fixed

- Use secrets for `project-metrics-token` and `slack-webhook` ([#57](https://github.com/MetaMask/action-security-code-scanner/pull/57))
  - These can now be specified as secrets, instead of options under `with`.

## [2.0.0]

### Changed

- Migrated action from its separate repository to the monorepo

[Unreleased]: https://github.com/MetaMask/action-security-code-scanner/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/MetaMask/action-security-code-scanner/compare/v2.0.6...v2.1.0
[2.0.6]: https://github.com/MetaMask/action-security-code-scanner/compare/v2.0.5...v2.0.6
[2.0.5]: https://github.com/MetaMask/action-security-code-scanner/compare/v2.0.2...v2.0.5
[2.0.2]: https://github.com/MetaMask/action-security-code-scanner/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/MetaMask/action-security-code-scanner/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/MetaMask/action-security-code-scanner/releases/tag/v2.0.0
