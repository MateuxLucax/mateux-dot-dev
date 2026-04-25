import type { Post } from '../../routes/blog/posts/type';
import { calculateReadingTime, stripFrontmatter } from '$lib/utils';

export function getSvxPosts(): Post[] {
	let posts: Post[] = [];

	const paths = import.meta.glob('/src/lib/posts/*.svx', { eager: true });
	const rawPaths = import.meta.glob('/src/lib/posts/*.svx', {
		eager: true,
		query: '?raw',
		import: 'default'
	});

	for (const path in paths) {
		const file = paths[path];
		const slug = path.split('/').at(-1)?.replace('.svx', '');

		if (file && typeof file === 'object' && 'metadata' in file && slug) {
			const metadata = file.metadata as Omit<Post, 'slug' | 'readingTime'>;

			const raw = rawPaths[path] as string | undefined;
			const readingTime = raw ? calculateReadingTime(stripFrontmatter(raw)) : 1;

			const post = { ...metadata, slug, readingTime } satisfies Post;
			posts.push(post);
		}
	}

	posts = posts.sort(
		(first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()
	);

	return posts;
}
