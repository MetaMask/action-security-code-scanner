#!/usr/bin/env node

/**
 * Validate GitHub Action files across all packages
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

function validateActionFile(packageName, actionFile) {
  const packagePath = join('packages', packageName);
  const actionPath = join(packagePath, actionFile);

  console.log(`\n🔍 Validating: ${packageName}/${actionFile}`);

  try {
    const content = readFileSync(actionPath, 'utf8');
    const action = parse(content);

    // Check required fields
    const requiredFields = ['name', 'description', 'runs'];
    const missingFields = requiredFields.filter((field) => !action[field]);

    if (missingFields.length > 0) {
      console.log(`  ❌ Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }

    console.log(`  ✅ Name: ${action.name}`);
    console.log(`  ✅ Description: ${action.description}`);

    // Check runs configuration
    if (!action.runs.using) {
      console.log(`  ❌ Missing runs.using field`);
      return false;
    }

    console.log(`  ✅ Using: ${action.runs.using}`);

    // Check inputs
    if (action.inputs) {
      const inputCount = Object.keys(action.inputs).length;
      console.log(`  ✅ Inputs: ${inputCount} defined`);

      // Validate each input
      Object.entries(action.inputs).forEach(([name, input]) => {
        if (!input.description) {
          console.log(`  ⚠️  Input '${name}' missing description`);
        }
      });
    } else {
      console.log(`  ℹ️  No inputs defined`);
    }

    // Check outputs
    if (action.outputs) {
      const outputCount = Object.keys(action.outputs).length;
      console.log(`  ✅ Outputs: ${outputCount} defined`);
    }

    return true;
  } catch (error) {
    console.log(`  ❌ Error validating action file: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🚀 Validating GitHub Action files...');

  let allValid = true;

  try {
    const packages = readdirSync('packages');

    packages.forEach((packageName) => {
      const packagePath = join('packages', packageName);

      // Check for action.yml or action.yaml
      let actionFile = null;

      if (existsSync(join(packagePath, 'action.yml'))) {
        actionFile = 'action.yml';
      } else if (existsSync(join(packagePath, 'action.yaml'))) {
        actionFile = 'action.yaml';
      }

      if (actionFile) {
        const isValid = validateActionFile(packageName, actionFile);
        if (!isValid) {
          allValid = false;
        }
      } else {
        console.log(
          `\n⚠️  Package '${packageName}' has no action.yml/action.yaml file`,
        );
      }
    });
  } catch (error) {
    console.error('❌ Error validating actions:', error.message);
    process.exit(1);
  }

  if (allValid) {
    console.log('\n✨ All action files are valid!');
  } else {
    console.log(
      '\n❌ Some action files have issues. Please fix them before proceeding.',
    );
    process.exit(1);
  }
}

main();
