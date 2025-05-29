<script>
	import { getRandomQuote } from "$lib/quotes";
	import Prompt from "$lib/Prompt.svelte";
	import Row from "$lib/Row.svelte";
  import { onMount } from 'svelte';

  // Container reference for scrolling
  /** @type {HTMLElement | null} */
  let containerRef = null;
  
  /** @type {HTMLElement | null} */
  let terminalBodyRef = null;

  // Function to scroll to the bottom of the container
  function scrollToBottom() {
    // Try to scroll both the container and the parent terminal body
    if (containerRef) {
      // Use requestAnimationFrame to ensure DOM is updated before scrolling
      window.requestAnimationFrame(() => {
        containerRef.scrollTop = containerRef.scrollHeight;
        
        // Also try to scroll the parent terminal container if available
        const terminalBody = document.querySelector('.terminal-body');
        if (terminalBody) {
          terminalBody.scrollTop = terminalBody.scrollHeight;
        }
        
        // Try to find the input element and focus it
        const inputElement = containerRef.querySelector('input');
        if (inputElement) {
          inputElement.focus();
        }
      });
    }
  }

  /**
   * @type {{ key: string, result: () => string, callback?: (event: KeyboardEvent) => void }[]}
  */
  const commands = [
    {
      key: 'help',
      result: () =>`
        Available commands:\n
        - help: Displays this help message.\n
        - clear: Clears the terminal screen.\n
        - ll: Lists the contents of the root directory.\n
        - quote: Fetches a random quote.
      `,
    },
    {
      key: 'clear',
      result: () => 'Clears the terminal screen.',
      callback: (_) => {
        typedCommands = typedCommands.slice(0, 0);
      }
    },
    {
      key: 'll',
      result: () =>'/',
    },
    {
      key: 'quote',
      result: getRandomQuote,
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
    
    // Scroll to bottom after command is processed - use multiple approaches
    window.requestAnimationFrame(() => {
      scrollToBottom();
      
      // Also ensure the last input row is visible
      const inputRow = document.getElementById('command-input-row');
      if (inputRow) {
        inputRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
  }

  $effect(() => {
    if (typedCommands.length > 0) {
      // Use requestAnimationFrame for more reliable timing
      window.requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  });

  onMount(() => {
    scrollToBottom();
  });
</script>

<div bind:this={containerRef} class="terminal-container commands-section">
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
      { commands.find((command) => command.key === cmd)?.result() || `burp: Command ${cmd} not found...` }
    </Row>
  {/each} 

  <Row id="command-input-row">
    <Prompt />
    <input type="text" onkeydown={handleKeyDown} class="flex-1 focus:outline-none command-input"/>
  </Row>
</div>

<style>
.terminal-container {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  height: 100%;
  width: 100%;
}

.commands-section {
  scroll-behavior: smooth;
}

#command-input-row {
  margin-top: auto;
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
