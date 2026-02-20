import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { pool } from "./db.js";

dotenv.config();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB

const app = express();
app.use(express.json());
app.use(cors());

app.get("/api/health", async (_req, res) => {
  const [[row]] = await pool.query("SELECT 1 AS ok");
  res.json({ ok: row.ok === 1 });
});

app.get("/api/books", async (_req, res) => {
  const [rows] = await pool.query(
    `
    SELECT
      b.id,
      b.title,
      b.author,
      b.isbn,
      b.genre,
      (b.is_checked_out = 1) AS isCheckedOut,
      COALESCE(s.name, '') AS studentName,
      b.checked_out_at AS checkedOutAt,
      b.checked_in_at AS checkedInAt
    FROM books b
    LEFT JOIN students s ON s.id = b.checked_out_by_student_id
    ORDER BY b.id ASC
    `
  );
  res.json(rows);
});

// Returns the exact structure your UI expects:
// [{ name, classId, books: [...], history: [...] }]
app.get("/api/students", async (_req, res) => {
  const [students] = await pool.query(
    `
    SELECT id, name, class_id AS classId
    FROM students
    ORDER BY name ASC
    `
  );

  const [books] = await pool.query(
    `
    SELECT
      b.id,
      b.title,
      b.author,
      b.isbn,
      b.genre,
      (b.is_checked_out = 1) AS isCheckedOut,
      b.checked_out_at AS checkedOutAt,
      b.checked_in_at AS checkedInAt,
      b.checked_out_by_student_id AS studentId
    FROM books b
    WHERE b.is_checked_out = 1 AND b.checked_out_by_student_id IS NOT NULL
    `
  );

  const [history] = await pool.query(
    `
    SELECT
      h.student_id AS studentId,
      h.book_id AS bookId,
      b.title,
      b.isbn,
      h.checked_out_at AS checkedOutAt,
      h.checked_in_at AS checkedInAt,
      h.duration_ms AS durationMs
    FROM checkout_history h
    JOIN books b ON b.id = h.book_id
    ORDER BY COALESCE(h.checked_in_at, h.checked_out_at) DESC, h.id DESC
    `
  );

  const booksByStudentId = new Map();
  for (const b of books) {
    const arr = booksByStudentId.get(b.studentId) || [];
    arr.push({
      id: b.id,
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      genre: b.genre,
      isCheckedOut: Boolean(b.isCheckedOut),
      checkedOutAt: b.checkedOutAt,
      checkedInAt: b.checkedInAt
    });
    booksByStudentId.set(b.studentId, arr);
  }

  const historyByStudentId = new Map();
  for (const h of history) {
    const arr = historyByStudentId.get(h.studentId) || [];
    arr.push({
      bookId: h.bookId,
      title: h.title,
      isbn: h.isbn,
      checkedOutAt: h.checkedOutAt,
      checkedInAt: h.checkedInAt,
      durationMs: h.durationMs
    });
    historyByStudentId.set(h.studentId, arr);
  }

  const payload = students.map((s) => ({
    name: s.name,
    classId: s.classId,
    books: booksByStudentId.get(s.id) || [],
    history: historyByStudentId.get(s.id) || []
  }));

  res.json(payload);
});

// Seed books or students from CSV. Form: csv (file), type (optional: "books" | "students", default "books")
// Books CSV: id (optional), title, author, isbn, genre. Students CSV: name, class_id (optional).
app.post("/api/seed/csv", upload.single("csv"), async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: "No CSV file uploaded. Use field name 'csv'." });
  }
  const type = (req.body?.type || "books").toLowerCase();
  if (type !== "books" && type !== "students") {
    return res.status(400).json({ error: "type must be 'books' or 'students'." });
  }
  let rows;
  try {
    const text = req.file.buffer.toString("utf8");
    rows = parse(text, { columns: true, skip_empty_lines: true, trim: true });
  } catch (e) {
    return res.status(400).json({ error: `Invalid CSV: ${e?.message || e}` });
  }
  const errors = [];
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    if (type === "students") {
      let inserted = 0;
      let updated = 0;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const name = row.name?.trim();
        if (!name) {
          errors.push({ row: i + 2, message: "name is required" });
          continue;
        }
        const classId = (row.class_id != null && row.class_id !== "" ? String(row.class_id).trim() : null) || null;
        try {
          const [result] = await conn.query(
            `
            INSERT INTO students (name, class_id)
            VALUES (:name, :classId)
            ON DUPLICATE KEY UPDATE class_id = COALESCE(VALUES(class_id), class_id)
            `,
            { name, classId }
          );
          if (result.affectedRows === 1) inserted++;
          else if (result.affectedRows === 2) updated++;
        } catch (err) {
          errors.push({ row: i + 2, message: err?.message || String(err) });
        }
      }
      await conn.commit();
      return res.json({ ok: true, type: "students", inserted, updated, errors });
    }
    // type === "books"
    let nextId = null;
    if (rows.length > 0 && (rows[0].id === undefined || rows[0].id === "")) {
      const [[r]] = await conn.query("SELECT COALESCE(MAX(id), 0) + 1 AS next FROM books");
      nextId = r?.next ?? 1;
    }
    let inserted = 0;
    let updated = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const title = row.title?.trim();
      const author = row.author?.trim();
      if (!title || !author) {
        errors.push({ row: i + 2, message: "title and author are required" });
        continue;
      }
      let id = row.id != null && row.id !== "" ? Number(row.id) : null;
      if (id == null || Number.isNaN(id)) {
        id = nextId++;
      }
      const isbn = (row.isbn != null && row.isbn !== "" ? String(row.isbn).trim() : null) || null;
      const genre = (row.genre != null && row.genre !== "" ? String(row.genre).trim() : null) || null;
      try {
        const [result] = await conn.query(
          `
          INSERT INTO books (id, title, author, isbn, genre, is_checked_out, checked_out_by_student_id, checked_out_at, checked_in_at)
          VALUES (:id, :title, :author, :isbn, :genre, 0, NULL, NULL, NULL)
          ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            author = VALUES(author),
            isbn = VALUES(isbn),
            genre = VALUES(genre)
          `,
          { id, title, author, isbn, genre }
        );
        if (result.affectedRows === 1) inserted++;
        else if (result.affectedRows === 2) updated++;
      } catch (err) {
        errors.push({ row: i + 2, message: err?.message || String(err) });
      }
    }
    await conn.commit();
    res.json({ ok: true, type: "books", inserted, updated, errors });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: String(e?.message || e) });
  } finally {
    conn.release();
  }
});

