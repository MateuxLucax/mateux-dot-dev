<script lang="ts">
	import Row from "../Row.svelte";

  const contacts = [
    {
      url: 'https://www.linkedin.com/in/mateusbrandt',
      text: 'Linkedin/'
    },
    {
      url: 'https://github.com/mateuxlucax',
      text: 'GitHub/'
    },
    {
      url: '/blog/posts',
      text: 'Blog/'
    }
  ];
</script>

<Row>
  total {contacts.length * 4}k
</Row>
<Row>
  {#each contacts as contact}
    drwxr-xr-x  2 user group  4.0K Aug 02 12:00 <a href={contact.url} target={contact.url.includes('http') ? "_blank" : "_self"} class="text-blue-800 h-0">{contact.text}</a>
  {/each}
</Row>