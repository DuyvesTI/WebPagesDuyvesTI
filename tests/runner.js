/**
 * tests/runner.js
 * Master E2E Test Runner for DuyvesTI Platform Relaunch.
 * Executable via Node.js v24: NO_PROXY=localhost,127.0.0.1 node tests/runner.js
 */

const path = require('node:path');
const fs = require('node:fs');
const { run } = require('node:test');
const { spec } = require('node:test/reporters');

// Enforce proxy bypass for local test execution
process.env.NO_PROXY = 'localhost,127.0.0.1';

const SUITES = {
  tier1: {
    name: 'Tier 1: Feature Coverage (F01 - F24)',
    path: path.resolve(__dirname, 'e2e/tier1_feature_coverage.test.js'),
    minTests: 120
  },
  tier2: {
    name: 'Tier 2: Boundary & Corner Cases (F01 - F24)',
    path: path.resolve(__dirname, 'e2e/tier2_boundary_corner.test.js'),
    minTests: 120
  },
  tier3: {
    name: 'Tier 3: Cross-Feature Interactions',
    path: path.resolve(__dirname, 'e2e/tier3_cross_feature.test.js'),
    minTests: 24
  },
  tier4: {
    name: 'Tier 4: Real-World Business Scenarios',
    path: path.resolve(__dirname, 'e2e/tier4_real_world.test.js'),
    minTests: 12
  }
};

function parseArgs() {
  const args = process.argv.slice(2);
  let selectedTier = 'all';
  let verbose = false;

  for (const arg of args) {
    if (arg.startsWith('--tier=')) {
      selectedTier = arg.split('=')[1].toLowerCase();
    } else if (arg === '-v' || arg === '--verbose') {
      verbose = true;
    }
  }

  return { selectedTier, verbose };
}

async function main() {
  const { selectedTier } = parseArgs();

  console.log('='.repeat(72));
  console.log('  DuyvesTI E2E Test Suite Runner — Node.js v24 Native Engine');
  console.log('='.repeat(72));
  console.log(`Target: ${selectedTier.toUpperCase()}`);
  console.log(`Node:   ${process.version} (${process.execPath})`);
  console.log(`Time:   ${new Date().toISOString()}`);
  console.log('-'.repeat(72));

  let filesToRun = [];

  if (selectedTier === '1' || selectedTier === 'tier1') {
    filesToRun = [SUITES.tier1.path];
  } else if (selectedTier === '2' || selectedTier === 'tier2') {
    filesToRun = [SUITES.tier2.path];
  } else if (selectedTier === '3' || selectedTier === 'tier3') {
    filesToRun = [SUITES.tier3.path];
  } else if (selectedTier === '4' || selectedTier === 'tier4') {
    filesToRun = [SUITES.tier4.path];
  } else {
    // Run all
    filesToRun = [
      SUITES.tier1.path,
      SUITES.tier2.path,
      SUITES.tier3.path,
      SUITES.tier4.path
    ];
  }

  // Verify all target test files exist
  for (const file of filesToRun) {
    if (!fs.existsSync(file)) {
      console.error(`ERROR: Test file does not exist: ${file}`);
      process.exit(1);
    }
  }

  console.log(`Executing ${filesToRun.length} test suite(s)...`);
  console.log('');

  const testStream = run({
    files: filesToRun,
    concurrency: 1
  });

  testStream.compose(new spec()).pipe(process.stdout);

  let finalCounts = null;

  testStream.on('test:summary', (summary) => {
    finalCounts = summary.counts;
  });

  await new Promise((resolve) => {
    testStream.on('end', resolve);
  });

  console.log('');
  console.log('='.repeat(72));
  console.log('  E2E Test Execution Summary');
  console.log('='.repeat(72));
  if (finalCounts) {
    console.log(`  Total Tests: ${finalCounts.tests}`);
    console.log(`  Passed:      ${finalCounts.passed} \x1b[32m✔\x1b[0m`);
    console.log(`  Failed:      ${finalCounts.failed} ${finalCounts.failed > 0 ? '\x1b[31m✖\x1b[0m' : ''}`);
    console.log(`  Skipped:     ${finalCounts.skipped}`);
    console.log(`  Suites:      ${filesToRun.length}`);
  }
  console.log('='.repeat(72));

  if (finalCounts && finalCounts.failed > 0) {
    console.error(`\x1b[31mE2E Test Suite Run FAILED with ${finalCounts.failed} failure(s).\x1b[0m`);
    process.exit(1);
  } else {
    console.log('\x1b[32mAll E2E Test Suites PASSED successfully!\x1b[0m');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal test runner error:', err);
    process.exit(1);
  });
}

module.exports = {
  SUITES,
  main
};
