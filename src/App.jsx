import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Library from './pages/Library';
import Students from './pages/Students';
import './App.css'; 

const App = () => {
  // 1. Initial State with ISBN included
  const [books, setBooks] = useState([
    {
      id: 1,
      title: "Harry Potter and the Sorcerer's Stone",
      author: "J.K. Rowling",
      isbn: "978-0590353427",
      genre: "Fantasy",
      isCheckedOut: true,
      studentName: "John Doe" 
    },
    {
      id: 2,
      title: "The Very Hungry Caterpillar",
      author: "Eric Carle",
      isbn: "978-0399226908",
      genre: "Picture Book",
      isCheckedOut: true,
      studentName: "Liam Hendricks"
    },
    {
      id: 3,
      title: "Charlotte's Web",
      author: "E.B. White",
      isbn: "978-0064400558",
      genre: "Classic",
      isCheckedOut: true,
      studentName: "John Doe"
    }
  ]);

  // Student Class ID mapping
  const [studentClassMap, setStudentClassMap] = useState({
    "Liam Hendricks": "STU-001",
    "John Doe": "STU-002",
    "Jane Smith": "STU-003",
    "Jim Beam": "STU-004",
    "Jill Johnson": "STU-005",
    "Jack Daniels": "STU-006"
  });

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
    
    return Object.values(studentMap);
  };

  // 2. Logic to toggle checkout status
  const toggleCheckout = (id) => {
    setBooks(books.map(book => {
      if (book.id === id) {
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

        return { 
          ...book, 
          isCheckedOut: newStatus, 
          studentName: newStudent 
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