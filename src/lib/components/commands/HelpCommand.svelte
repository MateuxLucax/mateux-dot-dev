<script lang="ts">
	import Row from '../Row.svelte';

	const availableCommands = [
		'- help: Displays this help message.',
		'- clear: Clears the terminal screen.',
		'- ll: Lists the contents of the root directory.',
		'- quote: Fetches a random quote.'
	];
</script>

<Row>
	Available commands:
	{#each availableCommands as command}
		{command}<br />
	{/each}
</Row>
