<script>
  import { goto } from '$app/navigation';
  
  // Redirect to /blog/posts
  function redirectToPosts() {
    goto('/blog/posts');
  }
</script>

<svelte:head>
  <title>Blog</title>
</svelte:head>

{#await redirectToPosts()}
  <div class="container">
    <h1>Redirecting to Blog Posts...</h1>
  </div>
{/await}

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
    text-align: center;
  }
</style>
