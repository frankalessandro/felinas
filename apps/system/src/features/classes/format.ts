/** `HH:mm[:ss]` de Postgres → `6:00 p. m.` */
export function formatTime(time: string): string {
  const [hourText = '0', minuteText = '00'] = time.split(':')
  const hour = Number(hourText)
  const suffix = hour >= 12 ? 'p. m.' : 'a. m.'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${minuteText.padStart(2, '0')} ${suffix}`
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}
