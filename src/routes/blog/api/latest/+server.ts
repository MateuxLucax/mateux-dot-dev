import { json } from '@sveltejs/kit'
import type { Post } from '../../posts/type'

export const prerender = true;

async function getPosts() {
  let posts: Post[] = []

  const paths = import.meta.glob('/src/lib/posts/*.svx', { eager: true })

  const maxPosts = 3
  for (const path in paths) {
    const file = paths[path]
    const slug = path.split('/').at(-1)?.replace('.svx', '')

    if (file && typeof file === 'object' && 'metadata' in file && slug) {
      const metadata = file.metadata as Omit<Post, 'slug'>
      const post = { ...metadata, slug } satisfies Post
      posts.push(post)

      if (posts.length >= maxPosts) break
    }
  }

  posts = posts.sort((first, second) =>
    new Date(second.date).getTime() - new Date(first.date).getTime()
  )

  return posts
}

export async function GET() {
  const posts = await getPosts()
  return json(posts)
}
