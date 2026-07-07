import React, { useState, useEffect, useCallback } from 'react';
import { fetchStudents, createStudent, updateStudent, deleteStudent } from '../api/studentApi';
import StudentFormModal from './StudentFormModal';
import StudentDetailDrawer from './StudentDetailDrawer';

const PAGE_SIZE = 8;

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchStudents({
        search: search || undefined,
        status: statusFilter || undefined,
        sortBy,
        order,
        page,
        limit: PAGE_SIZE,
      });
      setStudents(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages || 1);
      setError('');
    } catch (err) {
      setError('Could not connect to the server. Is the backend running on port 5000?');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy, order, page]);

  // Debounced reload on search/filter/sort change; resets to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadStudents();
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, sortBy, order]);

  // Reload when page changes directly (pagination clicks)
  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSave = async (formData) => {
    try {
      if (editingStudent) {
        await updateStudent(editingStudent._id, formData);
      } else {
        await createStudent(formData);
      }
      setShowForm(false);
      setEditingStudent(null);
      setViewingStudent(null);
      loadStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong while saving.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this student from the register? This cannot be undone.')) return;
    try {
      await deleteStudent(id);
      setViewingStudent(null);
      loadStudents();
    } catch (err) {
      alert('Could not delete student.');
    }
  };

  const openEdit = (student) => {
    setEditingStudent(student);
    setViewingStudent(null);
    setShowForm(true);
  };

  const refreshViewingStudent = async () => {
    await loadStudents();
    const refreshed = students.find((s) => s._id === viewingStudent?._id);
    if (refreshed) setViewingStudent(refreshed);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Student Register</h1>
        <p className="page-subtitle">{total} record{total !== 1 ? 's' : ''} on file</p>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search name, roll number, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={`${sortBy}:${order}`}
          onChange={(e) => {
            const [sb, ord] = e.target.value.split(':');
            setSortBy(sb);
            setOrder(ord);
          }}
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="name:asc">Name A&ndash;Z</option>
          <option value="name:desc">Name Z&ndash;A</option>
          <option value="rollNumber:asc">Roll No. ascending</option>
        </select>

        <button
          className="btn btn-primary toolbar-add-btn"
          onClick={() => {
            setEditingStudent(null);
            setShowForm(true);
          }}
        >
          + New Enrollment
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="loading">Loading register...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Roll No.</th>
                <th>Name</th>
                <th>Class</th>
                <th>Attendance</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    No records match this search.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} onClick={() => setViewingStudent(student)} className="clickable-row">
                    <td className="mono">{student.rollNumber}</td>
                    <td>{student.name}</td>
                    <td>
                      {student.className}
                      {student.section ? ` \u2013 ${student.section}` : ''}
                    </td>
                    <td className="mono">{student.attendancePercentage}%</td>
                    <td>{student.grade}</td>
                    <td>
                      <span className={`badge badge-${student.status}`}>{student.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-secondary btn-small">
              Previous
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn btn-secondary btn-small"
            >
              Next
            </button>
          </div>
        </>
      )}

      {showForm && (
        <StudentFormModal
          editingStudent={editingStudent}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
        />
      )}

      {viewingStudent && (
        <StudentDetailDrawer
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
          onEdit={openEdit}
          onDelete={handleDelete}
          onRefresh={refreshViewingStudent}
        />
      )}
    </div>
  );
}

export default StudentsPage;
