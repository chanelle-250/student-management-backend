const User = require('../models/User');

// Get all students (Admin only)
const getAllStudents = async (req, res) => {
    try {
        const students = await User.getAllStudents();
        res.json({
            students,
            count: students.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get student by ID (Admin only)
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await User.findById(id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.role !== 'student') {
            return res.status(400).json({ message: 'User is not a student' });
        }

        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new student (Admin only)
const createStudent = async (req, res) => {
    try {
        const { full_name, email, phone, password, course_of_study, enrollment_year } = req.body;

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create student
        const student = await User.create({
            full_name,
            email,
            phone,
            password,
            role: 'student',
            course_of_study,
            enrollment_year
        });

        res.status(201).json({
            message: 'Student created successfully',
            student
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update student (Admin only)
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, course_of_study, enrollment_year, status } = req.body;

        // Check if student exists
        const existingStudent = await User.findById(id);
        if (!existingStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (existingStudent.role !== 'student') {
            return res.status(400).json({ message: 'User is not a student' });
        }

        // Check if email is taken by another user
        if (email !== existingStudent.email) {
            const userWithEmail = await User.findByEmail(email);
            if (userWithEmail) {
                return res.status(400).json({ message: 'Email already taken' });
            }
        }

        // Update student
        const updatedStudent = await User.update(id, {
            full_name,
            email,
            phone,
            course_of_study,
            enrollment_year
        });

        // Update status if provided
        if (status) {
            await User.updateStatus(id, status);
            updatedStudent.status = status;
        }

        res.json({
            message: 'Student updated successfully',
            student: updatedStudent
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete student (Admin only)
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if student exists
        const student = await User.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.role !== 'student') {
            return res.status(400).json({ message: 'User is not a student' });
        }

        await User.delete(id);

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Change user role (Admin only)
const changeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['student', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser = await User.updateRole(id, role);

        res.json({
            message: `User role changed to ${role} successfully`,
            user: {
                id: updatedUser.id,
                full_name: updatedUser.full_name,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    changeUserRole
};