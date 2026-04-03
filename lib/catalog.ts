import { CourseCatalogModel, connectToDatabase } from "@/lib/mongodb";
import { sanitizeString } from "@/utils/sanitize";

const catalogCache = new Map<string, Map<string, string>>();

export function normalizeCourseCode(rawCode: string): string {
  const upper = rawCode.toUpperCase();
  const normalized = upper.replace(/[^A-Z0-9]/g, "");
  return sanitizeString(normalized, 32);
}

export async function getAvailableCatalogYears(): Promise<string[]> {
  await connectToDatabase();
  const documents = await CourseCatalogModel.find({}, { catalogYear: 1, _id: 0 })
    .sort({ catalogYear: 1 })
    .lean();

  return documents.map((document) => document.catalogYear);
}

export async function getCatalogMapByYear(catalogYear: string): Promise<Map<string, string>> {
  if (catalogCache.has(catalogYear)) {
    return catalogCache.get(catalogYear) ?? new Map<string, string>();
  }

  await connectToDatabase();
  const catalog = await CourseCatalogModel.findOne({ catalogYear }).lean();

  if (!catalog) {
    return new Map<string, string>();
  }

  const resolvedMap = new Map<string, string>();

  for (const course of catalog.courses) {
    const code = normalizeCourseCode(course.code);
    if (code.length === 0) {
      continue;
    }

    resolvedMap.set(code, sanitizeString(course.title, 180));
  }

  catalogCache.set(catalogYear, resolvedMap);
  return resolvedMap;
}

export function clearCatalogCache(catalogYear?: string): void {
  if (catalogYear) {
    catalogCache.delete(catalogYear);
    return;
  }

  catalogCache.clear();
}
