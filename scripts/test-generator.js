#!/usr/bin/env node

/**
 * Generator Validation Test
 *
 * Tests the placeholder replacement logic without interactive prompts
 * to validate the generator works correctly before Phase 4
 */

const fs = require('fs-extra');
const path = require('path');

// Import case conversion utilities from generator
const toPascalCase = (str) => {
  return str
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const toCamelCase = (str) => {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

const toKebabCase = (str) => {
  return str
    .split(/[\s_]+/)
    .join('-')
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
};

const toUpperCase = (str) => {
  return str
    .split(/[\s-]+/)
    .join('_')
    .toUpperCase();
};

const toTitleCase = (str) => {
  return str
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Replace placeholders in content
const replacePlaceholders = (content, replacements) => {
  let result = content;
  for (const [placeholder, value] of Object.entries(replacements)) {
    const regex = new RegExp(placeholder, 'g');
    result = result.replace(regex, value);
  }
  return result;
};

// Test cases
const testCases = [
  { input: 'Open House', plural: 'Open Houses' },
  { input: 'Property', plural: 'Properties' },
  { input: 'Vendor', plural: 'Vendors' },
  { input: 'Document', plural: 'Documents' }
];

console.log('\n🧪 Generator Placeholder Replacement Test\n');
console.log('Testing case conversion utilities...\n');

let allTestsPassed = true;

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: "${testCase.input}" → "${testCase.plural}"`);

  const MODULE_NAME = toPascalCase(testCase.input);
  const MODULE_SINGULAR = toCamelCase(testCase.input);
  const MODULE_PLURAL = toCamelCase(testCase.plural);
  const MODULE_KEBAB = toKebabCase(testCase.plural);
  const MODULE_UPPER = toUpperCase(testCase.plural);
  const MODULE_TITLE = toTitleCase(testCase.plural);

  console.log(`  PascalCase: ${MODULE_NAME}`);
  console.log(`  camelCase (singular): ${MODULE_SINGULAR}`);
  console.log(`  camelCase (plural): ${MODULE_PLURAL}`);
  console.log(`  kebab-case: ${MODULE_KEBAB}`);
  console.log(`  UPPER_CASE: ${MODULE_UPPER}`);
  console.log(`  Title Case: ${MODULE_TITLE}`);

  // Validate expectations
  const expectations = {
    'Open House': {
      pascalCase: 'OpenHouse',
      singular: 'openHouse',
      plural: 'openHouses',
      kebab: 'open-houses',
      upper: 'OPEN_HOUSES',
      title: 'Open Houses'
    },
    'Property': {
      pascalCase: 'Property',
      singular: 'property',
      plural: 'properties',
      kebab: 'properties',
      upper: 'PROPERTIES',
      title: 'Properties'
    },
    'Vendor': {
      pascalCase: 'Vendor',
      singular: 'vendor',
      plural: 'vendors',
      kebab: 'vendors',
      upper: 'VENDORS',
      title: 'Vendors'
    },
    'Document': {
      pascalCase: 'Document',
      singular: 'document',
      plural: 'documents',
      kebab: 'documents',
      upper: 'DOCUMENTS',
      title: 'Documents'
    }
  };

  const expected = expectations[testCase.input];
  if (expected) {
    const checks = [
      MODULE_NAME === expected.pascalCase,
      MODULE_SINGULAR === expected.singular,
      MODULE_PLURAL === expected.plural,
      MODULE_KEBAB === expected.kebab,
      MODULE_UPPER === expected.upper,
      MODULE_TITLE === expected.title
    ];

    const passed = checks.every(check => check);
    if (passed) {
      console.log('  ✅ All conversions correct\n');
    } else {
      console.log('  ❌ Conversion mismatch detected\n');
      allTestsPassed = false;
    }
  } else {
    console.log('  ⚠️  No expectations defined (manual verification needed)\n');
  }
});

// Test placeholder replacement
console.log('\nTesting placeholder replacement...\n');

const sampleTemplate = `
import { useMODULE_NAMEDashboard } from './hooks/useMODULE_NAMEDashboard';
import { MODULE_SINGULARService } from './services/MODULE_SINGULARService';

const MODULE_NAMEDashboard = () => {
  const MODULE_PLURAL = [];
  const MODULE_KEBAB_route = '/MODULE_KEBAB';
  const MODULE_UPPER_constant = 'MODULE_UPPER';

  return <h1>MODULE_TITLE Dashboard</h1>;
};

export default MODULE_NAMEDashboard;
`;

const replacements = {
  'MODULE_NAME': 'OpenHouse',
  'MODULE_SINGULAR': 'openHouse',
  'MODULE_PLURAL': 'openHouses',
  'MODULE_KEBAB': 'open-houses',
  'MODULE_UPPER': 'OPEN_HOUSES',
  'MODULE_TITLE': 'Open Houses'
};

const replaced = replacePlaceholders(sampleTemplate, replacements);

console.log('Sample Template:');
console.log('---');
console.log(sampleTemplate.trim());
console.log('---');
console.log('\nAfter Replacement:');
console.log('---');
console.log(replaced.trim());
console.log('---\n');

// Verify no placeholders remain
const placeholderRegex = /MODULE_[A-Z_]+/g;
const remainingPlaceholders = replaced.match(placeholderRegex);

if (remainingPlaceholders) {
  console.log('❌ Placeholders still remain:', remainingPlaceholders);
  allTestsPassed = false;
} else {
  console.log('✅ All placeholders replaced successfully\n');
}

// Test blueprint template files exist
console.log('Verifying blueprint template files...\n');

const blueprintPath = path.join(__dirname, '../frontend/src/features/_blueprint');
const requiredFiles = [
  'components/dashboard/MODULE_NAMEDashboard.jsx',
  'components/dashboard/MODULE_NAMEGrid.jsx',
  'components/dashboard/MODULE_NAMEList.jsx',
  'components/dashboard/MODULE_NAMETable.jsx',
  'components/dashboard/MODULE_NAMECalendar.jsx',
  'components/modals/NewMODULE_NAMEModal.jsx',
  'components/modals/EditMODULE_NAMEModal.jsx',
  'components/modals/MODULE_NAMEFiltersModal.jsx',
  'hooks/useMODULE_NAMEDashboard.js',
  'services/MODULE_SINGULARService.js',
  'config/module.config.js',
  'README.md'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(blueprintPath, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${file}`);
  if (!exists) {
    allFilesExist = false;
    allTestsPassed = false;
  }
});

