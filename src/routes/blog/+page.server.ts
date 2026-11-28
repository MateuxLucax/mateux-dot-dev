import { getSvxPosts } from '#lib/server/posts.ts';

export const prerender = true;

export function load() {
	return { posts: getSvxPosts() };
}
