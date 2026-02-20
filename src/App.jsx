import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Library from './pages/Library';
import Students from './pages/Students';
import './App.css'; 
import { getBooks, getStudents, checkoutBook, returnBook, seedFromCsv } from './api';

const App = () => {
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = React.useRef(null);
  const seedTypeRef = React.useRef("books");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [booksData, studentsData] = await Promise.all([
        getBooks(),
        getStudents()
      ]);
      setBooks(booksData || []);
      setStudents(studentsData || []);
    } catch (e) {
      const errorMsg = e?.message || 'Failed to load data';
      setError(`Error: ${errorMsg}. Make sure the backend server is running on port 5174.`);
      // eslint-disable-next-line no-console
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeedCsv = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const type = seedTypeRef.current;
    try {
      const result = await seedFromCsv(file, type);
      const label = type === "students" ? "Students" : "Books";
      const msg = `Seeded ${label}: ${result.inserted} inserted, ${result.updated} updated.` +
        (result.errors?.length ? ` ${result.errors.length} row(s) had errors.` : "");
      // eslint-disable-next-line no-alert
      alert(msg);
      await loadData();
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err?.message || "Seed failed");
    } finally {
      e.target.value = "";
    }
  };

  const openSeedCsv = (type) => {
    seedTypeRef.current = type;
    fileInputRef.current?.click();
  };

  // Toggle checkout status via API
  const toggleCheckout = async (id) => {
    const book = books.find((b) => b.id === id);
    if (!book) return;

    try {
      if (book.isCheckedOut) {
        await returnBook(id);
      } else {
        const studentName = window.prompt('Enter student name:');
        if (!studentName) return;
        const classId = window.prompt('Enter student class ID (optional):') || undefined;
        await checkoutBook(id, { studentName, classId });
      }
      await loadData();
    } catch (e) {
      // Simple error handling; you could surface this in the UI instead
      // eslint-disable-next-line no-alert
      alert(e?.message || 'Operation failed');
    }
  };

  return (
    <div className="app-container">
      <nav className="main-nav">
        <NavLink to="/library" className="nav-link">📚 Library</NavLink>
        <NavLink to="/students" className="nav-link">👥 Students</NavLink>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={handleSeedCsv}
        />
        <button
          type="button"
          className="nav-link seed-csv-btn"
          onClick={() => openSeedCsv("books")}
        >
          📄 Seed books
        </button>
        <button
          type="button"
          className="nav-link seed-csv-btn"
          onClick={() => openSeedCsv("students")}
        >
          👥 Seed students
        </button>
      </nav>

      {loading && (
        <div className="loading-state">
          <p>Loading data...</p>
        </div>
      )}
      {error && (
        <div className="error-state">
          <p>{error}</p>
        </div>
      )}

      <Routes>
        <Route 
          path="/library" 
          element={
            <Library 
              books={books} 
              onToggleCheckout={toggleCheckout} 
            />
          } 
        />
        <Route 
          path="/students" 
          element={
            <Students 
              students={students} 
            />
          } 
        />
        <Route path="/" element={<Navigate to="/library" replace />} />
      </Routes>
    </div>
  );
};

export default App;