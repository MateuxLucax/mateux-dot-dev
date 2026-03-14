import { json } from '@sveltejs/kit';
import { getSvxPosts } from '$lib/server/posts';

export const prerender = true;

export function GET() {
	return json(getSvxPosts());
}
