export function parsePeriodDays(period: string | null): number {
  if (!period) return 30;
  const match = /^(\d+)d$/.exec(period);
  return match ? Number(match[1]) : 30;
}

export interface PeriodBounds {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
}

export function getPeriodBounds(days: number, now = new Date()): PeriodBounds {
  const end = now;
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const prevEnd = start;
  const prevStart = new Date(prevEnd.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end, prevStart, prevEnd };
}

export function pctDelta(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function hoursBetween(a: Date, b: Date): number {
  return (a.getTime() - b.getTime()) / (1000 * 60 * 60);
}
