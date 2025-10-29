# Security Code Scanner - Semgrep Action

This repository is home to the GitHub action workflow that will run perform a semgrep scan on a checked out repository. After the scan is complete, the results will be uploaded to GitHub's Code Scanning API.

## Usage

```
- name: Semgrep Scan
    uses: metamask/security-codescanner-monorepo/packages/semgrep-action@main
    with:
        # optional string parameter
        paths_ignored: ...
```

For information on how to contribute rules to this repository, please see the CONTRIBUTING.md file in this package.
