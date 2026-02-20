async function jsonFetch(url, options) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return res.json();
}

export function getBooks() {
  return jsonFetch("/api/books");
}

export function getStudents() {
  return jsonFetch("/api/students");
}

export function checkoutBook(bookId, { studentName, classId }) {
  return jsonFetch(`/api/books/${bookId}/checkout`, {
    method: "POST",
    body: JSON.stringify({ studentName, classId })
  });
}

export function returnBook(bookId) {
  return jsonFetch(`/api/books/${bookId}/return`, {
    method: "POST"
  });
}

/**
 * Seed the database from a CSV file.
 * @param {File} file - CSV file (e.g. from <input type="file" accept=".csv" />)
 * @param {"books"|"students"} type - Which table to seed. Books: title, author, optionally id, isbn, genre. Students: name, optionally class_id.
 * @returns {Promise<{ ok: boolean, type: string, inserted: number, updated: number, errors: Array }>}
 */
export async function seedFromCsv(file, type = "books") {
  const formData = new FormData();
  formData.append("csv", file);
  formData.append("type", type);
  const res = await fetch("/api/seed/csv", {
    method: "POST",
    body: formData
  });
  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return res.json();
}

