const express = require('express');
const {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    changeUserRole
} = require('../controllers/studentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// All routes require authentication and admin role
router.use(auth);
router.use(roleCheck('admin'));

// GET /api/students - Get all students
router.get('/', getAllStudents);

// GET /api/students/:id - Get student by ID
router.get('/:id', getStudentById);

// POST /api/students - Create new student
router.post('/', createStudent);

// PUT /api/students/:id - Update student
router.put('/:id', updateStudent);

// DELETE /api/students/:id - Delete student
router.delete('/:id', deleteStudent);

// PUT /api/students/:id/role - Change user role
router.put('/:id/role', changeUserRole);

module.exports = router;