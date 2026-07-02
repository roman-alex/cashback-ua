export function getPeriodKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function formatUkrainianMonth(date: Date): string {
  return new Intl.DateTimeFormat("uk-UA", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatUkrainianPeriod(period: string): string {
  const [year, month] = period.split("-").map(Number);

  return formatUkrainianMonth(new Date(year, month - 1, 1));
}

export function getCurrentPeriodKey(): string {
  return getPeriodKey(new Date());
}
