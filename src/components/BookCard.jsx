import React from 'react';
import Card from './Card';

const BookCard = ({ book, onToggle }) => {
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
  };

  return (
    <Card className={`book-card ${book.isCheckedOut ? 'checked-out' : 'available'}`}>
      <div className="card-content">
        <h3>{book.title}</h3>
        <p className="author">by {book.author}</p>
        
        <div className="details">
          <span className="badge genre">{book.genre}</span>
          <span className="isbn">ISBN: {book.isbn}</span>
        </div>

        {book.isCheckedOut && (
          <p className="status-msg">Checked out by: <strong>{book.studentName}</strong></p>
        )}

        {book.checkedOutAt && (
          <p className="status-msg">
            Checked out at: <strong>{formatDateTime(book.checkedOutAt)}</strong>
          </p>
        )}

        {book.checkedInAt && (
          <p className="status-msg">
            Last returned at: <strong>{formatDateTime(book.checkedInAt)}</strong>
          </p>
        )}
      </div>

      <button 
        className="action-btn" 
        onClick={onToggle}
      >
        {book.isCheckedOut ? "Return Book" : "Check Out"}
      </button>
    </Card>
  );
};

export default BookCard;