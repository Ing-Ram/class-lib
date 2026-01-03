import React from 'react';
import Card from './Card';

const StudentCard = ({ student }) => {
  return (
    <Card className="student-card">
      <div className="card-content">
        <h3>{student.name}</h3>
        <div className="details">
          <span className="badge class-id">Class ID: {student.classId || 'N/A'}</span>
        </div>

        <div className="checked-out-books">
          <p className="books-label">Checked Out Books ({student.books.length}):</p>
          {student.books.length > 0 ? (
            <ul className="books-list">
              {student.books.map(book => (
                <li key={book.id}>
                  <strong>{book.title}</strong> by {book.author}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-books">No books checked out</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StudentCard;

