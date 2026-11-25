import adapter from '@sveltejs/adapter-cloudflare';
import { escapeSvelte, mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHighlighter } from 'shiki';
import { createHash } from 'node:crypto';
import { render as renderDiagram } from 'pele';

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

// Matches Tailwind's `font-mono` stack so diagrams follow the terminal theme.
const diagramFont =
	'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

// Every label is drawn in a monospace font, so each character takes ~0.6em.
const monospaceMeasurer = {
	width: (text, size) => [...text].length * size * 0.6
};

/**
 * Renders a ```mermaid fenced block to static SVG with Pele at build time.
 * Colors come from `--pele-*` CSS variables, so light/dark mode needs no re-render.
 */
function mermaidToSvg(code) {
	const idPrefix = `pele-${createHash('sha1').update(code).digest('hex').slice(0, 8)}`;
	const { svg } = renderDiagram(code, {
		idPrefix,
		fontFamily: diagramFont,
		fontFamilyMono: diagramFont,
		measurer: monospaceMeasurer
	});
	return `<div class="pele-diagram flex w-full grow items-center justify-center">${svg}</div>`;
}

const mdsvexOptions = {
	extensions: ['.svx'],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			if (lang === 'mermaid') {
				return `{@html \`${escapeSvelte(mermaidToSvg(code))}\` }`;
			}
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
