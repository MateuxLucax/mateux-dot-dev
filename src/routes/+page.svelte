<script>
  import Prompt from "../components/Prompt.svelte";
  import Cursor from "../components/Cursor.svelte";

  const commands = [
    {
      url: 'https://www.linkedin.com/in/mateusbrandt',
      result: 'If you wish to connect with me, this is the best place to do so. I am always open to new opportunities and connections.'
    },
    {
      url: 'https://github.com/mateuxlucax',
      result: 'Here you can find all my creations and projects. Hopefully, you will find something interesting.'
    }
  ];
</script>   

<svelte:head>
	<title>mateux@tars</title>
</svelte:head>

<li><Prompt /> cd <span class="text-yellow-500 dark:text-yellow-300">~/About</span></li>
<li><Prompt path="/About" /> <span class="text-blue-500 dark:text-blue-300">cat</span> <span class="text-pink-400 dark:text-pink-300 underline underline-offset-2">README.md</span></li>
<li>
  # Hi there, I'm Mateus Lucas
  <br />
  <br />
  I'm a Software Engineer (with a passion for problem-solving 🤓) based in Brazil. My drive is to build great user experiences as if I were the target user who really enjoys a beautifully crafted experience.
</li>
<li><Prompt /> cd <span class="text-yellow-500 dark:text-yellow-300"> ~/Contacts</span></li>
{#each commands as cmd}
  <li>
    <Prompt path="/Contacts" />
    curl <span class="text-teal-600 dark:text-teal-300">-I</span>
    <a href="{cmd.url}" target="_blank" class="p-2 rounded text-pink-400 dark:text-pink-300 underline underline-offset-2 hover:bg-gray-200 active:bg-gray-300 focus:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:focus:bg-gray-600">
      {cmd.url}
    </a>
  </li>
  <li>HTTP/1.1 200 OK</li>
  <li>{cmd.result}</li>
{/each} 
<li><Prompt path="/Contacts"/> cd</li>
<li><Prompt /> <Cursor /></li>