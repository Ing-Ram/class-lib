import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Library from './pages/Library';
import Students from './pages/Students';
import './App.css'; 
import initialBooks from './data/books.json';
import initialStudentClassMap from './data/students.json';

const App = () => {
  // 1. Initial State with ISBN included
  const [books, setBooks] = useState(initialBooks);

  // Student Class ID mapping
  const [studentClassMap, setStudentClassMap] = useState(initialStudentClassMap);

  // Student checkout history:
  // { [studentName]: Array<{ bookId, title, isbn, checkedOutAt, checkedInAt, durationMs }> }
  const [studentHistory, setStudentHistory] = useState({});

  // Derive students from checked-out books
  const deriveStudents = () => {
    const checkedOutBooks = books.filter(book => book.isCheckedOut && book.studentName);
    const studentMap = {};
    
    checkedOutBooks.forEach(book => {
      const studentName = book.studentName;
      if (!studentMap[studentName]) {
        studentMap[studentName] = {
          name: studentName,
          classId: studentClassMap[studentName] || null,
          books: []
        };
      }
      studentMap[studentName].books.push(book);
    });

    // Also include students who have history or are in the class map, even if they currently
    // have no books checked out.
    const allStudentNames = new Set([
      ...Object.keys(studentClassMap || {}),
      ...Object.keys(studentHistory || {}),
      ...Object.keys(studentMap || {})
    ]);

    allStudentNames.forEach((name) => {
      if (!studentMap[name]) {
        studentMap[name] = {
          name,
          classId: studentClassMap[name] || null,
          books: []
        };
      }
      studentMap[name].history = studentHistory[name] || [];
    });

    return Object.values(studentMap);
  };

  // 2. Logic to toggle checkout status
  const toggleCheckout = (id) => {
    setBooks(books.map(book => {
      if (book.id === id) {
        const nowIso = new Date().toISOString();
        const previousStudent = book.studentName;
        const previousCheckedOutAt = book.checkedOutAt;
        // If it is currently checked out, we act as if we are returning it (remove student name)
        // If it is NOT checked out, we simulate a student taking it
        const newStatus = !book.isCheckedOut;
        let newStudent = "";
        let newClassId = "";
        
        if (newStatus) {
          newStudent = prompt("Enter student name:");
          // If the user hit cancel on the prompt, don't change anything
          if (!newStudent) return book;
          
          newClassId = prompt("Enter student class ID:");
          // If class ID is provided, update the mapping
          if (newClassId) {
            setStudentClassMap(prev => ({
              ...prev,
              [newStudent]: newClassId
            }));
          }
        }

        // If we're returning a book, record a completed history entry for the previous student.
        if (!newStatus && previousStudent) {
          const checkedOutAtIso = previousCheckedOutAt || null;
          const checkedInAtIso = nowIso;
          const durationMs = checkedOutAtIso
            ? (new Date(checkedInAtIso).getTime() - new Date(checkedOutAtIso).getTime())
            : null;

          setStudentHistory(prev => ({
            ...prev,
            [previousStudent]: [
              ...(prev[previousStudent] || []),
              {
                bookId: book.id,
                title: book.title,
                isbn: book.isbn,
                checkedOutAt: checkedOutAtIso,
                checkedInAt: checkedInAtIso,
                durationMs
              }
            ]
          }));
        }

        return { 
          ...book, 
          isCheckedOut: newStatus, 
          studentName: newStudent,
          // Tracking fields:
          checkedOutAt: newStatus ? nowIso : (book.checkedOutAt || null),
          checkedInAt: newStatus ? null : nowIso
        };
      }
      return book;
    }));
  };

  const students = deriveStudents();

  return (
    <div className="app-container">
      <nav className="main-nav">
        <NavLink to="/library" className="nav-link">📚 Library</NavLink>
        <NavLink to="/students" className="nav-link">👥 Students</NavLink>
      </nav>

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