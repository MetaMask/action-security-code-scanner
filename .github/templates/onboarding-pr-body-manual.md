## Required Action

Prior to merging this pull request, please ensure the following has been completed:
- [ ] The lines specifying `branches` correctly specifies this repository's default branch (usually `main` or `master`).
- [ ] Any paths you would like to ignore have been added to the `paths-ignored` configuration option (see [setup](https://github.com/MetaMask/action-security-code-scanner/blob/main/README.md#setup))
- [ ] Language configuration has been reviewed - ignore falsely detected languages or add build commands for Java/Kotlin if needed (see Configuration section below)
- [ ] Any existing CodeQL configuration has been disabled.

## What is the Security Code Scanner?

This pull request enables the [MetaMask Security Code Scanner](https://github.com/MetaMask/action-security-code-scanner) GitHub Action. This action runs on each pull request, and will flag potential vulnerabilities as a review comment. It will also scan this repository's default branch, and log any findings in this repository's [Code Scanning Alerts Tab]({{SECURITY_SCANNING_URL}}).

<img width="500" alt="Screenshot 2024-02-12 at 9 19 05 PM" src="https://github.com/user-attachments/assets/41c87b70-79b7-44dd-a444-791b142fbbe1">

The action itself runs various static analysis engines behind the scenes. Currently, it is only running GitHub's CodeQL engine. For this reason, we recommend disabling any existing CodeQL configuration your repository may have.

## How do I interact with the tool?

Every finding raised by the Security Code Scanner will present context behind the potential vulnerability identified, and allow the developer to fix, or dismiss it.

The finding will automatically be dismissed by pushing a commit that fixes the identified issue, or by manually dismissing the alert using the button in GitHub's UI. If dismissing an alert manually, please add any additional context surrounding the reason for dismissal, as this informs our decision to disable, or improve any poor performing rules.

<img width="983" alt="Screenshot 2024-02-12 at 8 41 46 PM" src="https://github.com/user-attachments/assets/114219d5-4b4c-4d9d-8bfe-f4666012b73e">

## Configuration

### Language Configuration

The scanner auto-detects languages in your repository. If you need to customize language-specific settings, you can modify the `languages-config` section in the workflow file.

**Common use cases:**

1. **Ignore falsely detected languages:**
   ```yaml
   languages-config: |
     [
       {
         "language": "ruby",
         "ignore": true
       }
     ]
   ```

2. **Configure Java/Kotlin builds:**
   ```yaml
   languages-config: |
     [
       {
         "language": "java-kotlin",
         "build_mode": "manual",
         "build_command": "./gradlew build",
         "version": "21",
         "distribution": "temurin"
       }
     ]
   ```

**Supported languages:** `javascript-typescript`, `python`, `java-kotlin`, `go`, `cpp`, `csharp`, `ruby`

**Build modes:** `none`, `autobuild`, `manual`

### Additional Configuration

For more configuration options, please review the tool's [README](https://github.com/MetaMask/action-security-code-scanner/blob/main/README.md).

Optional secrets that can be configured:
- `SECURITY_SCAN_METRICS_TOKEN` - for metrics collection
- `APPSEC_BOT_SLACK_WEBHOOK` - for Slack notifications

For any additional questions, please reach out to `@app-sec` in Slack.
