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
  light: 'catppuccin-latte',
  dark: 'catppuccin-mocha',
}

const mdsvexOptions = {
  extensions: ['.svx'],
  highlight: {
    highlighter: async (code, lang = 'text') => {
      const highlighter = await createHighlighter({
        themes: Object.values(themes),
        langs: langs,
      })
      await highlighter.loadLanguage('javascript', 'typescript')
      const html = escapeSvelte(highlighter.codeToHtml(code, { lang, themes: themes, defaultColor: 'light' }))
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
