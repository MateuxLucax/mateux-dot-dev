import { json } from '@sveltejs/kit';
import { getSvxPosts } from '$lib/utils';

export const prerender = true;

export function GET() {
	const posts = getSvxPosts();
	posts.slice(0, 3);

	return json(posts);
}
