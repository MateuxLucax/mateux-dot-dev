<script>
	import '../app.css';
	import TerminalHeader from '../components/TerminalHeader.svelte';
	import ActivityBar from '../components/ActivityBar.svelte';

	let { children } = $props();
</script>

<ActivityBar />

<main
  class="min-h-screen bg-base text-text font-mono flex xl:items-center xl:justify-center"
>
	<enhanced:img
		src="/static/background.jpg" 
		alt="Forest with enormeous trees"
		class="fixed inset-0 -z-10 w-full h-full object-cover"
	/>
	<section
		class="xl:relative max-w-7xl xl:max-w-4xl shadow-md border-2xl xl:rounded-xl overflow-hidden"
	>
		<TerminalHeader />
		<section class="p-4 xl:p-8 bg-white h-full">
			{@render children()}
		</section>
	</section>
</main>
