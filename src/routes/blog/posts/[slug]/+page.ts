import { error } from '@sveltejs/kit';

export async function load({ params, data }) {
	if (!/^[a-zA-Z0-9_-]+$/.test(params.slug)) {
		error(400, 'Invalid slug format');
	}

	try {
		const post = await import(`../../../../lib/posts/${params.slug}.svx`);

		return {
			content: post.default,
			meta: { ...post.metadata, readingTime: data.readingTime },
			related: data.related
		};
	} catch (e) {
		error(404, `Could not find ${params.slug}`);
	}
}
