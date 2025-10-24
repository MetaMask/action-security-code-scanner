#!/usr/bin/env node

/**
 * Clean build artifacts and temporary files across all packages
 */

import { execSync } from 'child_process';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';

const artifactPaths = [
  'node_modules',
  'dist',
  'build',
  'lib',
  '.nyc_output',
  'coverage',
  '*.log',
  '*.sarif',
];

function cleanDirectory(dirPath, patterns) {
  console.log(`🧹 Cleaning: ${dirPath}`);

  patterns.forEach((pattern) => {
    const fullPath = join(dirPath, pattern);

    if (pattern.includes('*')) {
      // Handle glob patterns
      try {
        execSync(`rm -rf ${fullPath}`, { cwd: process.cwd(), stdio: 'pipe' });
      } catch {
        // Ignore errors for glob patterns that don't match
      }
    } else {
      // Handle exact paths
      if (existsSync(fullPath)) {
        try {
          rmSync(fullPath, { recursive: true, force: true });
          console.log(`  ✅ Removed: ${pattern}`);
        } catch (error) {
          console.log(`  ❌ Failed to remove ${pattern}: ${error.message}`);
        }
      }
    }
  });
}

function main() {
  console.log('🚀 Cleaning build artifacts across all packages...');

  // Clean root directory
  cleanDirectory('.', artifactPaths);

  // Clean packages
  try {
    execSync('ls packages/', { stdio: 'pipe' })
      .toString()
      .trim()
      .split('\n')
      .forEach((packageName) => {
        const packagePath = join('packages', packageName);
        cleanDirectory(packagePath, artifactPaths);
      });
  } catch (error) {
    console.error('❌ Error cleaning packages:', error.message);
  }

  console.log('\n✨ Clean complete!');
}

main();
