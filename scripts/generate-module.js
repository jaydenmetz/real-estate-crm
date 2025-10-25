#!/usr/bin/env node

/**
 * Module Generator Script
 *
 * Generates a new feature module from the blueprint template with:
 * - Interactive CLI prompts
 * - Placeholder replacement
 * - File copying and renaming
 * - Automatic routing updates
 * - Barrel exports
 *
 * Usage: npm run generate:module
 */

const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const { execSync } = require('child_process');

// Utility functions for case conversion
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

// Pluralize function (simple implementation)
const pluralize = (word) => {
  const lowerWord = word.toLowerCase();

  // Special cases
  const irregulars = {
    'person': 'people',
    'child': 'children',
    'foot': 'feet',
    'tooth': 'teeth',
    'goose': 'geese',
    'mouse': 'mice'
  };

  if (irregulars[lowerWord]) {
    return irregulars[lowerWord];
  }

  // Words ending in s, x, z, ch, sh
  if (/[sxz]$/.test(lowerWord) || /[cs]h$/.test(lowerWord)) {
    return word + 'es';
  }

  // Words ending in consonant + y
  if (/[^aeiou]y$/.test(lowerWord)) {
    return word.slice(0, -1) + 'ies';
  }

  // Default: add s
  return word + 's';
};

// Replace placeholders in file content
const replacePlaceholders = (content, replacements) => {
  let result = content;

  for (const [placeholder, value] of Object.entries(replacements)) {
    const regex = new RegExp(placeholder, 'g');
    result = result.replace(regex, value);
  }

  return result;
};

// Replace placeholders in filename
const replaceFilenameplaceholders = (filename, replacements) => {
  let result = filename;

  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(placeholder, value);
  }

  return result;
};

// Copy directory recursively with placeholder replacement
const copyWithPlaceholders = async (src, dest, replacements) => {
  const stats = await fs.stat(src);

  if (stats.isDirectory()) {
    // Create directory
    await fs.ensureDir(dest);

    // Read directory contents
    const items = await fs.readdir(src);

    // Process each item
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, replaceFilenameplaceholders(item, replacements));
      await copyWithPlaceholders(srcPath, destPath, replacements);
    }
  } else {
    // Copy file with placeholder replacement
    const content = await fs.readFile(src, 'utf8');
    const replaced = replacePlaceholders(content, replacements);
    await fs.writeFile(dest, replaced, 'utf8');
  }
};

// Update App.jsx to add route
const updateAppRoutes = (moduleName, modulePlural, moduleKebab) => {
  const appPath = path.join(__dirname, '../frontend/src/App.jsx');
  let appContent = fs.readFileSync(appPath, 'utf8');

  // Add import
  const importStatement = `import ${moduleName}Dashboard from './features/${modulePlural}/${moduleName}Dashboard';`;

  if (!appContent.includes(importStatement)) {
    // Find the last import statement
    const lastImportIndex = appContent.lastIndexOf('import ');
    const nextLineIndex = appContent.indexOf('\n', lastImportIndex);
    appContent = appContent.slice(0, nextLineIndex + 1) + importStatement + '\n' + appContent.slice(nextLineIndex + 1);
  }

  // Add route
  const routeStatement = `          <Route path="/${moduleKebab}" element={<${moduleName}Dashboard />} />`;

  if (!appContent.includes(routeStatement)) {
    // Find the Routes section
    const routesIndex = appContent.indexOf('</Routes>');
    appContent = appContent.slice(0, routesIndex) + routeStatement + '\n' + appContent.slice(routesIndex);
  }

  fs.writeFileSync(appPath, appContent, 'utf8');
  console.log(`✅ Updated App.jsx with route for /${moduleKebab}`);
};

// Create barrel exports
const createBarrelExports = async (modulePath, moduleName) => {
  // Main index.js
  const mainIndexContent = `// Auto-generated barrel export for ${moduleName} module
export { default } from './${moduleName}Dashboard';
export * from './hooks/useMODULE_NAMEDashboard'.replace('MODULE_NAME', moduleName);
export * from './services/${toCamelCase(moduleName)}Service';
`;

  await fs.writeFile(
    path.join(modulePath, 'index.js'),
    mainIndexContent,
    'utf8'
  );

  console.log('✅ Created barrel exports');
};

