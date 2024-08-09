import js from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginTypescript from '@typescript-eslint/eslint-plugin';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginVitest from 'eslint-plugin-vitest';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintConfigLove from 'eslint-config-love';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      import: eslintPluginImport,
      '@typescript-eslint': eslintPluginTypescript,
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      astro: eslintPluginAstro,
      vitest: eslintPluginVitest,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {},
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...eslintConfigLove.rules,
      ...eslintConfigPrettier.rules,
      'no-inner-declarations': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'error',
      'import/order': [
        'error',
        {
          'newlines-between': 'always-and-inside-groups',
          groups: [
            'builtin',
            'type',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
          ],
          pathGroups: [
            {
              patternOptions: { matchBase: true },
              pattern: '*.module.css',
              group: 'internal',
              position: 'before',
            },
          ],
        },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        { allowConstantLoopConditions: true },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],
      '@typescript-eslint/no-floating-promises': [
        'error',
        { ignoreIIFE: true },
      ],
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowNumber: false,
          allowNullableString: true,
          allowNullableBoolean: true,
        },
      ],
    },
  },
  {
    files: ['*.astro'],
    languageOptions: {
      parser: eslintPluginAstro.parsers.astro,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
    },
    rules: {
      'react/jsx-key': 'off',
      'react/jsx-no-undef': 'off',
      'react/no-unknown-property': 'off',
    },
  },
  {
    ignores: ['!src/**/*.astro'],
  },
];
