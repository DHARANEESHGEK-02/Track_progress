import React from 'react';
import { markAttendance } from '../api/studentApi';

// Builds the last N calendar days (oldest first) as 'YYYY-MM-DD' strings.
const lastNDays = (n) => {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

const STATUS_LABEL = { present: 'P', absent: 'A', late: 'L' };
const today = new Date().toISOString().split('T')[0];

function StudentDetailDrawer({ student, onClose, onEdit, onDelete, onRefresh }) {
  const days = lastNDays(14);
  const historyByDate = {};
  student.attendanceHistory.forEach((entry) => {
    historyByDate[entry.date] = entry.status;
  });

  const handleMark = async (status) => {
    await markAttendance(student._id, today, status);
    onRefresh();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{student.name}</h2>
            <span className="drawer-roll">Roll No. {student.rollNumber}</span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="drawer-meta-grid">
          <div>
            <span className="meta-label">Class</span>
            <span className="meta-value">
              {student.className}
              {student.section ? ` \u2013 ${student.section}` : ''}
            </span>
          </div>
          <div>
            <span className="meta-label">Email</span>
            <span className="meta-value">{student.email}</span>
          </div>
          <div>
            <span className="meta-label">Phone</span>
            <span className="meta-value">{student.phone || '\u2014'}</span>
          </div>
          <div>
            <span className="meta-label">Grade</span>
            <span className="meta-value">{student.grade}</span>
          </div>
          <div>
            <span className="meta-label">Status</span>
            <span className={`badge badge-${student.status}`}>{student.status}</span>
          </div>
          <div>
            <span className="meta-label">Attendance</span>
            <span className="meta-value mono">{student.attendancePercentage}%</span>
          </div>
        </div>

        <div className="register-section">
          <div className="register-header">
            <h3>Attendance Register &mdash; Last 14 Days</h3>
            <div className="register-quick-actions">
              <span>Mark today:</span>
              <button className="pill pill-present" onClick={() => handleMark('present')}>
                Present
              </button>
              <button className="pill pill-late" onClick={() => handleMark('late')}>
                Late
              </button>
              <button className="pill pill-absent" onClick={() => handleMark('absent')}>
                Absent
              </button>
            </div>
          </div>

          <div className="register-grid">
            {days.map((date) => {
              const status = historyByDate[date];
              const dayNum = new Date(date).getDate();
              return (
                <div
                  key={date}
                  className={`register-cell ${status ? `register-cell-${status}` : 'register-cell-empty'}`}
                  title={`${date}${status ? ` \u2013 ${status}` : ' \u2013 no record'}`}
                >
                  <span className="register-cell-day">{dayNum}</span>
                  <span className="register-cell-mark">{status ? STATUS_LABEL[status] : '\u00b7'}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="form-actions drawer-actions">
          <button className="btn btn-secondary" onClick={() => onEdit(student)}>
            Edit Record
          </button>
          <button className="btn btn-danger" onClick={() => onDelete(student._id)}>
            Delete Record
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailDrawer;
