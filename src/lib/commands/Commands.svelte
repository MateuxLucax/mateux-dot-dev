<script lang="ts">
	import { getRandomQuote } from "$lib/quotes";
	import Prompt from "$lib/Prompt.svelte";
	import Row from "$lib/Row.svelte";
	import HelpCommand from "./HelpCommand.svelte";
	import ListCommand from "./ListCommand.svelte";

  const commands = [
    'help',
    'clear',
    'll',
    'quote'
  ];

  let typedCommands: string[] = $state([]);

  async function handleKeyDown(event: KeyboardEvent): Promise<void> {
    if (!(event.target instanceof HTMLInputElement)) return;
    if (event.key !== 'Enter') return;

    const input = event.target.value;
    typedCommands.push(input);
    event.target.value = '';

    if (input === 'clear') {
      typedCommands = [];
    }

    window.dispatchEvent(new CustomEvent('on-new-commmand'));
  }

</script>

<section class="flex flex-col">
  {#each typedCommands as cmd}
    <Row>
      <Prompt />
      <span
        class={
          commands.includes(cmd)
            ? 'text-blue-500 dark:text-blue-300'
            : 'text-red-500 dark:text-red-300'
        }
      >{cmd}</span>
    </Row>
    <Row>
      {#if cmd == 'help'}
        <HelpCommand />
      {:else if cmd == 'clear'}
        <!-- Do nothing -->
      {:else if cmd == 'll'}
        <ListCommand />
      {:else if cmd == 'quote'}
        <Row>{getRandomQuote()}</Row>
      {:else}
        Burp: Command {cmd} not found...
      {/if}
    </Row>
  {/each} 

  <Row>
    <Prompt />
    <input type="text" onkeydown={handleKeyDown} class="flex-1 focus:outline-none command-input"/>
  </Row>
</section>

<style>
section {
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  height: 100%;
  width: 100%;
  scroll-behavior: smooth;
}

input:focus {
  background-image:none;
}

input {
  animation: blink-empty 1s infinite;
  background-image:linear-gradient(black,black);
  background-position: .1rem  center;
  background-repeat: no-repeat;
  background-size: .1rem 1.2em;
}

@keyframes blink-empty {
  0%, 100% {
    background-size: .1rem 1.2em;
  }
  50% {
    background-size: 0 1.2em;
  }
}
</style>
