const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  // Base configuration for all files
  {
    ignores: ['.eslintrc.js', 'node_modules/**', '.build/**'],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    }
  },
  
  // TypeScript files configuration
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: '.',
        sourceType: 'module',
        ecmaVersion: 2020,
      },
      globals: {
        node: true,
        jest: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'import': importPlugin,
      'prettier': prettierPlugin,
    },
    rules: {
      // Basic ESLint rules
      'no-console': 'warn',
      'no-unused-vars': 'off', // Handled by TypeScript
      
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      
      // Prettier rules
      'prettier/prettier': [
        'error',
        {},
        {
          'usePrettierrc': true,
        }
      ]
    },
  },
]; 