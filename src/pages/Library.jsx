import React from 'react';
import BookCard from '../components/BookCard';

const Library = ({ books = [], onToggleCheckout }) => {
  return (
    <div>
      <header className="library-header">
        <h1>📚 Library</h1>
        <p>Total Books: {books.length} | Checked Out: {books.filter(b => b.isCheckedOut).length}</p>
      </header>

      {books.length === 0 ? (
        <div className="empty-state">
          <p>No books found. Make sure the database is seeded with data.</p>
          <p>Run: <code>npm run server:seed</code></p>
        </div>
      ) : (
        <div className="book-grid">
          {books.map(book => (
            <BookCard 
              key={book.id} 
              book={book} 
              onToggle={() => onToggleCheckout(book.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;

