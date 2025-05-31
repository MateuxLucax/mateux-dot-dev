import { error } from '@sveltejs/kit';
import type { PostData } from '../type';

export async function load({ params }) : Promise<PostData> {
  try {
    const post = await import(`../../../../posts/${params.slug}.md`);
    return {
      content: post.default,
      meta: post.metadata
    };
  } catch (e) {
    console.error(e);
    throw error(404, 'Not found');
  }
}
