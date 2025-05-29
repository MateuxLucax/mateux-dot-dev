<script lang="ts">
  export let data;
</script>

<svelte:head>
  <title>Blog Posts</title>
</svelte:head>

<div class="container">
  <h1>Blog Posts</h1>
  
  <ul class="post-list">
    {#each data.posts as post}
      <li class="post-item">
        <a href="/blog/posts/{post.slug}" class="post-link">
          <h2>{post.title}</h2>
          <p class="post-date">{new Date(post.date).toLocaleDateString()}</p>
          {#if post.description}
            <p class="post-description">{post.description}</p>
          {/if}
          {#if post.tags}
            <div class="post-tags">
              {#each post.tags as tag}
                <span class="tag">#{tag}</span>
              {/each}
            </div>
          {/if}
        </a>
      </li>
    {/each}
  </ul>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .post-list {
    list-style-type: none;
    padding: 0;
    margin: 2rem 0;
  }
  
  .post-item {
    margin-bottom: 2rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 1rem;
  }
  
  .post-item:last-child {
    border-bottom: none;
  }
  
  .post-link {
    display: block;
    text-decoration: none;
    color: inherit;
  }
  
  .post-link:hover h2 {
    color: #0077cc;
  }
  
  .post-date {
    color: #666;
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }
  
  .post-description {
    margin: 0.5rem 0;
  }
  
  .post-tags {
    margin-top: 0.5rem;
  }
  
  .tag {
    display: inline-block;
    margin-right: 0.5rem;
    background-color: #f0f0f0;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    color: #333;
  }
</style>
