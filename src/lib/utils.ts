type DateStyle = Intl.DateTimeFormatOptions['dateStyle'];

export function formatDate(date: string, dateStyle: DateStyle = 'medium') {
	return new Date(date).toLocaleDateString('en-US', {
		dateStyle,
		timeZone: 'UTC'
	});
}

export function isDarkMode() {
	if (typeof window !== 'undefined') {
		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	return false;
}

export function calculateReadingTime(content: string): number {
	const wordsPerMinute = 200;
	const words = content.trim().split(/\s+/).length;
	return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function stripFrontmatter(content: string): string {
	if (content.startsWith('---')) {
		const end = content.indexOf('---', 3);
		if (end !== -1) {
			return content.slice(end + 3).trim();
		}
	}
	return content;
}
