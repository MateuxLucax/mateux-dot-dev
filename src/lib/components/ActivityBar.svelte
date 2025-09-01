<script>
	import { onMount } from 'svelte';

	let time = $state(new Date());

	onMount(() => {
		const interval = setInterval(() => {
			time = new Date();
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<header
	class="fixed top-0 left-0 z-50 flex h-8 w-full items-center justify-between bg-white/80 px-4 text-black shadow backdrop-blur-md dark:bg-gray-800/80 dark:text-white"
>
	<div class="flex flex-row items-center gap-4 font-normal">
		<a href="/" target="_self" aria-label="Get back to home">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="size-6"
			>
				<path
					fill-rule="evenodd"
					d="M2.25 6a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V6Zm3.97.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 0 1 0-1.06Zm4.28 4.28a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z"
					clip-rule="evenodd"
				/>
			</svg>
		</a>
		<span class="font-bold">Terminal</span>
		<span>File</span>
		<span class="hidden sm:block">Edit</span>
		<span class="hidden sm:block">View</span>
		<span class="hidden sm:block">Window</span>
		<span class="hidden sm:block">Help</span>
	</div>
	<div>
		{time.toLocaleTimeString('en-US', {
			weekday: 'short',
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})}
	</div>
</header>
