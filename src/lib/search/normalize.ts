export function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase("uk-UA")
    .replace(/[ʼ’‘`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
