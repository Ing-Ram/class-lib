import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { pool } from "../src/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readJson(relPathFromRepoRoot) {
  // scripts/ -> server/ -> class-lib/ (repo root)
  const repoRoot = path.resolve(__dirname, "..", "..");
  const p = path.join(repoRoot, relPathFromRepoRoot);
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw);
}

async function run() {
  const studentsMap = await readJson("src/data/students.json");
  const books = await readJson("src/data/books.json");

  // Make sure schema exists; easiest is to have the user run schema.sql once.
  // We still try to create tables if they already exist via the SQL file (optional).
  // (We don't auto-run schema.sql here because some MySQL installs disallow multi statements.)

  // Students: upsert all from map
  for (const [name, classId] of Object.entries(studentsMap || {})) {
    await pool.query(
      `
      INSERT INTO students (name, class_id)
      VALUES (:name, :classId)
      ON DUPLICATE KEY UPDATE class_id = VALUES(class_id)
      `,
      { name, classId }
    );
  }

  // Books: insert/update by fixed id
  for (const b of books || []) {
    let studentId = null;
    if (b.isCheckedOut && b.studentName) {
      // Ensure student exists (if books.json references a name not in students.json)
      await pool.query(
        `
        INSERT INTO students (name)
        VALUES (:name)
        ON DUPLICATE KEY UPDATE name = name
        `,
        { name: b.studentName }
      );
      const [[s]] = await pool.query(`SELECT id FROM students WHERE name = :name`, {
        name: b.studentName
      });
      studentId = s?.id ?? null;
    }

    await pool.query(
      `
      INSERT INTO books
        (id, title, author, isbn, genre, is_checked_out, checked_out_by_student_id, checked_out_at, checked_in_at)
      VALUES
        (:id, :title, :author, :isbn, :genre, :isCheckedOut, :studentId, NULL, NULL)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        author = VALUES(author),
        isbn = VALUES(isbn),
        genre = VALUES(genre),
        is_checked_out = VALUES(is_checked_out),
        checked_out_by_student_id = VALUES(checked_out_by_student_id),
        checked_out_at = VALUES(checked_out_at),
        checked_in_at = VALUES(checked_in_at)
      `,
      {
        id: b.id,
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        genre: b.genre,
        isCheckedOut: b.isCheckedOut ? 1 : 0,
        studentId
      }
    );
  }

  console.log("Seed complete.");
  await pool.end();
}

run().catch(async (e) => {
  console.error(e);
  try {
    await pool.end();
  } catch {
    // ignore
  }
  process.exit(1);
});

