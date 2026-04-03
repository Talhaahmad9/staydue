import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";

const COURSE_CODE_PATTERN = /^[A-Z]{2,6}[0-9]{2,6}[A-Z]?$/;

function normalizeCourseCode(code) {
  return String(code).toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
}

function assertEnv() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }
}

function getDatabaseNameFromUri(rawUri) {
  const parsed = new URL(rawUri);
  const dbName = parsed.pathname.replace(/^\//, "").trim();

  if (!dbName) {
    throw new Error(
      "MONGODB_URI must include an explicit database name, for example ...mongodb.net/staydue?..."
    );
  }

  if (dbName.toLowerCase() === "test") {
    throw new Error(
      "Refusing to upload into the default 'test' database. Set MONGODB_URI to your app DB, for example ...mongodb.net/staydue?..."
    );
  }

  return dbName;
}

async function loadCatalogFiles(catalogDir) {
  const fileNames = await readdir(catalogDir);
  const targets = fileNames.filter((name) => /^courses-\d{4}-\d{4}\.json$/.test(name)).sort();

  if (targets.length === 0) {
    throw new Error("No catalog-data files found. Expected courses-YYYY-YYYY.json files.");
  }

  return targets;
}

function buildCourseEntries(rawCourses, fileName) {
  if (!rawCourses || typeof rawCourses !== "object" || Array.isArray(rawCourses)) {
    throw new Error(`Invalid courses object in ${fileName}.`);
  }

  const entries = [];
  for (const [rawCode, rawTitle] of Object.entries(rawCourses)) {
    const code = normalizeCourseCode(rawCode);
    const title = String(rawTitle ?? "").trim();

    if (!COURSE_CODE_PATTERN.test(code)) {
      continue;
    }

    if (title.length < 2) {
      continue;
    }

    entries.push({ code, title });
  }

  return entries;
}

async function main() {
  assertEnv();
  const databaseName = getDatabaseNameFromUri(process.env.MONGODB_URI);

  const rootDir = process.cwd();
  const catalogDir = path.join(rootDir, "catalog-data");
  const fileNames = await loadCatalogFiles(catalogDir);

  await mongoose.connect(process.env.MONGODB_URI, { dbName: databaseName });

  const collection = mongoose.connection.collection("coursecatalogs");

  for (const fileName of fileNames) {
    const absolutePath = path.join(catalogDir, fileName);
    const raw = await readFile(absolutePath, "utf8");
    const parsed = JSON.parse(raw);

    const catalogYear = String(parsed.catalog_year ?? "").trim();
    if (!/^\d{4}-\d{4}$/.test(catalogYear)) {
      throw new Error(`Invalid catalog_year in ${fileName}.`);
    }

    const courses = buildCourseEntries(parsed.courses, fileName);
    if (courses.length === 0) {
      throw new Error(`No valid courses parsed in ${fileName}.`);
    }

    await collection.updateOne(
      { catalogYear },
      {
        $set: {
          catalogYear,
          courses,
          version: "1.0.0",
          generatedAt: new Date(),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`Upserted ${catalogYear}: ${courses.length} courses`);
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("[catalog-upload]", error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect failures during error exit
  }
  process.exit(1);
});
