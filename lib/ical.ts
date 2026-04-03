import { sanitizeString } from "@/utils/sanitize";
import type { ParsedDeadline } from "@/types/deadline";

const COURSE_CODE_PATTERN = /\b([A-Za-z]{2,6}\d{2,6}[A-Za-z]?)\b/;
const NON_COURSE_PREFIX_PATTERN =
  /^(assignment|practice|quiz|chapter|lab|task|project|homework|course)\b/i;

function parseCourseFromCategories(categoriesRaw?: string): string | undefined {
  if (!categoriesRaw) {
    return undefined;
  }

  const firstCategory = categoriesRaw
    .split(",")
    .map((item) => item.trim())
    .find((item) => item.length > 0);

  if (!firstCategory) {
    return undefined;
  }

  const codeMatch = firstCategory.match(COURSE_CODE_PATTERN);
  if (codeMatch?.[1]) {
    return sanitizeString(codeMatch[1].toUpperCase(), 120);
  }

  const withoutSection = firstCategory.split("(")[0]?.trim();
  if (!withoutSection) {
    return undefined;
  }

  return sanitizeString(withoutSection, 120);
}

function parseCourseFromSummary(summary: string): string | undefined {
  const trimmedSummary = summary.trim();
  if (!trimmedSummary) {
    return undefined;
  }

  const codeMatch = trimmedSummary.match(COURSE_CODE_PATTERN);
  if (codeMatch?.[1]) {
    return sanitizeString(codeMatch[1].toUpperCase(), 120);
  }

  const delimiters = [" - ", " | ", " : "];
  for (const delimiter of delimiters) {
    const parts = trimmedSummary.split(delimiter).map((part) => part.trim());
    const candidate = parts[0] ?? "";
    if (
      parts.length > 1 &&
      candidate.length > 0 &&
      !NON_COURSE_PREFIX_PATTERN.test(candidate)
    ) {
      return sanitizeString(candidate, 120);
    }
  }

  return undefined;
}

function extractCourse(summary: string, categoriesRaw?: string): string {
  const categoryCourse = parseCourseFromCategories(categoriesRaw);
  if (categoryCourse) {
    return categoryCourse;
  }

  const summaryCourse = parseCourseFromSummary(summary);
  if (summaryCourse) {
    return summaryCourse;
  }

  return "Uncategorized";
}

function unfoldICSLines(rawICS: string): string[] {
  const lines = rawICS.replace(/\r\n/g, "\n").split("\n");
  const unfolded: string[] = [];

  for (const line of lines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += line.slice(1);
      continue;
    }

    unfolded.push(line);
  }

  return unfolded;
}

function parseICSDate(value: string): Date | undefined {
  const cleaned = value.trim();

  if (/^\d{8}T\d{6}Z$/.test(cleaned)) {
    const year = Number(cleaned.slice(0, 4));
    const month = Number(cleaned.slice(4, 6)) - 1;
    const day = Number(cleaned.slice(6, 8));
    const hour = Number(cleaned.slice(9, 11));
    const minute = Number(cleaned.slice(11, 13));
    const second = Number(cleaned.slice(13, 15));
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }

  if (/^\d{8}T\d{6}$/.test(cleaned)) {
    const year = Number(cleaned.slice(0, 4));
    const month = Number(cleaned.slice(4, 6)) - 1;
    const day = Number(cleaned.slice(6, 8));
    const hour = Number(cleaned.slice(9, 11));
    const minute = Number(cleaned.slice(11, 13));
    const second = Number(cleaned.slice(13, 15));
    return new Date(year, month, day, hour, minute, second);
  }

  if (/^\d{8}$/.test(cleaned)) {
    const year = Number(cleaned.slice(0, 4));
    const month = Number(cleaned.slice(4, 6)) - 1;
    const day = Number(cleaned.slice(6, 8));
    return new Date(year, month, day);
  }

  const fallback = new Date(cleaned);
  if (Number.isFinite(fallback.getTime())) {
    return fallback;
  }

  return undefined;
}

function getRawValue(line: string): string {
  const separatorIndex = line.indexOf(":");
  if (separatorIndex < 0) {
    return "";
  }

  return line.slice(separatorIndex + 1).trim();
}

export function parseCalendarEvents(rawICS: string): ParsedDeadline[] {
  const lines = unfoldICSLines(rawICS);
  const events: ParsedDeadline[] = [];

  let currentEvent: {
    uid?: string;
    summary?: string;
    description?: string;
    categories?: string;
    dtStart?: Date;
    dtEnd?: Date;
  } | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      currentEvent = {};
      continue;
    }

    if (line === "END:VEVENT") {
      if (currentEvent) {
        const title = sanitizeString(currentEvent.summary ?? "Untitled deadline", 180);
        const description = currentEvent.description
          ? sanitizeString(currentEvent.description, 500)
          : undefined;
        const dueDate = currentEvent.dtEnd ?? currentEvent.dtStart;
        const parsedCourseCode = extractCourse(title, currentEvent.categories);

        if (dueDate && Number.isFinite(dueDate.getTime())) {
          const sourceEventId = sanitizeString(
            currentEvent.uid ?? `${title}-${dueDate.toISOString()}`,
            220
          );

          events.push({
            title,
            course: parsedCourseCode,
            courseCode: parsedCourseCode,
            description,
            dueDate,
            sourceEventId,
          });
        }
      }

      currentEvent = null;
      continue;
    }

    if (!currentEvent) {
      continue;
    }

    if (line.startsWith("UID")) {
      currentEvent.uid = getRawValue(line);
      continue;
    }

    if (line.startsWith("SUMMARY")) {
      currentEvent.summary = getRawValue(line);
      continue;
    }

    if (line.startsWith("DESCRIPTION")) {
      currentEvent.description = getRawValue(line).replace(/\\n/g, "\n");
      continue;
    }

    if (line.startsWith("CATEGORIES")) {
      currentEvent.categories = getRawValue(line);
      continue;
    }

    if (line.startsWith("DTSTART")) {
      currentEvent.dtStart = parseICSDate(getRawValue(line));
      continue;
    }

    if (line.startsWith("DTEND")) {
      currentEvent.dtEnd = parseICSDate(getRawValue(line));
    }
  }

  return events;
}
