import adapter from '@sveltejs/adapter-static';
import { escapeSvelte, mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHighlighter } from 'shiki';

const langs = [
	'javascript',
	'typescript',
	'java',
	'python',
	'bash',
	'html',
	'css',
	'json',
	'php',
	'sql',
	'yaml',
	'markdown',
	'svelte',
	'kotlin',
	'go',
	'mermaid',
	'dart',
	'tsx',
	'vue',
	'dockerfile'
];

const themes = {
	dark: 'catppuccin-mocha',
	light: 'catppuccin-latte'
};

let highlighterPromise = null;

const mdsvexOptions = {
	extensions: ['.svx'],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			if (!highlighterPromise) {
				highlighterPromise = createHighlighter({
					themes: Object.values(themes),
					langs: langs
				}).then(async (instance) => {
					await instance.loadLanguage(...langs);
					return instance;
				});
			}
			const highlighterInstance = await highlighterPromise;
			const html = escapeSvelte(
				`<div class="shiki-light">${highlighterInstance.codeToHtml(code, { lang, theme: themes.light })}</div>` +
					`<div class="shiki-dark">${highlighterInstance.codeToHtml(code, { lang, theme: themes.dark })}</div>`
			);

			return `{@html \`${html}\` }`;
		}
	}
};

const config = {
	compilerOptions: {
		runes: true
	},
	extensions: ['.svelte', '.svx'],
	preprocess: [
		vitePreprocess(),
		mdsvex(mdsvexOptions),
		{
			name: 'replace-context-module',
			markup({ content, filename }) {
				if (filename && filename.endsWith('.svx')) {
					return {
						code: content.replace(/<script\s+context="module"\s*>/g, '<script module>')
					};
				}
			}
		}
	],
	kit: {
		adapter: adapter()
	}
};

export default config;
