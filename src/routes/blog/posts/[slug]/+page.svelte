<script lang="ts">
  export let data;
  const { title, date, tags } = data.meta;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<article>
  <h1>{title}</h1>
  <p><em>{new Date(date).toLocaleDateString()}</em></p>
  <div class="tags">
    {#if tags}
      {#each tags as tag}
        <a href={`/blog/tag/${tag}`} class="tag">#{tag}</a>
      {/each}
    {/if}
  </div>

  <!-- Render the Markdown content component (from MDsveX) -->
  <div class="content">
    <data.content />
  </div>
</article>

<style>
  article {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .tags {
    margin: 1rem 0;
  }
  
  .tag {
    display: inline-block;
    margin-right: 0.5rem;
    background-color: #f0f0f0;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    text-decoration: none;
    color: #333;
  }
  
  .content :global(h2) {
    margin-top: 2rem;
  }
  
  .content :global(pre) {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
  }
</style>
