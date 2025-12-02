# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Updated language detector to remove Javascript as fallback default language

## [2.0.3]

### Added

- Enable Swift support ([#62](https://github.com/MetaMask/action-security-code-scanner/pull/62))

## [2.0.2]

### Uncategorized

- Update language detector and job configurator to add Github Actions support by default ([#60](https://github.com/MetaMask/action-security-code-scanner/pull/60))

### Changed

- Updated job configurator to add Github Actions support by default

## [2.0.1]

### Fixed

- Use secrets for `project-metrics-token` and `slack-webhook` ([#57](https://github.com/MetaMask/action-security-code-scanner/pull/57))
  - These can now be specified as secrets, instead of options under `with`.

## [2.0.0]

### Added

- Added support for autodetecting languages using Github API

[Unreleased]: https://github.com/MetaMask/action-security-code-scanner/compare/v2.0.3...HEAD
[2.0.3]: https://github.com/MetaMask/action-security-code-scanner/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/MetaMask/action-security-code-scanner/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/MetaMask/action-security-code-scanner/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/MetaMask/action-security-code-scanner/releases/tag/v2.0.0
