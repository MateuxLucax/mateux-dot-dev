# mateux.dev

![SvelteKit](https://img.shields.io/badge/sveltekit-%23ff3e00.svg?style=for-the-badge&logo=svelte&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2D6.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%232496ED.svg?style=for-the-badge&logo=docker&logoColor=white)

This repository contains the source code for [mateux.dev](https://mateux.dev), a personal website. 
My design goal was to replicate a terminal-like experience, I hope you enjoy it!

## Tools used to build this website:

This project was built using [SvelteKit](https://kit.svelte.dev), a framework for building web applications with Svelte.
It uses [Tailwind CSS](https://tailwindcss.com/) for styling and [Bun](https://bun.sh/) as the JavaScript runtime. The website is containerized using [Docker](https://www.docker.com/) for easy deployment.

## How to run the project locally

First, ensure you have [Bun](https://bun.sh/) installed. You can install it using the following command:

```bash
curl -fsSL https://bun.sh/install | bash
```

Then, clone the repository and navigate to the project directory:

```bash
git clone https://github.com/MateuxLucax/mateux-dot-dev.git && cd mateux-dot-dev
```

Next, install the dependencies using Bun:

```bash
bun install
```

Finally, start the development server:

```bash
bun run dev
```

Now, you can open your browser and navigate to `http://localhost:5173` to see the website in action.

## How to build the project

If you want to build the project for production, you can use the following command:

```bash
bun run build
```

This will create a `build` directory with the production-ready files.

## How to run the project in Docker

If you want to run the project in a Docker container, you can use the provided `Dockerfile`. First, make sure you have Docker installed on your machine. You can download it from [here](https://www.docker.com/get-started).
Then, navigate to the project directory and build the Docker image using the following command:

```bash
docker compose up -d
```

This will build the Docker image and start the container. You can then access the website at `http://localhost:3000`.

## License
This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.