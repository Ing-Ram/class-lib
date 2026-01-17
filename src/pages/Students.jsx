import React from 'react';
import StudentCard from '../components/StudentCard';

const Students = ({ students = [] }) => {
  return (
    <div>
      <header className="library-header">
        <h1>👥 Students</h1>
        <p>Total Students: {students.length}</p>
      </header>

      {students.length > 0 ? (
        <div className="student-grid">
          {students.map((student) => (
            <StudentCard 
              key={student.name} 
              student={student} 
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No students have checked out books yet.</p>
        </div>
      )}
    </div>
  );
};

export default Students;

