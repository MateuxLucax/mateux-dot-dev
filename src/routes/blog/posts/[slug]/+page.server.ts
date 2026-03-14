import { getSvxPosts } from '$lib/server/posts';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => {
	const posts = getSvxPosts();

	return posts.map((post) => ({
		slug: post.slug
	}));
};

export const prerender = true;
