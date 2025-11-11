# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.3]

### Uncategorized

- fix: fix incorect languge slection based on repo config ([#63](https://github.com/MetaMask/action-security-code-scanner/pull/63))

### Fixed

- Fixed Codeql configuration build

## [2.0.1]

### Fixed

- Use secrets for `project-metrics-token` and `slack-webhook` ([#57](https://github.com/MetaMask/action-security-code-scanner/pull/57))
  - These can now be specified as secrets, instead of options under `with`.

## [2.0.0]

### Changed

- Migrated action from its separate repository to the monorepo
- Added multi language support
- Updated CodeQL action to v4

[Unreleased]: https://github.com/MetaMask/action-security-code-scanner/compare/v2.0.3...HEAD
[2.0.3]: https://github.com/MetaMask/action-security-code-scanner/compare/v2.0.1...v2.0.3
[2.0.1]: https://github.com/MetaMask/action-security-code-scanner/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/MetaMask/action-security-code-scanner/releases/tag/v2.0.0
