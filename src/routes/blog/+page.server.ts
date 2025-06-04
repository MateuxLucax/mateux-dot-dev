import type { Post } from './posts/type'

export const prerender = true;

export async function load({ fetch }) {
  const response = await fetch('/blog/api/posts')
  const posts: Post[] = await response.json()
  return { posts }
}