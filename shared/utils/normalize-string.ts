export function normalizeForSearch(input: string): string {
  if (!input) return input;
  return input
    .normalize('NFKD')
    .replace(/\u0300-\u036f/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export default normalizeForSearch;
