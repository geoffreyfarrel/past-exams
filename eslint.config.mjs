import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // 1. Global Ignores
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '**/node_modules',
    '**/dist',
    'next.config.ts',
    '**/scripts/seed.mjs',
    '**/app/layout.tsx',
  ]),

  // 2. Core Formatting & Rules
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // --- Formatting (Prettier) ---
      'prettier/prettier': 'error',

      // --- Import Sorting ---
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // --- Strictness Rules from previous config ---
      '@typescript-eslint/explicit-function-return-type': 'error',
      'no-console': 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: 'break' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // 3. Disable conflicting rules
  {
    name: 'prettier-off',
    rules: eslintConfigPrettier.rules,
  },
]);

export default eslintConfig;
