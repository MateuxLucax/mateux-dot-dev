type DateStyle = Intl.DateTimeFormatOptions['dateStyle']

export function formatDate(date: string, dateStyle: DateStyle = 'medium') {
  return new Date(date).toLocaleDateString('en-US', {
    dateStyle,
    timeZone: 'UTC',
  });
}

export function isDarkMode() {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  return false;
}