# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add `.github/` as a workspace package for workflow versioning

### Changed

- Use token exchange for release publishing instead of `GITHUB_TOKEN`
- Grant `workflows: write` permission in onboarding workflow

### Fixed

- Fix Slack webhook configuration to use `webhook-type` input instead of deprecated `SLACK_WEBHOOK_TYPE` env var
- Add `actions: read` permission to zizmor job to fix "resource not accessible by integration" errors in private repositories

## [2.1.0]

### Added

- Add zizmor static analysis of GitHub Actions workflows

### Fixed

- Addressed zizmor findings
