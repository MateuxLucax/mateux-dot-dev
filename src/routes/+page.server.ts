import { getSvxPosts } from '$lib/server/posts';

export const prerender = true;

export function load() {
	const posts = getSvxPosts();
	const latestPosts = posts
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 3);

	return { randomPosts: latestPosts };
}
