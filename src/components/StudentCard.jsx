import React, { useMemo, useState } from 'react';
import Card from './Card';

const StudentCard = ({ student }) => {
  const [showHistory, setShowHistory] = useState(false);

  const historySorted = useMemo(() => {
    const h = Array.isArray(student.history) ? student.history : [];
    // Newest first (by checkedInAt, falling back to checkedOutAt)
    return [...h].sort((a, b) => {
      const aKey = a?.checkedInAt || a?.checkedOutAt || '';
      const bKey = b?.checkedInAt || b?.checkedOutAt || '';
      return String(bKey).localeCompare(String(aKey));
    });
  }, [student.history]);

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString();
  };

  const formatDuration = (durationMs) => {
    if (durationMs == null || Number.isNaN(durationMs) || durationMs < 0) return 'N/A';
    const totalSeconds = Math.floor(durationMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (!parts.length) parts.push(`${seconds}s`);
    return parts.join(' ');
  };

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

        <div className="student-history">
          <button
            className="action-btn"
            onClick={() => setShowHistory(s => !s)}
            type="button"
          >
            {showHistory ? "Hide History" : "History"}
          </button>

          {showHistory && (
            <div className="history-list">
              <p className="books-label">Full History ({historySorted.length}):</p>
              {historySorted.length > 0 ? (
                <ul className="books-list">
                  {historySorted.map((entry, idx) => (
                    <li key={`${entry.bookId}-${entry.checkedInAt || entry.checkedOutAt || idx}`}>
                      <strong>{entry.title}</strong>
                      {entry.isbn ? ` (ISBN: ${entry.isbn})` : ''}
                      <div>
                        Out: <strong>{formatDateTime(entry.checkedOutAt)}</strong> | In:{' '}
                        <strong>{formatDateTime(entry.checkedInAt)}</strong> | Duration:{' '}
                        <strong>{formatDuration(entry.durationMs)}</strong>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-books">No history yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StudentCard;

