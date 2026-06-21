import type { BusinessHours } from '@/types/agent';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export function isWithinBusinessHours(hours: BusinessHours | null | undefined, timezone: string): boolean {
  if (!hours) return true;

  const local = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  const day = DAYS[local.getDay()];
  const schedule = hours[day];

  if (!schedule?.open || !schedule.from || !schedule.to) return false;

  const [fh, fm] = schedule.from.split(':').map(Number);
  const [th, tm] = schedule.to.split(':').map(Number);
  const now = local.getHours() * 60 + local.getMinutes();

  return now >= fh * 60 + fm && now < th * 60 + tm;
}

export function nextOpenTime(hours: BusinessHours, timezone: string): string | null {
  const local = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  for (let i = 0; i < 7; i++) {
    const dayIdx = (local.getDay() + i) % 7;
    const day = DAYS[dayIdx];
    const s = hours[day];
    if (s?.open && s.from) {
      const label = i === 0 ? 'hoy' : i === 1 ? 'mañana' : day;
      return `${label} a las ${s.from}`;
    }
  }
  return null;
}
