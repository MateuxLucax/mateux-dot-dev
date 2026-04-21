<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Prompt from '$lib/components/Prompt.svelte';
	import Row from '$lib/components/Row.svelte';
	import { goto } from '$app/navigation';

	// --- Word bank ---
	const wordBank = [
		'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
		'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
		'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
		'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
		'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
		'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
		'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see',
		'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
		'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work',
		'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
		'give', 'day', 'most', 'us', 'great', 'between', 'need', 'large', 'must',
		'home', 'big', 'high', 'end', 'long', 'small', 'never', 'should', 'under',
		'world', 'school', 'still', 'last', 'every', 'own', 'right', 'while',
		'learn', 'thought', 'keep', 'point', 'hand', 'found', 'play', 'turn',
		'program', 'system', 'set', 'run', 'move', 'try', 'help', 'start', 'show',
		'part', 'place', 'problem', 'fact', 'group', 'side', 'head', 'life',
		'story', 'young', 'left', 'question', 'change', 'same', 'much', 'seem',
		'kind', 'mean', 'real', 'old', 'off', 'letter', 'number', 'water', 'write',
		'listen', 'read', 'port', 'stop', 'follow', 'few', 'began', 'might',
		'next', 'hard', 'open', 'example', 'begin', 'live', 'page', 'being',
		'study', 'develop', 'state', 'close', 'night', 'light', 'city', 'tree',
		'cross', 'farm', 'cover', 'food', 'sun', 'four', 'let', 'country',
		'eye', 'plan', 'face', 'cut', 'second', 'watch', 'walk', 'white',
		'sea', 'late', 'miss', 'car', 'river', 'call', 'door', 'name', 'class',
		'build', 'held', 'front', 'earth', 'father', 'stand', 'east', 'fire',
		'reach', 'land', 'red', 'list', 'air', 'line', 'rest', 'power',
		'music', 'went', 'area', 'rain', 'best', 'field', 'body', 'table',
		'dark', 'draw', 'voice', 'clear', 'fall', 'done', 'true', 'force',
		'love', 'rock', 'idea', 'fish', 'wait', 'strong', 'south', 'order'
	];

	// --- State ---
	type TestState = 'idle' | 'running' | 'finished';

	let testState: TestState = $state('idle');
	let duration: number = $state(30);
	let timeLeft: number = $state(30);
	let timer: ReturnType<typeof setInterval> | null = null;

	let words: string[] = $state([]);
	let currentWordIndex: number = $state(0);
	let currentInput: string = $state('');
	let inputElement: HTMLInputElement | null = $state(null);

	// Per-word tracking
	let wordStatuses: Array<'pending' | 'correct' | 'incorrect'> = $state([]);
	let typedWords: string[] = $state([]);

	// Per-character tracking for the current word
	let charStatuses: Array<'pending' | 'correct' | 'incorrect'> = $state([]);

	// Stats
	let correctWords: number = $state(0);
	let incorrectWords: number = $state(0);
	let totalKeystrokes: number = $state(0);
	let correctKeystrokes: number = $state(0);

	// Scroll tracking
	let wordsContainer: HTMLDivElement | null = $state(null);

	// Computed
	let wpm = $derived(
		testState === 'running'
			? Math.round(correctWords / ((duration - timeLeft) / 60) || 0)
			: testState === 'finished'
				? Math.round(correctWords / (duration / 60))
				: 0
	);

	let accuracy = $derived(
		totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100
	);

	let rawWpm = $derived(
		testState === 'finished'
			? Math.round((correctWords + incorrectWords) / (duration / 60))
			: 0
	);

	function generateWords(count: number): string[] {
		const result: string[] = [];
		for (let i = 0; i < count; i++) {
			result.push(wordBank[Math.floor(Math.random() * wordBank.length)]);
		}
		return result;
	}

	function initTest() {
		if (timer) clearInterval(timer);
		testState = 'idle';
		timeLeft = duration;
		words = generateWords(200);
		currentWordIndex = 0;
		currentInput = '';
		wordStatuses = words.map(() => 'pending');
		typedWords = [];
		charStatuses = [];
		correctWords = 0;
		incorrectWords = 0;
		totalKeystrokes = 0;
		correctKeystrokes = 0;
		focusInput();
	}

	function startTest() {
		testState = 'running';
		timeLeft = duration;
		timer = setInterval(() => {
			timeLeft--;
			if (timeLeft <= 0) {
				finishTest();
			}
		}, 1000);
	}

	function finishTest() {
		if (timer) clearInterval(timer);
		timer = null;
		testState = 'finished';
	}

	function updateCharStatuses() {
		const word = words[currentWordIndex];
		if (!word) return;
		charStatuses = [];
		for (let i = 0; i < Math.max(word.length, currentInput.length); i++) {
			if (i >= currentInput.length) {
				charStatuses.push('pending');
			} else if (i >= word.length) {
				charStatuses.push('incorrect');
			} else if (currentInput[i] === word[i]) {
				charStatuses.push('correct');
			} else {
				charStatuses.push('incorrect');
			}
		}
	}

	function scrollToCurrentWord() {
		if (!wordsContainer) return;
		const activeEl = wordsContainer.querySelector('[data-active]');
		if (activeEl) {
			const containerRect = wordsContainer.getBoundingClientRect();
			const wordRect = activeEl.getBoundingClientRect();
			if (wordRect.top > containerRect.top + containerRect.height * 0.6) {
				wordsContainer.scrollTop += wordRect.height + 8;
			}
		}
	}

	function handleInput() {
		if (testState === 'idle') {
			startTest();
		}
		updateCharStatuses();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (testState === 'finished') return;

		if (event.key === ' ' && currentInput.length > 0) {
			event.preventDefault();

			const word = words[currentWordIndex];
			const isCorrect = currentInput === word;

			totalKeystrokes++;
			if (isCorrect) {
				correctKeystrokes++;
			}

			if (isCorrect) {
				wordStatuses[currentWordIndex] = 'correct';
				correctWords++;
			} else {
				wordStatuses[currentWordIndex] = 'incorrect';
				incorrectWords++;
			}
			typedWords[currentWordIndex] = currentInput;

			currentWordIndex++;
			currentInput = '';
			charStatuses = [];

			if (currentWordIndex >= words.length - 20) {
				const newWords = generateWords(100);
				words = [...words, ...newWords];
				wordStatuses = [...wordStatuses, ...newWords.map(() => 'pending' as const)];
			}

			scrollToCurrentWord();
			return;
		}

		if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
			totalKeystrokes++;
			const word = words[currentWordIndex];
			const charIndex = currentInput.length;
			if (charIndex < word.length && event.key === word[charIndex]) {
				correctKeystrokes++;
			}
		}
	}

	function setDuration(d: number) {
		duration = d;
		initTest();
	}

	function focusInput() {
		setTimeout(() => inputElement?.focus(), 50);
	}

	function handleContainerClick() {
		focusInput();
	}

	onMount(() => {
		initTest();
	});

	onDestroy(() => {
		if (timer) clearInterval(timer);
	});
