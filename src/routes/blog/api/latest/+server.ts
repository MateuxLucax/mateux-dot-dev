import { json } from '@sveltejs/kit';
import { getSvxPosts } from '$lib/server/posts';

export const prerender = true;

export function GET() {
	const posts = getSvxPosts();

	return json(posts.slice(0, 3));
}
