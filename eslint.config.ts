import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';

export default defineConfig([
	{ ignores: ['.svelte-kit/', 'build/', '.wrangler/', 'test-results/', 'playwright-report/'] },
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: { globals: globals.browser }
	},
	tseslint.configs.recommended,
	prettier,
	svelte.configs.prettier,
	svelte.configs.recommended,
	// <script lang="ts"> in .svelte files needs the TypeScript parser.
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			globals: globals.browser,
			parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.svelte'] }
		}
	},
	// Config files run in Node.
	{ files: ['*.config.{js,cjs,ts}'], languageOptions: { globals: globals.node } },
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			],
			// The site has no base path, so plain hrefs and goto() are fine.
			'svelte/no-navigation-without-resolve': 'off'
		}
	}
]);
