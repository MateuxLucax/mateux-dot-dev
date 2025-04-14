<script>
	import { getRandomQuote } from "./quotes";
	import Prompt from "./Prompt.svelte";
	import Row from "./Row.svelte";

  /**
   * @type {{ key: string, result: string, callback?: (event: KeyboardEvent) => void }[]}
  */
  const commands = [
    {
      key: 'help',
      result: 'This is a terminal simulation. Currently there are only a few commands available. But I am working on it.',
    },
    {
      key: 'clear',
      result: 'Clears the terminal screen.',
      callback: (_) => {
        typedCommands = typedCommands.slice(0, 0);
      }
    },
    {
      key: 'quote',
      result: getRandomQuote(),
    }
  ]

  /**
   * @type {string[]} command
   */
  let typedCommands = $state([]);

  /**
   * @param {KeyboardEvent} event
   * @returns {void}
	 */
  function handleKeyDown(event) {
    if (!(event.target instanceof HTMLInputElement)) return;
    if (event.key !== 'Enter') return;

    const input = event.target.value;
    typedCommands.push(input);
    event.target.value = '';

    const command = commands.find((command) => command.key === input);
    if (!command) return;

    command.callback?.(event);
  }
</script>

{#each typedCommands as cmd}
  <Row>
    <Prompt />
    <span
      class={
        commands.find((command) => command.key === cmd)
          ? 'text-blue-500 dark:text-blue-300'
          : 'text-red-500 dark:text-red-300'
      }
    >{cmd}</span>
  </Row>
  <Row>
    { commands.find((command) => command.key === cmd)?.result || `burp: Command ${cmd} not found...` }
  </Row>
{/each} 

<Row>
  <Prompt />
  <input type="text" onkeydown={handleKeyDown} class="flex-1 focus:outline-none"/>
</Row>

<style>

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
