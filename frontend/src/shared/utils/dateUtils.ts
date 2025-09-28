export function getTodayDateString(): string {
  const now = new Date()
  return now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-')
}