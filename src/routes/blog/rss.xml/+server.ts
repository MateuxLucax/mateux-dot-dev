import { getSvxPosts } from '$lib/server/posts';

export const prerender = true;

export function GET() {
	const posts = getSvxPosts();
	const siteUrl = 'https://mateux.dev';

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
	<title>mateux.dev blog</title>
	<link href="${siteUrl}/blog/rss.xml" rel="self" />
	<link href="${siteUrl}/blog" />
	<updated>${new Date().toISOString()}</updated>
	<id>${siteUrl}/blog</id>
	<author>
		<name>Mateus Brandt</name>
	</author>
${posts
	.map(
		(post) => `
	<entry>
		<title>${escapeXml(post.title)}</title>
		<link href="${siteUrl}/blog/posts/${escapeXml(post.slug)}" />
		<id>${siteUrl}/blog/posts/${escapeXml(post.slug)}</id>
		<updated>${new Date(post.date).toISOString()}</updated>
		<summary>${escapeXml(post.description)}</summary>
	</entry>`
	)
	.join('')}
</feed>`;

	return new Response(rss.trim(), {
		headers: {
			'Content-Type': 'application/atom+xml; charset=utf-8'
		}
	});
}

function escapeXml(unsafe: string): string {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
