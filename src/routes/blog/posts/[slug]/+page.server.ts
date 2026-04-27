import { error } from '@sveltejs/kit';
import { getSvxPosts } from '$lib/server/posts';
import { calculateReadingTime, stripFrontmatter } from '$lib/utils';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => {
	const posts = getSvxPosts();

	return posts.map((post) => ({
		slug: post.slug
	}));
};

export const prerender = true;

export async function load({ params }) {
	if (!/^[a-zA-Z0-9_-]+$/.test(params.slug)) {
		error(400, 'Invalid slug format');
	}

	const rawFiles = import.meta.glob('/src/lib/posts/*.svx', {
		eager: true,
		query: '?raw',
		import: 'default'
	});

	const allPaths = import.meta.glob('/src/lib/posts/*.svx', { eager: true });

	const raw = rawFiles[`/src/lib/posts/${params.slug}.svx`] as string | undefined;
	const readingTime = raw ? calculateReadingTime(stripFrontmatter(raw)) : 1;

	const post = allPaths[`/src/lib/posts/${params.slug}.svx`] as
		| { metadata: { tags: string[] } }
		| undefined;
	const currentTags: string[] = post?.metadata.tags || [];
	const related: Array<{ title: string; slug: string; date: string }> = [];

	for (const path in allPaths) {
		const file = allPaths[path];
		const slug = path.split('/').at(-1)?.replace('.svx', '');
		if (!slug || slug === params.slug) continue;
		if (file && typeof file === 'object' && 'metadata' in file) {
			const meta = (file as { metadata: { title: string; tags: string[]; date: string } }).metadata;
			const shared = meta.tags?.filter((t: string) => currentTags.includes(t)) || [];
			if (shared.length > 0) {
				related.push({ title: meta.title, slug, date: meta.date });
			}
		}
	}

	related.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	const topRelated = related.slice(0, 3);

	return {
		readingTime,
		related: topRelated
	};
}
