import adapter from '@sveltejs/adapter-static';
import { escapeSvelte, mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { createHighlighter } from 'shiki'

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
  'svelte'
];

const themes = {
  dark: 'catppuccin-mocha',
  light: 'catppuccin-latte',
}

const mdsvexOptions = {
  extensions: ['.svx'],
  highlight: {
    highlighter: async (code, lang = 'text') => {
      const highlighter = await createHighlighter({
        themes: Object.values(themes),
        langs: langs,
      })
      await highlighter.loadLanguage(...langs)
      const html = escapeSvelte(
        `<div class="shiki-light">${highlighter.codeToHtml(code, { lang, theme: themes.light })}</div>` +
        `<div class="shiki-dark">${highlighter.codeToHtml(code, { lang, theme: themes.dark })}</div>`
      );

      highlighter.dispose();
      return `{@html \`${html}\` }`
    }
  },
};

const config = {
  extensions: ['.svelte', '.svx'],
  preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
  kit: {
    adapter: adapter(),
  },
};

export default config;
