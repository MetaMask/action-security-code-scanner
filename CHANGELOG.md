# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Updated language detector to add Github Actions support by default

## [2.0.1]

### Fixed

- Use secrets for `project-metrics-token` and `slack-webhook` ([#57](https://github.com/MetaMask/action-security-code-scanner/pull/57))
  - These can now be specified as secrets, instead of options under `with`.

## [2.0.0]

### Added

- Added multi language support

### Changed

- Consolidated all actions under one repository

## [1.1.0]

### Changed

- Make slack_webhook an optional input ([#34](https://github.com/MetaMask/action-security-code-scanner/pull/34))

## [1.0.0]

### Added

- Initial release of this action ([#29](https://github.com/MetaMask/action-security-code-scanner/pull/29))

[Unreleased]: https://github.com/metamask/action-security-code-scanner/compare/v2.0.1...HEAD
[2.0.1]: https://github.com/metamask/action-security-code-scanner/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/metamask/action-security-code-scanner/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/metamask/action-security-code-scanner/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/metamask/action-security-code-scanner/releases/tag/v1.0.0
