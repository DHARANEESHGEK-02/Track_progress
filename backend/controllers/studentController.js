const Student = require('../models/Student');

// @desc    Get students — supports search, filters, sorting, and pagination
// @route   GET /api/students?search=&className=&status=&sortBy=&order=&page=&limit=
const getStudents = async (req, res) => {
  try {
    const {
      search,
      className,
      status,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (className) query.className = className;
    if (status) query.status = status;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const sortDirection = order === 'asc' ? 1 : -1;

    const totalCount = await Student.countDocuments(query);

    const students = await Student.find(query)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: students.length,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      data: students,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new student
// @route   POST /api/students
const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `Duplicate value for field: ${Object.keys(error.keyValue)}`,
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing student
// @route   PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark/update attendance for a specific date (upserts that day's entry)
// @route   PUT /api/students/:id/attendance
// @body    { date: 'YYYY-MM-DD', status: 'present' | 'absent' | 'late' }
const markAttendance = async (req, res) => {
  try {
    const { date, status } = req.body;
    if (!date || !status) {
      return res.status(400).json({ success: false, message: 'date and status are required' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const existingEntry = student.attendanceHistory.find((entry) => entry.date === date);
    if (existingEntry) {
      existingEntry.status = status; // overwrite that day's record
    } else {
      student.attendanceHistory.push({ date, status });
    }

    await student.save();
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Dashboard summary — totals, status split, per-class counts, avg attendance
// @route   GET /api/students/stats/summary
const getStats = async (req, res) => {
  try {
    const students = await Student.find();

    const total = students.length;
    const active = students.filter((s) => s.status === 'active').length;
    const inactive = total - active;

    const avgAttendance =
      total === 0
        ? 0
        : Math.round(
            students.reduce((sum, s) => sum + s.attendancePercentage, 0) / total
          );

    // Group counts by class
    const byClass = {};
    students.forEach((s) => {
      byClass[s.className] = (byClass[s.className] || 0) + 1;
    });

    // Group counts by grade
    const byGrade = {};
    students.forEach((s) => {
      byGrade[s.grade] = (byGrade[s.grade] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        inactive,
        avgAttendance,
        byClass: Object.entries(byClass).map(([className, count]) => ({ className, count })),
        byGrade: Object.entries(byGrade).map(([grade, count]) => ({ grade, count })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  markAttendance,
  getStats,
};
