const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller.js');

// Get all students
router.get('/', studentController.getAllStudents);

// Get student by ID
router.get('/:id', studentController.getStudentById);

// Create student
router.post('/', studentController.createStudent);

// Update student
router.put('/:id', studentController.updateStudent);

// Delete student
router.delete('/:id', studentController.deleteStudent);

// Seed 100 sample students
router.post('/seed', studentController.seedStudents);

module.exports = router;
