const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  markAttendance,
  getStats,
} = require('../controllers/studentController');

// IMPORTANT: /stats/summary must be declared BEFORE /:id,
// otherwise Express would treat "stats" as an :id value.
router.get('/stats/summary', getStats);

router.route('/').get(getStudents).post(createStudent);

router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent);

router.put('/:id/attendance', markAttendance);

module.exports = router;
