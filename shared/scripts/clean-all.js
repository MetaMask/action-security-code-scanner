#!/usr/bin/env node

/**
 * Clean build artifacts and temporary files across all packages.
 *
 * Security note: artifact and package paths are handled with Node's fs APIs
 * only. We intentionally avoid spawning a shell (no shell-based recursive
 * delete) so that a directory or pattern name containing shell metacharacters
 * can never be interpreted by a shell, and so the script runs cross-platform.
 */

import { readdirSync, rmSync, existsSync } from 'fs';
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

/**
 * Minimal, dependency-free matcher for simple glob patterns of the form
 * `*.ext`. Kept local so no shell is spawned and path components stay within
 * the target directory.
 */
function globMatch(name, pattern) {
  const star = pattern.indexOf('*');
  if (star === -1) {
    return name === pattern;
  }
  const before = pattern.slice(0, star);
  const after = pattern.slice(star + 1);
  return name.startsWith(before) && name.endsWith(after);
}

function cleanDirectory(dirPath, patterns) {
  console.log(`🧹 Cleaning: ${dirPath}`);

  patterns.forEach((pattern) => {
    const fullPath = join(dirPath, pattern);

    if (pattern.includes('*')) {
      // Expand the glob in-process (e.g. '*.log') instead of handing the path
      // to a shell. This removes shell-interpolation risk entirely.
      try {
        const entries = existsSync(dirPath)
          ? readdirSync(dirPath, { withFileTypes: true })
          : [];
        for (const entry of entries) {
          if (globMatch(entry.name, pattern)) {
            rmSync(join(dirPath, entry.name), {
              recursive: entry.isDirectory(),
              force: true,
            });
            console.log(`  ✅ Removed: ${pattern}`);
          }
        }
      } catch {
        // Ignore directories that cannot be read or have no matches
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

  // Clean workspace packages
  const workspacePaths = [
    '.github',
    // List packages without spawning a shell (cross-platform, no injection).
    ...readdirSync('packages', { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join('packages', entry.name)),
  ];

  try {
    workspacePaths.forEach((packagePath) => {
      cleanDirectory(packagePath, artifactPaths);
    });
  } catch (error) {
    console.error('❌ Error cleaning packages:', error.message);
  }

  console.log('\n✨ Clean complete!');
}

main();