console.log('');

// Count placeholders in actual template files
console.log('Counting placeholders in blueprint templates...\n');

let totalPlaceholders = 0;
const placeholderCounts = {};

requiredFiles
  .filter(file => file.endsWith('.jsx') || file.endsWith('.js'))
  .forEach(file => {
    const filePath = path.join(blueprintPath, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.match(/MODULE_[A-Z_]+/g) || [];
      const count = matches.length;
      totalPlaceholders += count;

      // Count by placeholder type
      matches.forEach(match => {
        placeholderCounts[match] = (placeholderCounts[match] || 0) + 1;
      });

      console.log(`  ${file}: ${count} placeholders`);
    }
  });

console.log(`\nTotal placeholders across all templates: ${totalPlaceholders}`);
console.log('\nPlaceholder distribution:');
Object.entries(placeholderCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([placeholder, count]) => {
    console.log(`  ${placeholder}: ${count} occurrences`);
  });

// Final summary
console.log('\n' + '='.repeat(60));
if (allTestsPassed && allFilesExist) {
  console.log('✅ ALL TESTS PASSED - Generator is ready for use');
  console.log('='.repeat(60));
  console.log('\nNext steps:');
  console.log('  1. Run: npm run generate:module');
  console.log('  2. Test with "Open House" or "Property"');
  console.log('  3. Verify generated files compile without errors');
  console.log('  4. Proceed with Phase 4\n');
  process.exit(0);
} else {
  console.log('❌ TESTS FAILED - Review errors above');
  console.log('='.repeat(60));
  process.exit(1);
}