// Main generator function
const generateModule = async () => {
  console.log('\n🚀 Module Generator\n');

  // Prompt for module details
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'moduleName',
      message: 'What is the module name (singular)?',
      validate: (input) => {
        if (!input.trim()) {
          return 'Module name is required';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'modulePlural',
      message: 'What is the plural form?',
      default: (answers) => pluralize(answers.moduleName)
    },
    {
      type: 'input',
      name: 'moduleDescription',
      message: 'Brief description:',
      default: (answers) => `Manage your ${answers.modulePlural.toLowerCase()}`
    },
    {
      type: 'list',
      name: 'moduleIcon',
      message: 'Choose an icon:',
      choices: ['Home', 'Business', 'People', 'Event', 'Assessment', 'Dashboard', 'Settings']
    },
    {
      type: 'list',
      name: 'moduleColor',
      message: 'Choose a color:',
      choices: ['primary', 'secondary', 'success', 'error', 'warning', 'info']
    }
  ]);

  // Generate case variations
  const MODULE_NAME = toPascalCase(answers.moduleName);
  const MODULE_SINGULAR = toCamelCase(answers.moduleName);
  const MODULE_PLURAL = toCamelCase(answers.modulePlural);
  const MODULE_KEBAB = toKebabCase(answers.modulePlural);
  const MODULE_UPPER = toUpperCase(answers.modulePlural);
  const MODULE_TITLE = toTitleCase(answers.modulePlural);

  console.log('\n📋 Generated names:');
  console.log(`   PascalCase: ${MODULE_NAME}`);
  console.log(`   camelCase (singular): ${MODULE_SINGULAR}`);
  console.log(`   camelCase (plural): ${MODULE_PLURAL}`);
  console.log(`   kebab-case: ${MODULE_KEBAB}`);
  console.log(`   UPPER_CASE: ${MODULE_UPPER}`);
  console.log(`   Title Case: ${MODULE_TITLE}\n`);

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Proceed with module generation?',
      default: true
    }
  ]);

  if (!confirm) {
    console.log('❌ Generation cancelled');
    process.exit(0);
  }

  // Define paths
  const blueprintPath = path.join(__dirname, '../frontend/src/features/_blueprint');
  const modulePath = path.join(__dirname, `../frontend/src/features/${MODULE_PLURAL}`);

  // Check if module already exists
  if (await fs.pathExists(modulePath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Module ${MODULE_PLURAL} already exists. Overwrite?`,
        default: false
      }
    ]);

    if (!overwrite) {
      console.log('❌ Generation cancelled');
      process.exit(0);
    }

    await fs.remove(modulePath);
  }

  // Prepare replacements
  const replacements = {
    'MODULE_NAME': MODULE_NAME,
    'MODULE_SINGULAR': MODULE_SINGULAR,
    'MODULE_PLURAL': MODULE_PLURAL,
    'MODULE_KEBAB': MODULE_KEBAB,
    'MODULE_UPPER': MODULE_UPPER,
    'MODULE_TITLE': MODULE_TITLE,
    'MODULE_DESCRIPTION': answers.moduleDescription,
    'MODULE_ICON': answers.moduleIcon,
    'MODULE_COLOR': answers.moduleColor
  };

  console.log('\n📂 Copying files...');

  // Copy blueprint to new module
  await copyWithPlaceholders(blueprintPath, modulePath, replacements);

  console.log('✅ Files copied successfully');

  // Create barrel exports
  await createBarrelExports(modulePath, MODULE_NAME);

  // Update App.jsx routes
  updateAppRoutes(MODULE_NAME, MODULE_PLURAL, MODULE_KEBAB);

  console.log('\n✨ Module generated successfully!\n');
  console.log('📍 Location:', modulePath);
  console.log('🌐 Route:', `/${MODULE_KEBAB}`);
  console.log('\n📝 Next steps:');
  console.log(`   1. Review generated files in frontend/src/features/${MODULE_PLURAL}/`);
  console.log(`   2. Update service fields in services/${MODULE_SINGULAR}Service.js`);
  console.log(`   3. Customize component templates as needed`);
  console.log(`   4. Create backend API endpoints at /v1/${MODULE_PLURAL}`);
  console.log(`   5. Test at https://crm.jaydenmetz.com/${MODULE_KEBAB}\n`);

  // Ask if user wants to open in editor
  const { openEditor } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'openEditor',
      message: 'Open module in VS Code?',
      default: false
    }
  ]);

  if (openEditor) {
    try {
      execSync(`code ${modulePath}`, { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Could not open VS Code. Open manually:', modulePath);
    }
  }
};

// Run generator
generateModule().catch(error => {
  console.error('❌ Error generating module:', error);
  process.exit(1);
});
