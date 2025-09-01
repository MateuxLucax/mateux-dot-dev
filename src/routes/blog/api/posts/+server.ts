import { json } from '@sveltejs/kit';
import { getSvxPosts } from '$lib/utils';

export const prerender = true;

export function GET() {
	return json(getSvxPosts());
}
