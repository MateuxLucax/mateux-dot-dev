import { error } from '@sveltejs/kit';
import { calculateReadingTime, stripFrontmatter } from '$lib/utils';

export async function load({ params }) {
	try {
		const post = await import(`../../../../lib/posts/${params.slug}.svx`);

		const rawFiles = import.meta.glob('/src/lib/posts/*.svx', {
			eager: true,
			query: '?raw',
			import: 'default'
		});

		const raw = rawFiles[`/src/lib/posts/${params.slug}.svx`] as string | undefined;
		const readingTime = raw ? calculateReadingTime(stripFrontmatter(raw)) : 1;

		// Compute related posts based on shared tags
		const allPaths = import.meta.glob('/src/lib/posts/*.svx', { eager: true });
		const currentTags: string[] = post.metadata.tags || [];
		const related: Array<{ title: string; slug: string }> = [];

		for (const path in allPaths) {
			const file = allPaths[path];
			const slug = path.split('/').at(-1)?.replace('.svx', '');
			if (!slug || slug === params.slug) continue;
			if (file && typeof file === 'object' && 'metadata' in file) {
				const meta = (file as { metadata: { title: string; tags: string[] } }).metadata;
				const shared = meta.tags?.filter((t: string) => currentTags.includes(t)) || [];
				if (shared.length > 0) {
					related.push({ title: meta.title, slug });
				}
			}
		}

		// Sort by most shared tags, then shuffle slightly, take top 3
		related.sort(() => 0.5 - Math.random());
		const topRelated = related.slice(0, 3);

		return {
			content: post.default,
			meta: { ...post.metadata, readingTime },
			related: topRelated
		};
	} catch (e) {
		error(404, `Could not find ${params.slug}`);
	}
}