</script>

<svelte:head>
	<title>mateux@tars ~/TypeTest&gt;</title>
</svelte:head>

<!-- Navigate back -->
<Row>
	<Prompt path="/TypeTest" />
	<button
		onclick={() => goto('/')}
		class="cursor-pointer text-pink-400 underline underline-offset-2 hover:opacity-80 dark:text-pink-300"
	>
		cd ~
	</button>
</Row>

<!-- cat README -->
<Row>
	<Prompt path="/TypeTest" />
	<span class="text-blue-500 dark:text-blue-300">cat</span>
	<span class="text-pink-400 underline underline-offset-2 dark:text-pink-300">README.md</span>
</Row>
<Row>A WPM typing test. Type the words below as fast and accurately as you can.</Row>

<!-- Duration selector as a command -->
<Row>
	<Prompt path="/TypeTest" />
	<span class="text-blue-500 dark:text-blue-300">--duration</span>
	{#each [15, 30, 60] as d}
		<button
			onclick={() => setDuration(d)}
			disabled={testState === 'running'}
			class="cursor-pointer transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-40
				{duration === d
					? 'text-teal-600 underline underline-offset-2 dark:text-teal-300'
					: 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}"
		>
			{d}s
		</button>
	{/each}
</Row>

<!-- Status row: timer / hint -->
<Row>
	<Prompt path="/TypeTest" />
	{#if testState === 'running'}
		<span class="text-blue-500 dark:text-blue-300">time</span>
		<span class="tabular-nums text-teal-600 dark:text-teal-300">{timeLeft}s</span>
		<span class="text-gray-300 dark:text-gray-600">|</span>
		<span class="text-gray-500 dark:text-gray-400">wpm</span>
		<span class="tabular-nums text-yellow-500 dark:text-yellow-300">{wpm}</span>
		<span class="text-gray-300 dark:text-gray-600">|</span>
		<span class="text-gray-500 dark:text-gray-400">acc</span>
		<span class="tabular-nums text-yellow-500 dark:text-yellow-300">{accuracy}%</span>
	{:else if testState === 'idle'}
		<span class="text-gray-400 dark:text-gray-500"># start typing to begin the test</span>
	{:else}
		<span class="text-green-600 dark:text-green-400">✓ test complete</span>
	{/if}
</Row>

{#if testState !== 'finished'}
	<!-- Words display area -->
	<Row>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={wordsContainer}
			onclick={handleContainerClick}
			class="relative max-h-[5.4em] w-full cursor-text overflow-hidden leading-[1.8]"
		>
			<div class="flex flex-wrap gap-x-2 gap-y-0.5 text-lg">
				{#each words as word, wordIndex}
					{#if wordIndex < currentWordIndex + 80}
						<span
							class="relative tracking-wide transition-opacity duration-100"
							class:opacity-100={wordIndex === currentWordIndex}
						>
							{#if wordIndex === currentWordIndex}
								<!-- Active word: per-char coloring with inline cursor -->
								{#each word.split('') as char, charIndex}
									<span
										class="{charStatuses[charIndex] === 'correct'
											? 'text-green-600 dark:text-green-400'
											: charStatuses[charIndex] === 'incorrect'
												? 'text-red-500 dark:text-red-400'
												: 'text-gray-800 dark:text-gray-200'}
										{charIndex === currentInput.length ? 'cursor-char' : ''}"
									>{char}</span>
								{/each}
								<!-- Extra typed chars beyond word -->
								{#if currentInput.length > word.length}
									{#each currentInput.slice(word.length).split('') as extraChar}
										<span class="text-red-500/70 dark:text-red-400/70">{extraChar}</span>
									{/each}
								{/if}
								<!-- Cursor at end of word (when all chars typed or beyond) -->
								{#if currentInput.length >= word.length}
									<span class="cursor-end"></span>
								{/if}
							{:else if wordStatuses[wordIndex] === 'correct'}
								<span class="text-green-600 dark:text-green-400">{word}</span>
							{:else if wordStatuses[wordIndex] === 'incorrect'}
								<span class="text-red-500 underline underline-offset-2 dark:text-red-400">{word}</span>
							{:else}
								<span class="text-gray-400 dark:text-gray-500">{word}</span>
							{/if}
						</span>
					{/if}
				{/each}
			</div>

			<!-- Hidden input -->
			<input
				bind:this={inputElement}
				bind:value={currentInput}
				oninput={handleInput}
				onkeydown={handleKeyDown}
				type="text"
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
				spellcheck="false"
				class="absolute top-0 left-0 h-full w-full opacity-0"
			/>
		</div>
	</Row>
{:else}
	<!-- Results as stdout -->
	<Row>
		<Prompt path="/TypeTest" />
		<span class="text-blue-500 dark:text-blue-300">cat</span>
		<span class="text-pink-400 underline underline-offset-2 dark:text-pink-300">results.json</span>
	</Row>
	<Row>
		<pre class="w-full text-sm leading-relaxed"><!--
-->&#123;
  <span class="text-pink-400 dark:text-pink-300">"wpm"</span>:         <span class="text-teal-600 dark:text-teal-300">{wpm}</span>,
  <span class="text-pink-400 dark:text-pink-300">"accuracy"</span>:    <span class="text-teal-600 dark:text-teal-300">{accuracy}%</span>,
  <span class="text-pink-400 dark:text-pink-300">"raw_wpm"</span>:     <span class="text-teal-600 dark:text-teal-300">{rawWpm}</span>,
  <span class="text-pink-400 dark:text-pink-300">"correct"</span>:     <span class="text-green-600 dark:text-green-400">{correctWords}</span>,
  <span class="text-pink-400 dark:text-pink-300">"incorrect"</span>:   <span class="text-red-500 dark:text-red-400">{incorrectWords}</span>,
  <span class="text-pink-400 dark:text-pink-300">"total"</span>:       <span class="text-yellow-500 dark:text-yellow-300">{correctWords + incorrectWords}</span>,
  <span class="text-pink-400 dark:text-pink-300">"duration"</span>:    <span class="text-yellow-500 dark:text-yellow-300">{duration}s</span>,
  <span class="text-pink-400 dark:text-pink-300">"keystrokes"</span>:  <span class="text-yellow-500 dark:text-yellow-300">{totalKeystrokes}</span>
&#125;</pre>
	</Row>

	<!-- Restart command -->
	<Row>
		<Prompt path="/TypeTest" />
		<button
			onclick={initTest}
			class="cursor-pointer text-blue-500 underline underline-offset-2 hover:opacity-80 dark:text-blue-300"
		>
			./restart
		</button>
	</Row>
{/if}

<style>
	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}

	.cursor-char {
		border-left: 2px solid #0d9488;
		animation: blink 1s step-end infinite;
	}

	.cursor-end {
		border-right: 2px solid #0d9488;
		animation: blink 1s step-end infinite;
		margin-left: -1px;
	}

	@media (prefers-color-scheme: dark) {
		.cursor-char {
			border-left-color: #5eead4;
		}
		.cursor-end {
			border-right-color: #5eead4;
		}
	}
</style>
