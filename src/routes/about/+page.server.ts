import { getSvxPosts } from '#lib/server/posts.ts';

export const prerender = true;

export function load() {
	const counts = new Map<string, number>();
	for (const post of getSvxPosts()) {
		for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	}
	const tags = [...counts]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 7)
		.map(([tag]) => tag);
	return { tags };
}
