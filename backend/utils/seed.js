// Run with: node utils/seed.js
// Populates the database with sample students so the dashboard
// and charts have something to show immediately (useful for demos).
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');

const today = new Date();
const dateStr = (offsetDays) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

const buildHistory = (pattern) =>
  pattern.map((status, i) => ({ date: dateStr(pattern.length - i), status }));

const sampleStudents = [
  {
    name: 'Asha Verma',
    rollNumber: 'R101',
    email: 'asha.verma@example.com',
    phone: '9876543210',
    className: 'Grade 10',
    section: 'A',
    grade: 'A',
    status: 'active',
    baselineAttendance: 95,
    attendanceHistory: buildHistory(['present', 'present', 'present', 'late', 'present', 'absent', 'present']),
  },
  {
    name: 'Rohan Mehta',
    rollNumber: 'R102',
    email: 'rohan.mehta@example.com',
    phone: '9876543211',
    className: 'Grade 10',
    section: 'A',
    grade: 'B+',
    status: 'active',
    baselineAttendance: 88,
    attendanceHistory: buildHistory(['present', 'absent', 'present', 'present', 'present', 'present', 'late']),
  },
  {
    name: 'Priya Nair',
    rollNumber: 'R103',
    email: 'priya.nair@example.com',
    phone: '9876543212',
    className: 'Grade 10',
    section: 'B',
    grade: 'A-',
    status: 'active',
    baselineAttendance: 92,
    attendanceHistory: buildHistory(['present', 'present', 'present', 'present', 'absent', 'present', 'present']),
  },
  {
    name: 'Kabir Singh',
    rollNumber: 'R104',
    email: 'kabir.singh@example.com',
    phone: '9876543213',
    className: 'Grade 11',
    section: 'A',
    grade: 'C',
    status: 'inactive',
    baselineAttendance: 60,
    attendanceHistory: buildHistory(['absent', 'absent', 'present', 'absent', 'absent', 'present', 'absent']),
  },
  {
    name: 'Meera Iyer',
    rollNumber: 'R105',
    email: 'meera.iyer@example.com',
    phone: '9876543214',
    className: 'Grade 11',
    section: 'B',
    grade: 'B',
    status: 'active',
    baselineAttendance: 90,
    attendanceHistory: buildHistory(['present', 'present', 'late', 'present', 'present', 'present', 'present']),
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await Student.deleteMany({});
    console.log('Cleared existing students.');

    await Student.insertMany(sampleStudents);
    console.log(`Inserted ${sampleStudents.length} sample students.`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
