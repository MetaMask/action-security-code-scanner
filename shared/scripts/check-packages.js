#!/usr/bin/env node

/**
 * Check packages for common issues
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync } from 'fs';
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

    try {
      readFileSync(actionYml);
      console.log(`  ✅ Has action.yml file`);
    } catch {
      try {
        readFileSync(actionYaml);
        console.log(`  ✅ Has action.yaml file`);
      } catch {
        console.log(`  ❌ Missing action.yml/action.yaml file`);
      }
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
