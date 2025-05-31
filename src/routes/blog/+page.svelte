<script lang="ts">
  type Posts = {
    posts: {
      title: string;
      slug: string;
      date: string;
      description?: string;
      tags?: string[];
    }[];
  };

  export let data: Posts;
</script>

<svelte:head>
  <title>mateux@tars ~/Blog></title>
</svelte:head>

<section>
  <h1>Blog</h1>

  <ul>
    {#each data.posts as post}
      <li>
        <a href="/blog/posts/{post.slug}">
          <h2>{post.title}</h2>
          <p>{new Date(post.date).toLocaleDateString()}</p>
          {#if post.description}
            <p>{post.description}</p>
          {/if}
          {#if post.tags}
            <div>
              {#each post.tags as tag}
                <span>#{tag}</span>
              {/each}
            </div>
          {/if}
        </a>
      </li>
    {/each}
  </ul>  
</section>
