import { error } from '@sveltejs/kit'

export async function load({ params }) {
  try {
    console.log(`Loading post with slug: ${params.slug}`)
    const post = await import(`../../../../lib/posts/${params.slug}.md`)

    return {
      content: post.default,
      meta: post.metadata
    }
  } catch (e) {
    console.error(`Error loading post ${params.slug}:`, e)
    error(404, `Could not find ${params.slug}`)
  }
}
