import { getSvxPosts } from '$lib/server/posts';
import type { Post } from './blog/posts/type';

export const prerender = true;

export function load() {
	const posts = getSvxPosts();
	const shuffled = posts.sort(() => 0.5 - Math.random());
	const randomPosts: Post[] = shuffled.slice(0, 3);

	return { randomPosts };
}
