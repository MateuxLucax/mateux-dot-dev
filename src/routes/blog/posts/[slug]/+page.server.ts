import { getSvxPosts } from '$lib/utils';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => {
  const posts = getSvxPosts();

  console.log('Generating entries for blog posts:', posts.map(post => post.slug));

  return posts.map(post => ({
    slug: post.slug,
  }));
};

export const prerender = true;