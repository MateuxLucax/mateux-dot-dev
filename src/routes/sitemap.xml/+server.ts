import { getSvxPosts } from '$lib/server/posts';

export const prerender = true;

export function GET() {
	const posts = getSvxPosts();
	const siteUrl = 'https://mateux.dev';

	const staticRoutes = ['', '/blog', '/typetest'];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
	.map(
		(route) => `
	<url>
		<loc>${siteUrl}${route}</loc>
		<changefreq>weekly</changefreq>
		<priority>${route === '' ? '1.0' : '0.8'}</priority>
	</url>`
	)
	.join('')}
${posts
	.map(
		(post) => `
	<url>
		<loc>${siteUrl}/blog/posts/${escapeXml(post.slug)}</loc>
		<lastmod>${new Date(post.date).toISOString().split('T')[0]}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.6</priority>
	</url>`
	)
	.join('')}
</urlset>`;

	return new Response(sitemap.trim(), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8'
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
