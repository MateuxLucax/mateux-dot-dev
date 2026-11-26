import adapter from '@sveltejs/adapter-cloudflare';
import { escapeSvelte, mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHighlighter, type BundledLanguage } from 'shiki';
import { createHash } from 'node:crypto';
import { render as renderDiagram } from 'pele';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

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

const themes = { dark: 'catppuccin-mocha', light: 'catppuccin-latte' };
let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

// Matches Tailwind's `font-mono` stack so diagrams follow the terminal theme.
const diagramFont =
	'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

// Every label is drawn in a monospace font, so each character takes ~0.6em.
const monospaceMeasurer = { width: (text: string, size: number) => [...text].length * size * 0.6 };

type MdastNode = {
	type: string;
	depth?: number;
	value?: string;
	children?: MdastNode[];
	data?: { hProperties?: Record<string, unknown>; [key: string]: unknown };
};

function headingIds() {
	return (tree: { children: MdastNode[] }) => {
		const visit = (nodes: MdastNode[]) => {
			for (const node of nodes) {
				if (node.type === 'heading' && node.depth === 2) {
					const text = (children: MdastNode[]): string =>
						children
							.map((child) => child.value ?? (child.children ? text(child.children) : ''))
							.join('');
					const slug = text(node.children ?? [])
						.toLowerCase()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, '')
						.replace(/[^a-z0-9]+/g, '-')
						.replace(/^-|-$/g, '');
					const data = node.data ?? {};
					node.data = {
						...data,
						hProperties: { ...(data.hProperties ?? {}), id: `section-${slug}` }
					};
				}
				if (node.children) visit(node.children);
			}
		};
		visit(tree.children);
	};
}

/**
 * Renders a ```mermaid fenced block to static SVG with Pele at build time.
 * Colors come from `--pele-*` CSS variables, so light/dark mode needs no re-render.
 */
function mermaidToSvg(code: string) {
	const idPrefix = `pele-${createHash('sha1').update(code).digest('hex').slice(0, 8)}`;
	const isSequence = /^\s*sequenceDiagram\b/.test(code);

	const { svg } = renderDiagram(code, {
		idPrefix,
		fontFamily: diagramFont,
		fontFamilyMono: diagramFont,
		measurer: monospaceMeasurer,
		responsive: !isSequence
	});
	const diagramSvg = isSequence ? svg.replace('<svg ', '<svg preserveAspectRatio="none" ') : svg;
	const figureClass = isSequence ? 'pele-diagram pele-sequence-diagram' : 'pele-diagram';

	return `<figure class="${figureClass}"><div class="pele-diagram-art">${diagramSvg}</div><figcaption></figcaption></figure>`;
}

const mdsvexOptions = {
	extensions: ['.svx'],
	remarkPlugins: [headingIds],
	highlight: {
		highlighter: async (code: string, lang?: string | null) => {
			lang ??= 'text';
			if (lang === 'mermaid') {
				return `{@html \`${escapeSvelte(mermaidToSvg(code))}\` }`;
			}

			if (!highlighterPromise) {
				highlighterPromise = createHighlighter({ themes: Object.values(themes), langs }).then(
					async (instance) => {
						await instance.loadLanguage(...(langs as BundledLanguage[]));

						return instance;
					}
				);
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

export default defineConfig({
	plugins: [
		enhancedImages(),
		tailwindcss(),
		sveltekit({
			compilerOptions: { runes: true },
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
			adapter: adapter()
		})
	]
});
