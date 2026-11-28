import { getSvxPosts } from '#lib/server/posts.ts';

export const prerender = true;

export function load() {
	const posts = getSvxPosts();
	return { updated: posts[0]?.date ?? '', latestPosts: posts.slice(0, 4) };
}
