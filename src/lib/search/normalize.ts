export function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase("uk-UA")
    .replace(/[ʼ’‘`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function isExactMccQuery(value: string): boolean {
  return /^\d{4}$/.test(normalizeSearchText(value));
}
