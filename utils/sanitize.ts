import DOMPurify from "isomorphic-dompurify";

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

export function sanitizeString(value: string, maxLength = 500): string {
  return value
    .trim()
    .replace(/[${}()[\]]/g, "")
    .slice(0, maxLength);
}
