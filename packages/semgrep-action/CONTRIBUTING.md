# Contributing to Security Code Scanner Semgrep Rules

This guide is intended to help guide you though the process of adding a new Semgrep rule that this action will run.

## Prerequisites

Before contributing, ensure that you have [Semgrep](https://semgrep.dev/) installed. You can find installation instructions [here](https://semgrep.dev/docs/getting-started/quickstart).

## Writing Your Own Rules

When adding a new rule follow these guidelines:

1. **Start with a Template**
   - Use the `rule.template.yml` file located in the root of this repository as a starting point. It includes standard fields and formatting we expect in all rules.
   - To create a new rule, copy the template and place it in the appropriate folder:
     ```bash
     cp rule.template.yml rules/src/ < language > / < your-rule-name > .yml
     ```

2. **Organize Rule Files**
   - Rules should be placed in the `rules/src` directory, organized by language or context. For example:
     ```
     rules/src/js/your-js-rule.yml
     ```
   - The rule name (defined in the `id` field) must match the filename, excluding the `.yml` extension. For example:
     - Rule filename: `your-js-rule.yml`
     - Rule ID: `your-js-rule`

3. **Write and Iterate on the Rule**
   - Use the [Semgrep Playground](https://semgrep.dev/playground/new) to draft and refine your rule. If you've never written a Semgrep rule before, I recommend working through [Semgrep's interactive tutorial](https://semgrep.dev/learn). If you want to jump right in, check out Semgrep's [rule writing docs](https://semgrep.dev/docs/writing-rules/overview).

4. **Add Test Files**
   - Write tests for your rule in the `rules/test` directory, mirroring the structure of `rules/src`. For example:
     ```
     rules/test/js/your-js-rule.js
     ```
   - Test filenames should match the rule ID and filename, but with the correct file extension (e.g., `.js` for JavaScript tests). Example:
     - Rule filename: `your-js-rule.yml`
     - Test file: `your-js-rule.js`.

## Rule Metadata

In order for our rules to be rendered correctly within GitHub we require additional metadata properties. The screenshots below illustrate how these properties are displayed within GitHub's inline rule warnings and on the detailed rule information page.

**Example Rule: hello-world**

```
rules:
  - id: hello-world
    languages:
      - js
    severity: INFO
    metadata:
      tags: [security]
      shortDescription: Hello, World!
      help: "The Security Code Scanner is here to help review your code for vulnerabilities."
      confidence: HIGH
    message: We saw you said hello world and wanted to say hi back!
    pattern: |
      console.log("Hello, World!");
```

**Metadata shown on the code scanning alert details page**
<img width="600" alt="" src="https://github.com/user-attachments/assets/d3b79ddf-ab79-46ef-83d7-035fe41fa2fb" />

**Metadata shown on an inline code scanning alert**
<img width="600" alt="" src="https://github.com/user-attachments/assets/e918311f-94d8-4be0-86d8-cc6c30853740" />

## Writing Tests For Your Rules

Testing is a critical step in ensuring the quality and reliability of your rules. Follow these steps:

1. **Write Thorough Test Cases**
   - Test files can include:
     - **Positive cases**: Examples where the rule should trigger.
     - **Negative cases**: Examples where the rule should not trigger.
   - Refer to the [Semgrep documentation on testing rules](https://semgrep.dev/docs/writing-rules/testing-rules) for more detailed guidance.

2. **Validate Rule Syntax**
   - Use the `bin/validate-rules` script to check for syntax errors:
     ```bash
     ./bin/validate-rules
     ```

3. **Run Tests**
   - Use the `bin/test` script to verify that your rule behaves as expected:
     ```bash
     ./bin/test
     ```

## Testing Rules Against Local Repositories

If you would like to test your rules against a local folder or directory on your machine, you can run the following command to perform a local scan:

```bash
./bin/scan path/to/directory
```

Note that Semgrep will scan _all_ files within the specified directory. In other words, if the directory contains multiple repositories, all of them will be scanned at once.

## Contribution Workflow

1. Create a new branch from the main branch for your changes.
2. Add or update rule files and test cases as outlined above.
3. Run the `bin/validate-rules` and `bin/test` scripts to ensure your changes are valid.
4. Open a pull request with a clear explanation of the rule's purpose.

## Notes

- Always consider the specific needs and contexts of your codebase when writing rules. Rules should help identify issues or enforce patterns relevant to security.
- If you encounter challenges or have questions, please reach out to @witmicko.
