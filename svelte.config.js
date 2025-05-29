import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';

const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [
    mdsvex({ extensions: ['.md'] })
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
