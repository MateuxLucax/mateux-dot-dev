import type { Post } from "../routes/blog/posts/type";

type DateStyle = Intl.DateTimeFormatOptions['dateStyle']

export function formatDate(date: string, dateStyle: DateStyle = 'medium') {
  return new Date(date).toLocaleDateString('en-US', {
    dateStyle,
    timeZone: 'UTC',
  });
}

export function isDarkMode() {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  return false;
}

export function getSvxPosts(): Post[] {
  let posts: Post[] = []

  const paths = import.meta.glob('/src/lib/posts/*.svx', { eager: true })

  for (const path in paths) {
    const file = paths[path]
    const slug = path.split('/').at(-1)?.replace('.svx', '')

    if (file && typeof file === 'object' && 'metadata' in file && slug) {
      const metadata = file.metadata as Omit<Post, 'slug'>
      const post = { ...metadata, slug } satisfies Post
      posts.push(post)
    }
  }

  posts = posts.sort((first, second) =>
    new Date(second.date).getTime() - new Date(first.date).getTime()
  )

  return posts
}
