import { error, type RequestHandler } from '@sveltejs/kit';

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
  const { slug } = params;

  if (!slug) {
    throw error(400, 'Slug parameter is required');
  }

  try {
    const post = await import(`../../../../../lib/posts/${slug}.svx?raw`);
    
    return new Response(post.default, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8'
      }
    });
  } catch (e) {
    throw error(404, `Post with slug "${slug}" not found`);
  }
};
