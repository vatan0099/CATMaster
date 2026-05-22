const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getAllUsers, deleteUser, bulkImportUsers } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/signup', registerUser);

// Admin Routes
router.get('/users', protect, admin, getAllUsers);
router.post('/users/bulk', protect, admin, bulkImportUsers);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
