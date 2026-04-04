export function sanitizeHTML(dirty: string): string {
  return dirty.replace(/<[^>]*>/g, "").trim();
}

export function sanitizeString(input: string, maxLength: number = 500): string {
  return input
    .trim()
    .replace(/[${}()[\]]/g, "")
    .slice(0, maxLength);
}
