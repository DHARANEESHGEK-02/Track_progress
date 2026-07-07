const mongoose = require('mongoose');

// Each entry in a student's attendance register: one row per day.
const attendanceEntrySchema = new mongoose.Schema(
  {
    date: {
      type: String, // stored as 'YYYY-MM-DD' for easy grouping/lookup
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true,
    },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    className: {
      type: String, // e.g. "Grade 10", "B.Sc CS - Year 2"
      required: [true, 'Class/Course name is required'],
      trim: true,
    },
    section: {
      type: String,
      trim: true,
      default: '',
    },
    grade: {
      type: String, // e.g. "A", "B+", "C"
      default: 'N/A',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    // Manually-set baseline attendance %, used only until real
    // attendance entries exist below (see getAttendancePercentage).
    baselineAttendance: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    // The actual day-by-day register. This is what makes attendance
    // tracking "real" instead of a single static number.
    attendanceHistory: {
      type: [attendanceEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: computed attendance percentage.
// If real attendance entries exist, calculate from them.
// Otherwise fall back to the manually-set baseline.
studentSchema.virtual('attendancePercentage').get(function () {
  if (!this.attendanceHistory || this.attendanceHistory.length === 0) {
    return this.baselineAttendance;
  }
  const presentOrLate = this.attendanceHistory.filter(
    (entry) => entry.status === 'present' || entry.status === 'late'
  ).length;
  return Math.round((presentOrLate / this.attendanceHistory.length) * 100);
});

studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);
