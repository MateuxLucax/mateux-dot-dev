<script lang="ts">
  export let data;
  const { title, date, tags } = data.meta;

  const headTitle = title.toLowerCase().replace(/\s+/g, '-');
</script>

<svelte:head>
  <title>mateux@tars ~/B/{headTitle}></title>
</svelte:head>

<article>
  <a href="/blog/">Back to Posts</a>
  <h1>{title}</h1>
  <p><em>{new Date(date).toLocaleDateString()}</em></p>
  <section>
    {#if tags}
      {#each tags as tag}
        <a href={`/blog/tag/${tag}`} class="tag">#{tag}</a>
      {/each}
    {/if}
  </section>

  <section>
    <data.content />
  </section>
</article>
