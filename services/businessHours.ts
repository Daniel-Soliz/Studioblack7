export type WeekWindows = Record<string, { start: string; end: string; closed?: boolean }[]>;
export function describeHours(windows: WeekWindows[string] = []) {
  const open = windows.filter(w => !w.closed).sort((a,b) => a.start.localeCompare(b.start));
  const merged: { start: string; end: string }[] = [];
  for (const window of open) { const last = merged[merged.length-1]; if (last?.end === window.start) last.end=window.end; else merged.push({ start:window.start,end:window.end }); }
  return merged.length ? merged.map(w => `${w.start.replace(':','h')}–${w.end.replace(':','h')}`).join(' e ') : 'Fechado';
}
