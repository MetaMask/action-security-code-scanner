#!/usr/bin/env node

/**
 * Check packages for common issues
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync, accessSync, constants } from 'fs';
import { join } from 'path';

const packagesDir = 'packages';

function checkPackage(packageName) {
  const packagePath = join(packagesDir, packageName);
  const packageJsonPath = join(packagePath, 'package.json');

  console.log(`\n🔍 Checking package: ${packageName}`);

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    // Check required fields
    const requiredFields = ['name', 'version', 'description', 'author'];
    const missingFields = requiredFields.filter((field) => !packageJson[field]);

    if (missingFields.length > 0) {
      console.log(`  ❌ Missing required fields: ${missingFields.join(', ')}`);
    } else {
      console.log(`  ✅ All required fields present`);
    }

    // Check if package is private
    if (!packageJson.private) {
      console.log(`  ⚠️  Package is not marked as private`);
    } else {
      console.log(`  ✅ Package is correctly marked as private`);
    }

    // Check if action.yml or action.yaml exists
    const actionYml = join(packagePath, 'action.yml');
    const actionYaml = join(packagePath, 'action.yaml');

    let actionFileFound = false;
    let actionFileError = null;

    // Check for action.yml
    try {
      accessSync(actionYml, constants.F_OK);
      readFileSync(actionYml);
      console.log(`  ✅ Has action.yml file`);
      actionFileFound = true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, try action.yaml
        try {
          accessSync(actionYaml, constants.F_OK);
          readFileSync(actionYaml);
          console.log(`  ✅ Has action.yaml file`);
          actionFileFound = true;
        } catch (yamlError) {
          if (yamlError.code === 'ENOENT') {
            console.log(`  ❌ Missing action.yml/action.yaml file`);
          } else {
            console.log(`  ❌ Error reading action.yaml: ${yamlError.message}`);
            actionFileError = yamlError;
          }
        }
      } else {
        console.log(`  ❌ Error reading action.yml: ${error.message}`);
        actionFileError = error;
      }
    }

    // If we found an action file but had read errors, report them
    if (actionFileFound && actionFileError) {
      console.log(
        `  ⚠️  Action file found but has read issues: ${actionFileError.message}`,
      );
    }
  } catch (error) {
    console.log(`  ❌ Error reading package.json: ${error.message}`);
  }
}

function main() {
  console.log('🚀 Checking all packages...');

  try {
    const packages = readdirSync(packagesDir);
    packages.forEach(checkPackage);

    console.log('\n✨ Package check complete!');
  } catch (error) {
    console.error('❌ Error checking packages:', error.message);
    process.exit(1);
  }
}

main();
