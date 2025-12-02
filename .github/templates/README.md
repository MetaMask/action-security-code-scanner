# PR Body Templates

This directory contains templates for onboarding PRs that add the Security Code Scanner to repositories.

## Templates

### `onboarding-pr-body-manual.md`
**Use for:** Manual PRs created by the security team

- More detailed with full language configuration examples
- Includes code snippets for common scenarios
- Comprehensive documentation
- No auto-merge disclaimer

### `onboarding-pr-body-automated.md`
**Use for:** Automated PRs created by workflows

- Shorter, more concise
- Includes auto-merge warning at the top
- Links to README for detailed configuration
- Used by `.github/workflows/onboard-new-repo.yml`

## Variables

Both templates support variable substitution:

- `{{SECURITY_SCANNING_URL}}` - Repository-specific code scanning alerts URL

## Usage

**Manual PRs:**
```bash
# Copy and paste from onboarding-pr-body-manual.md
# Replace {{SECURITY_SCANNING_URL}} with actual URL
```

**Automated workflow:**
The workflow automatically reads `onboarding-pr-body-automated.md` and substitutes variables.
