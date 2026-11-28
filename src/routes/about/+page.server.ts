import { getSvxPosts } from '#lib/server/posts.ts';

export const prerender = true;

const featuredSlugs = [
	'timemore-dot-ble',
	'unifique-speedtest-monitoring',
	'automated-accessibility-flutter-linter'
];

export function load() {
	const posts = getSvxPosts();
	return {
		featured: featuredSlugs.map((slug) => {
			const post = posts.find((post) => post.slug === slug);
			if (!post) throw new Error(`Featured post not found: ${slug}`);
			return post;
		})
	};
}
