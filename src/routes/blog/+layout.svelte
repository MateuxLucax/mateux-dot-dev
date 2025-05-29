<script>
  import { page } from '$app/stores';
  let { children } = $props();
</script>

<svelte:head>
  <title>Mateux's Blog</title>
</svelte:head>

<div class="blog-layout">
  <header class="blog-header">
    <div class="container">
      <nav class="nav">
        <a href="/" class="home-link">Home</a>
        <a href="/blog/posts" class="blog-link">Blog</a>
      </nav>
    </div>
  </header>
  
  <main class="blog-content">
    <div class="container">
      {@render children()}
    </div>
  </main>
  
  <footer class="blog-footer">
    <div class="container">
      <p>© {new Date().getFullYear()} Mateus Lucas. All rights reserved.</p>
    </div>
  </footer>
</div>

<style>
  .blog-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .blog-header {
    background-color: #f8f9fa;
    padding: 1rem 0;
    border-bottom: 1px solid #e9ecef;
  }
  
  .nav {
    display: flex;
    gap: 1.5rem;
  }
  
  .home-link, .blog-link {
    text-decoration: none;
    color: #343a40;
    font-weight: 500;
    transition: color 0.2s;
  }
  
  .home-link:hover, .blog-link:hover {
    color: #0d6efd;
  }
  
  .blog-content {
    flex: 1;
    padding: 2rem 0;
  }
  
  .blog-footer {
    background-color: #f8f9fa;
    padding: 1.5rem 0;
    border-top: 1px solid #e9ecef;
    text-align: center;
    color: #6c757d;
  }
  
  @media (prefers-color-scheme: dark) {
    .blog-layout {
      background-color: #121212;
      color: #e9ecef;
    }
    
    .blog-header {
      background-color: #1e1e1e;
      border-bottom: 1px solid #333;
    }
    
    .home-link, .blog-link {
      color: #e9ecef;
    }
    
    .home-link:hover, .blog-link:hover {
      color: #90caf9;
    }
    
    .blog-footer {
      background-color: #1e1e1e;
      border-top: 1px solid #333;
      color: #adb5bd;
    }
  }
</style>
