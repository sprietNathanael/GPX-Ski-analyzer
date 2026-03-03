import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import tssUnusedClasses from 'eslint-plugin-tss-unused-classes';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default defineConfig([
	globalIgnores(['**/node_modules/', '.vscode/*']),
	{
		extends: compat.extends(
			'eslint:recommended',
			'plugin:react/recommended',
			'plugin:@typescript-eslint/recommended'
		),

		plugins: {
			react,
			'@typescript-eslint': typescriptEslint,
			'tss-unused-classes': tssUnusedClasses,
		},

		languageOptions: {
			globals: {
				...globals.browser,
			},

			parser: tsParser,
			ecmaVersion: 12,
			sourceType: 'module',

			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},

		settings: {
			react: {
				version: 'detect',
			},
		},

		rules: {
			'max-len': [
				1,
				1200,
				2,
				{
					ignoreComments: true,
					code: 1200,
				},
			],

			'no-console': [1],
			complexity: [1, 60],
			'no-unused-vars': [0],
			'no-useless-escape': [0],
			'react/no-unescaped-entities': [1],
			'react/display-name': 0,
			'no-loop-func': [1],
			indent: 0,
			'linebreak-style': ['error', 'unix'],
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
			'no-class-assign': [0],
			'react/jsx-key': [1],
			'react/prop-types': [1],
			'no-mixed-spaces-and-tabs': [0],
			'react/no-children-prop': [0],
			'@typescript-eslint/no-explicit-any': [0],
			'@typescript-eslint/no-inferrable-types': [0],
			'@typescript-eslint/no-empty-interface': [0],
			'@typescript-eslint/no-unused-vars': [0],
			'@typescript-eslint/no-empty-object-type': ['warn', { allowInterfaces: true }],
			'prefer-const': [0],
			'react/jsx-uses-react': 0,
			'react/react-in-jsx-scope': 0,
			'react/prefer-stateless-function': 'warn',
			'tss-unused-classes/unused-classes': 'warn',
		},
	},
]);