app.post("/api/books/:id/checkout", async (req, res) => {
  const bookId = Number(req.params.id);
  const { studentName, classId } = req.body || {};

  if (!bookId || Number.isNaN(bookId)) {
    return res.status(400).json({ error: "Invalid book id" });
  }
  if (!studentName || typeof studentName !== "string") {
    return res.status(400).json({ error: "studentName is required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ensure student exists (and update classId if provided)
    await conn.query(
      `
      INSERT INTO students (name, class_id)
      VALUES (:name, :classId)
      ON DUPLICATE KEY UPDATE
        class_id = COALESCE(VALUES(class_id), class_id)
      `,
      { name: studentName, classId: classId || null }
    );

    const [[student]] = await conn.query(
      `SELECT id, name, class_id AS classId FROM students WHERE name = :name`,
      { name: studentName }
    );

    // lock book row
    const [[book]] = await conn.query(
      `SELECT * FROM books WHERE id = :id FOR UPDATE`,
      { id: bookId }
    );
    if (!book) {
      await conn.rollback();
      return res.status(404).json({ error: "Book not found" });
    }
    if (book.is_checked_out === 1) {
      await conn.rollback();
      return res.status(409).json({ error: "Book is already checked out" });
    }

    const now = new Date();
    await conn.query(
      `
      UPDATE books
      SET
        is_checked_out = 1,
        checked_out_by_student_id = :studentId,
        checked_out_at = :now,
        checked_in_at = NULL
      WHERE id = :id
      `,
      { id: bookId, studentId: student.id, now }
    );

    await conn.commit();

    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: String(e?.message || e) });
  } finally {
    conn.release();
  }
});

app.post("/api/books/:id/return", async (req, res) => {
  const bookId = Number(req.params.id);

  if (!bookId || Number.isNaN(bookId)) {
    return res.status(400).json({ error: "Invalid book id" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[book]] = await conn.query(
      `SELECT * FROM books WHERE id = :id FOR UPDATE`,
      { id: bookId }
    );
    if (!book) {
      await conn.rollback();
      return res.status(404).json({ error: "Book not found" });
    }
    if (book.is_checked_out !== 1 || !book.checked_out_by_student_id) {
      await conn.rollback();
      return res.status(409).json({ error: "Book is not checked out" });
    }

    const now = new Date();
    const checkedOutAt = book.checked_out_at ? new Date(book.checked_out_at) : null;
    const durationMs =
      checkedOutAt && !Number.isNaN(checkedOutAt.getTime())
        ? now.getTime() - checkedOutAt.getTime()
        : null;

    await conn.query(
      `
      INSERT INTO checkout_history
        (student_id, book_id, checked_out_at, checked_in_at, duration_ms)
      VALUES
        (:studentId, :bookId, :checkedOutAt, :checkedInAt, :durationMs)
      `,
      {
        studentId: book.checked_out_by_student_id,
        bookId,
        checkedOutAt: book.checked_out_at,
        checkedInAt: now,
        durationMs
      }
    );

    await conn.query(
      `
      UPDATE books
      SET
        is_checked_out = 0,
        checked_out_by_student_id = NULL,
        checked_in_at = :now
      WHERE id = :id
      `,
      { id: bookId, now }
    );

    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: String(e?.message || e) });
  } finally {
    conn.release();
  }
});

// Test database connection on startup
pool.query("SELECT 1")
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("Database connected successfully");
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Database connection failed:", err.message);
    // eslint-disable-next-line no-console
    console.error("Make sure:");
    // eslint-disable-next-line no-console
    console.error("  1. MySQL is running");
    // eslint-disable-next-line no-console
    console.error("  2. Database 'class_lib' exists (run schema.sql)");
    // eslint-disable-next-line no-console
    console.error("  3. server/.env has correct credentials");
    process.exit(1);
  });

const port = Number(process.env.PORT || 5174);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

