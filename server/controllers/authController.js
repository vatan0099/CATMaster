const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    let { email, password } = req.body;

    // Normalize email
    email = email ? email.trim().toLowerCase() : '';

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
    let { name, email, password } = req.body;

    // Normalize email
    email = email ? email.trim().toLowerCase() : '';

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort('-createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk Import Users
// @route   POST /api/auth/users/bulk
// @access  Private/Admin
const bulkImportUsers = async (req, res) => {
    try {
        const usersData = req.body;

        if (!Array.isArray(usersData) || usersData.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of users.' });
        }

        const preparedUsers = [];

        for (let userData of usersData) {
            const normalizedEmail = userData.email ? userData.email.trim().toLowerCase() : '';

            if (!normalizedEmail) continue;

            // Check if user exists
            const exists = await User.findOne({ email: normalizedEmail });
            if (exists) continue;

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            preparedUsers.push({
                name: userData.name,
                email: normalizedEmail,
                password: hashedPassword,
                role: userData.role || 'student'
            });
        }

        if (preparedUsers.length > 0) {
            await User.insertMany(preparedUsers);
        }

        res.status(201).json({
            message: `Successfully imported ${preparedUsers.length} users.`,
            count: preparedUsers.length
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser, registerUser, getAllUsers, deleteUser, bulkImportUsers };
