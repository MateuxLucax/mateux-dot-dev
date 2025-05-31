import adapter from '@sveltejs/adapter-static';
import rehypeMermaid from 'rehype-mermaid';
import { mdsvex } from 'mdsvex';

const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [
    mdsvex({
      rehypePlugins: [[rehypeMermaid, { strategy: 'img-svg' }]],
      highlight: {
        highlighter: (code, lang) => {
          if (lang !== 'mermaid') {
            return highlight(code, lang);
          }

          return {
            type: 'element',
            tagName: 'code',
            properties: { className: 'language-mermaid' },
            children: [{ type: 'text', value: code }],
          };
        },
      },
    }),
  ],
  kit: {
    adapter: adapter()
  },
  alias: {
    $lib: 'src/lib',
    $utils: 'src/lib/utils',
    $components: 'src/lib/components',
  },
};

export default config;
