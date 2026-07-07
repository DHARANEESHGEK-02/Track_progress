import React, { useState, useEffect } from 'react';

const emptyForm = {
  name: '',
  rollNumber: '',
  email: '',
  phone: '',
  className: '',
  section: '',
  grade: '',
  status: 'active',
  baselineAttendance: 100,
};

function StudentFormModal({ editingStudent, onSave, onClose }) {
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    setFormData(editingStudent ? editingStudent : emptyForm);
  }, [editingStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingStudent ? 'Amend Student Record' : 'New Enrollment'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Full Name
              <input name="name" value={formData.name} onChange={handleChange} required />
            </label>

            <label>
              Roll Number
              <input name="rollNumber" value={formData.rollNumber} onChange={handleChange} required />
            </label>

            <label>
              Email
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </label>

            <label>
              Phone
              <input name="phone" value={formData.phone} onChange={handleChange} />
            </label>

            <label>
              Class / Course
              <input name="className" value={formData.className} onChange={handleChange} required />
            </label>

            <label>
              Section
              <input name="section" value={formData.section} onChange={handleChange} />
            </label>

            <label>
              Grade
              <input name="grade" value={formData.grade} onChange={handleChange} />
            </label>

            <label>
              Status
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <label>
              Baseline Attendance (%)
              <input
                type="number"
                name="baselineAttendance"
                min="0"
                max="100"
                value={formData.baselineAttendance}
                onChange={handleChange}
              />
            </label>
          </div>

          <p className="form-hint">
            Baseline attendance is used until daily entries are logged in this student's register.
          </p>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingStudent ? 'Save Changes' : 'Enroll Student'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentFormModal;
