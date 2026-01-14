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

