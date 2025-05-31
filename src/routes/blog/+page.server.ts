import { error } from '@sveltejs/kit';
import { promises as fs } from 'fs';
import path from 'path';

export async function load() {
  try {
    const postsDir = path.join(process.cwd(), 'src', 'posts');
    const files = await fs.readdir(postsDir);

    const markdownFiles = files.filter(file => file.endsWith('.md'));

    const posts = await Promise.all(
      markdownFiles.map(async (filename) => {
        const slug = filename.replace('.md', '');
        try {
          const post = await import(`../../posts/${filename}`);
          console.log(`Loaded post: ${slug}`, post);
          return {
            slug,
            ...post.metadata
          }
        } catch (e) {
          console.error(`Error loading post ${slug}:`, e);
          throw error(500, `Could not load post ${slug}`);
        }
      })
    );

    console.log('Loaded posts:', posts);
    return {
      posts: posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  } catch (e) {
    console.error(e);
    throw error(500, 'Could not load posts');
  }
}
