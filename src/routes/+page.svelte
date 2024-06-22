<svelte:head>
	<title>MateuxLucax</title>
	<meta name="description" content="MateuxLucax's lading page" />
</svelte:head>

<section>
	<picture>
		<enhanced:img src="$lib/images/profile/me.png" alt="Mateus Lucas" />
	</picture>

	<h1>Hi there, I'm Mateus Lucas</h1>

	<p>
		I'm a Software Engineer (with a passion for problem-solving 🤓) based in Brazil. My drive is to build great user experiences as if I were the target user who really enjoys a beautifully crafted experience.
	</p>

	<ul class="profile-links">
		<li>
			<a href="https://www.linkedin.com/in/mateusbrandt/" target="_blank">
				<svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M29.71 0H2.28A2.3 2.3 0 0 0 0 2.3v27.4A2.3 2.3 0 0 0 2.28 32H29.7a2.3 2.3 0 0 0 2.3-2.3V2.3A2.3 2.3 0 0 0 29.71 0ZM9.67 27.43H4.93V12.16h4.75v15.27ZM7.3 10.07a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Zm20.15 17.36h-4.74V20c0-1.77-.04-4.05-2.47-4.05-2.47 0-2.85 1.93-2.85 3.92v7.56h-4.74V12.16h4.55v2.08h.06a5 5 0 0 1 4.5-2.46c4.8 0 5.69 3.16 5.69 7.28v8.37Z"
						fill="var(--color-theme-1)"
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
						fill="var(--color-theme-1)"
					/>
				</svg>
				<span>GitHub</span>
			</a>
		</li>
		<li>
			<a href="mailto:mateuxlucax@gmail.com">
				<svg width="32" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M29 0a3 3 0 0 1 1.8 5.4L17.2 15.6a2 2 0 0 1-2.4 0L1.2 5.4A3 3 0 0 1 3 0h26ZM13.6 17.2a4 4 0 0 0 4.8 0L32 7v13a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V7l13.6 10.2Z"
						fill="var(--color-theme-1)"
					/>
				</svg>
				<span>Email</span>
			</a>
		</li>
	</ul>
</section>

<style>
	picture {
		border-radius: var(--border-radius-default);
		height: 19.2rem;
		width: 19.2rem;
		overflow: hidden;
	}

	picture img,
	picture source {
		height: 100%;
		width: 100%;
		background-color: #ccd0da;
	}

	@media (prefers-color-scheme: dark) {
		picture img, picture source {
			background-color: #313244;
		}
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1.2rem;
		flex: 0.6;
	}

	@media (min-width: 480px) {
		section {
			gap: 2.4rem;
		}
	}

	h1, p {
		width: 100%;
		margin: 0;
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
		padding-left: 0;
		margin: 0;
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
		border-radius: var(--border-radius-default);
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
