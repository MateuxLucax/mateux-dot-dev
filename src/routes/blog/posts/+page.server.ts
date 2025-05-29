import { error } from '@sveltejs/kit';
import { promises as fs } from 'fs';
import path from 'path';

export async function load() {
  try {
    // Directory containing our markdown posts
    const postsDir = path.join(process.cwd(), 'src', 'posts');
    
    // Get all files from the posts directory
    const files = await fs.readdir(postsDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    // Load post metadata
    const posts = await Promise.all(
      markdownFiles.map(async (filename) => {
        const slug = filename.replace('.md', '');
        try {
          const post = await import(`../../../posts/${filename}`);
          return {
            slug,
            ...post.metadata
          };
        } catch (e) {
          console.error(`Error importing ${filename}`, e);
          return {
            slug,
            title: slug,
            date: new Date().toISOString()
          };
        }
      })
    );
    
    // Sort posts by date (newest first)
    return {
      posts: posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  } catch (e) {
    console.error(e);
    throw error(500, 'Could not load posts');
  }
}
