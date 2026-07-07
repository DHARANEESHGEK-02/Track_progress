import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/students';

// Fetch a page of students with optional search/filter/sort params.
// params can include: search, className, status, sortBy, order, page, limit
export const fetchStudents = async (params = {}) => {
  const response = await axios.get(API_BASE_URL, { params });
  return response.data; // { success, count, total, page, totalPages, data: [...] }
};

export const fetchStudentById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const createStudent = async (studentData) => {
  const response = await axios.post(API_BASE_URL, studentData);
  return response.data;
};

export const updateStudent = async (id, studentData) => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, studentData);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

// date: 'YYYY-MM-DD', status: 'present' | 'absent' | 'late'
export const markAttendance = async (id, date, status) => {
  const response = await axios.put(`${API_BASE_URL}/${id}/attendance`, { date, status });
  return response.data;
};

export const fetchStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/stats/summary`);
  return response.data; // { success, data: { total, active, inactive, avgAttendance, byClass, byGrade } }
};
