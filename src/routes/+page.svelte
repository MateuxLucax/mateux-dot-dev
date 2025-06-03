<script lang="ts">
	import Commands from "$lib/components/commands/Commands.svelte";
	import Prompt from "$lib/components/Prompt.svelte";
	import Row from "$lib/components/Row.svelte";
	import { onMount } from "svelte";
	import type { Post } from "./blog/posts/type";

  const contacts = [
    {
      url: 'https://www.linkedin.com/in/mateusbrandt',
      result: 'If you wish to connect with me, this is the best place to do so. I am always open to new opportunities and connections.',
      target: '_blank'
    },
    {
      url: 'https://github.com/mateuxlucax',
      result: 'Here you can find all my creations and projects. Hopefully, you will find something interesting.',
      target: '_blank'
    }
  ];

  let latestPosts: Post[] = $state([]);

  async function getLatestBlogPosts() {
    try {
      const response = await fetch('/blog/api/posts/latest', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      const data = await response.json();
      console.log('Latest blog posts:', data);
      latestPosts = data;
    } catch (error) {
      console.error('Error fetching latest blog posts:', error);
      latestPosts = [];
    }
  }

  onMount(() => {
    getLatestBlogPosts();
  });
</script>   

<svelte:head>
  <title>mateux@tars ~></title>
</svelte:head>

<Row><Prompt /> cd <span class="text-yellow-500 dark:text-yellow-300">~/About</span></Row>
<Row><Prompt path="/About" /> <span class="text-blue-500 dark:text-blue-300">cat</span> <span class="text-pink-400 dark:text-pink-300 underline underline-offset-2">README.md</span></Row>
<Row>
  # Hi there, I'm Mateus Lucas
  <br />
  <br />
  I'm a Software Engineer (with a passion for problem-solving 🤓) based in Brazil. My drive is to build great user experiences as if I were the target user who really enjoys a beautifully crafted experience.
</Row>
<Row><Prompt /> cd <span class="text-yellow-500 dark:text-yellow-300"> ~/Contacts</span></Row>
{#each contacts as contact}
  <Row>
    <Prompt path="/Contacts" />
    curl <span class="text-teal-600 dark:text-teal-300">-I -X</span> <span class="text-pink-400 dark:text-pink-300">GET</span>
    <a href="{contact.url}" target={contact.target} class="break-all rounded text-pink-400 dark:text-pink-300 underline underline-offset-2 hover:bg-gray-200 active:bg-gray-300 focus:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:focus:bg-gray-600">
      {contact.url}
    </a>
  </Row>
  <Row>HTTP/1.1 200 OK</Row>
  <Row>{contact.result}</Row>
{/each} 
<Row><Prompt path="/Contacts"/> cd</Row>
<Row><Prompt /> cd <a href="/blog" target="_self" class="text-yellow-500 dark:text-yellow-300"> ~/Blog</a></Row>
{#if latestPosts.length > 0}
  <Row><Prompt path="/Blog" /> ls -1</Row>
  <Row>total {latestPosts.length}</Row>
  {#each latestPosts as post}
    <Row>
      <a href={`/blog/posts/${post.slug}`} class="text-blue-500 dark:text-blue-300 underline underline-offset-2 hover:bg-gray-200 active:bg-gray-300 focus:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:focus:bg-gray-600">
        {post.title}/
      </a>
    </Row>
  {/each}
{/if}
<Row><Prompt path="/Blog"/> cd</Row>
<Commands />
