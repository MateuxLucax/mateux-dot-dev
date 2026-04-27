import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export type PostMeta = {
	title: string;
	slug: string;
	date: string;
	tags: string[];
	description: string;
	mermaidCount: number;
};

function parseFrontmatter(text: string): Record<string, unknown> {
	const match = text.match(/^---\s*\n([\s\S]*?)\n---/);
	if (!match) return {};

	const lines = match[1].split('\n');
	const result: Record<string, unknown> = {};

	for (const line of lines) {
		const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
		if (!kv) continue;

		const key = kv[1].trim();
		let value = kv[2].trim();

		// Strip surrounding quotes
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		if (value.startsWith('[') && value.endsWith(']')) {
			// Array
			const inner = value.slice(1, -1);
			result[key] = inner
				.split(',')
				.map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
				.filter(Boolean);
		} else {
			result[key] = value;
		}
	}

	return result;
}

export function getAllPosts(): PostMeta[] {
	const postsDir = join(process.cwd(), 'src', 'lib', 'posts');
	const files = readdirSync(postsDir).filter((f) => f.endsWith('.svx'));

	const posts: PostMeta[] = [];

	for (const file of files) {
		const content = readFileSync(join(postsDir, file), 'utf-8');
		const frontmatter = parseFrontmatter(content);
		const mermaidCount = (content.match(/<Mermaid/g) || []).length;

		posts.push({
			title: String(frontmatter.title || ''),
			slug: String(frontmatter.slug || file.replace('.svx', '')),
			date: String(frontmatter.date || ''),
			tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : [],
			description: String(frontmatter.description || ''),
			mermaidCount
		});
	}

	return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
