<script>
	import Me from '$lib/images/profile/me.webp';
	import Me_fallback from '$lib/images/profile/me.png';
</script>

<svelte:head>
	<title>MateuxLucax</title>
	<meta name="description" content="MateuxLucax's lading page" />
</svelte:head>

<section>
	<picture>
		<source srcset={Me} type="image/webp" />
		<img src={Me_fallback} alt="Mateus Lucas" />
	</picture>

	<h1>Hi there, I'm Mateus Lucas</h1>

	<p>
		I'm a mobile developer (and fullstack, but my passion is Mobile Development 🤓), based in
		Brazil. I am driven by building great user experiences as if I was the target user who really
		enjoys a beautifully crafted experience.
	</p>

	<ul class="profile-links">
		<li>
			<a href="https://www.linkedin.com/in/mateusbrandt/" target="_blank">
				<svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M29.71 0H2.28A2.3 2.3 0 0 0 0 2.3v27.4A2.3 2.3 0 0 0 2.28 32H29.7a2.3 2.3 0 0 0 2.3-2.3V2.3A2.3 2.3 0 0 0 29.71 0ZM9.67 27.43H4.93V12.16h4.75v15.27ZM7.3 10.07a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Zm20.15 17.36h-4.74V20c0-1.77-.04-4.05-2.47-4.05-2.47 0-2.85 1.93-2.85 3.92v7.56h-4.74V12.16h4.55v2.08h.06a5 5 0 0 1 4.5-2.46c4.8 0 5.69 3.16 5.69 7.28v8.37Z"
						fill="#241874"
					/>
				</svg>
				<span>Linkedin</span>
			</a>
		</li>
		<li>
			<a href="https://github.com/mateuxlucax" target="_blank">
				<svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M10.7 25.8c0 .1-.1.2-.3.2-.2 0-.4 0-.4-.2s.2-.3.3-.3c.2 0 .4.1.4.3Zm-2-.3c0 .1 0 .3.3.3l.4-.1c0-.2-.1-.3-.3-.4-.2 0-.4 0-.4.2Zm2.8-.1c-.1 0-.3.1-.2.3 0 .1.1.2.3.2.2 0 .3-.2.3-.4 0 0-.2-.2-.4-.1ZM15.8 0C6.8 0 0 7 0 16.1 0 23.5 4.5 29.8 11 32c.8.1 1-.4 1-.8v-4s-4.5.9-5.4-2c0 0-.8-2-1.8-2.5 0 0-1.5-1 0-1 0 0 1.7.1 2.6 1.7C8.8 26 11 25.2 12 24.8c.1-1 .5-1.8 1-2.2-3.6-.5-7.2-1-7.2-7.4a5 5 0 0 1 1.5-3.9c-.2-.4-.7-2.2.1-4.4C9 6.4 12 8.6 12 8.6a14.8 14.8 0 0 1 8.1 0s3.1-2.2 4.5-1.7c.8 2.3.3 4 .1 4.4 1 1.2 1.7 2.1 1.7 4 0 6.3-3.8 6.8-7.4 7.3.6.5 1 1.5 1 3v5.6c0 .4.4 1 1.2.8A16.4 16.4 0 0 0 32 16 16 16 0 0 0 15.8 0ZM6.3 22.8c-.1 0 0 .2 0 .4.1 0 .3.1.4 0V23c-.2-.1-.3-.2-.4 0Zm-.7-.5.1.2H6l-.1-.3h-.3Zm2 2.3.1.5h.5l-.1-.4c-.2-.1-.4-.2-.4 0Zm-.7-1v.5c.1.1.3.2.4.1v-.4c-.1-.2-.3-.2-.4-.1Z"
						fill="#241874"
					/>
				</svg>
				<span>GitHub</span>
			</a>
		</li>
		<li>
			<a href="https://www.instagram.com/mateuxlucax/" target="_blank">
				<svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M16.004 7.796A8.19 8.19 0 0 0 7.8 16a8.19 8.19 0 0 0 8.203 8.204A8.19 8.19 0 0 0 24.206 16a8.19 8.19 0 0 0-8.202-8.204Zm0 13.538A5.343 5.343 0 0 1 10.67 16a5.338 5.338 0 0 1 5.333-5.334A5.338 5.338 0 0 1 21.336 16a5.343 5.343 0 0 1-5.332 5.334ZM26.454 7.46a1.909 1.909 0 0 1-1.912 1.914 1.914 1.914 0 1 1 1.913-1.914Zm5.434 1.942c-.122-2.563-.707-4.834-2.585-6.705C27.433.827 25.163.241 22.6.112c-2.642-.15-10.559-.15-13.2 0C6.844.234 4.574.82 2.697 2.69.819 4.561.24 6.832.112 9.395c-.15 2.642-.15 10.56 0 13.203.122 2.563.707 4.834 2.585 6.705 1.877 1.87 4.14 2.456 6.703 2.584 2.641.15 10.559.15 13.2 0 2.563-.12 4.833-.706 6.703-2.584 1.87-1.871 2.456-4.142 2.585-6.705.15-2.642.15-10.554 0-13.196Zm-3.413 16.03a5.4 5.4 0 0 1-3.041 3.042c-2.106.836-7.103.643-9.43.643-2.328 0-7.332.186-9.43-.643a5.4 5.4 0 0 1-3.042-3.041c-.835-2.107-.643-7.105-.643-9.433 0-2.328-.185-7.333.643-9.433a5.4 5.4 0 0 1 3.041-3.041c2.106-.836 7.103-.643 9.43-.643 2.328 0 7.332-.186 9.431.643a5.4 5.4 0 0 1 3.041 3.041c.835 2.107.643 7.105.643 9.433 0 2.328.192 7.333-.643 9.433Z"
						fill="#241874"
					/>
				</svg>
				<span>Instagram</span>
			</a>
		</li>
		<li>
			<a href="https://twitter.com/mateuxlucax/" target="_blank">
				<svg width="32" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M28.71 6.48c.02.28.02.57.02.85 0 8.68-6.6 18.67-18.66 18.67C6.36 26 2.9 24.92 0 23.05a13.56 13.56 0 0 0 9.73-2.72 6.57 6.57 0 0 1-6.14-4.55 6.93 6.93 0 0 0 2.96-.12c-3-.6-5.25-3.25-5.25-6.44v-.08c.87.49 1.89.8 2.96.83A6.56 6.56 0 0 1 2.23 1.2a18.64 18.64 0 0 0 13.53 6.86 6.56 6.56 0 0 1 11.19-6A12.9 12.9 0 0 0 31.1.5a6.54 6.54 0 0 1-2.89 3.61c1.32-.14 2.6-.5 3.78-1.01a14.1 14.1 0 0 1-3.29 3.39Z"
						fill="#241874"
					/>
				</svg>
				<span>Twitter</span>
			</a>
		</li>
		<li>
			<a href="mailto:mateuxlucax@gmail.com">
				<svg width="32" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M29 0a3 3 0 0 1 1.8 5.4L17.2 15.6a2 2 0 0 1-2.4 0L1.2 5.4A3 3 0 0 1 3 0h26ZM13.6 17.2a4 4 0 0 0 4.8 0L32 7v13a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V7l13.6 10.2Z"
						fill="#241874"
					/>
				</svg>
				<span>Email</span>
			</a>
		</li>
	</ul>
</section>

<style>
	picture {
		border-radius: 0.4rem;
		height: 19.2rem;
		width: 19.2rem;
		overflow: hidden;
	}

	picture img,
	picture source {
		height: 100%;
		width: 100%;
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
		padding-left: 0;
	}

	ul li {
		list-style: none;
	}

	ul li a {
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		border: 0.2rem solid var(--color-theme-1);
		border-radius: 0.4rem;
		gap: 0.8rem;
		padding: 0.8rem 6.4rem;
		transition: all ease 0.2s;
	}

	ul li a:hover {
		opacity: 0.7;
	}


	@media (min-width: 480px) {
		ul li a {
			padding: 0.8rem 9.6rem;
		}
	}
</style>
