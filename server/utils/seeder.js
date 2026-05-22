const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const User = require('../models/User');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await Subject.deleteMany();
        await Topic.deleteMany();
        await Question.deleteMany();
        await User.deleteMany();

        console.log('Data Cleared');

        console.log('Data Cleared');

        // Load Users from JSON
        const usersPath = path.join(__dirname, '../data/users.json');
        if (fs.existsSync(usersPath)) {
            const fileData = fs.readFileSync(usersPath, 'utf-8');
            const usersJson = JSON.parse(fileData);

            for (let user of usersJson) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);
                await User.create({
                    ...user,
                    password: hashedPassword
                });
            }
            console.log(`Imported ${usersJson.length} users from JSON file.`);
        } else {
            // Fallback if no file
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);

            await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword,
                role: 'student'
            });
            console.log('Fallback: Test User Created (test@example.com)');
        }

        // Subjects
        const subjects = await Subject.insertMany([
            { name: 'Quantitative Aptitude', status: 'active', icon: 'calculator', order: 1 },
            { name: 'VARC', status: 'coming_soon', icon: 'book-open', order: 2 },
            { name: 'LRDI', status: 'coming_soon', icon: 'bar-chart', order: 3 }
        ]);

        const quantId = subjects[0]._id;

        // Parent Topics (Modules)
        const modules = await Topic.insertMany([
            { name: 'Arithmetic', subjectId: quantId, level: 0 },
            { name: 'Algebra', subjectId: quantId, level: 0 },
            { name: 'Geometry', subjectId: quantId, level: 0 }
        ]);

        const arithmeticId = modules[0]._id;
        const algebraId = modules[1]._id;
        const geometryId = modules[2]._id;

        // Subtopics
        const subTopicsData = [
            // Arithmetic
            { name: 'Percentages', subjectId: quantId, parentTopicId: arithmeticId, level: 1, questionCount: 5 },
            { name: 'Profit & Loss', subjectId: quantId, parentTopicId: arithmeticId, level: 1, questionCount: 3 },
            { name: 'Time & Work', subjectId: quantId, parentTopicId: arithmeticId, level: 1, questionCount: 3 },

            // Algebra
            { name: 'Linear Equations', subjectId: quantId, parentTopicId: algebraId, level: 1, questionCount: 3 },
            { name: 'Quadratic Equations', subjectId: quantId, parentTopicId: algebraId, level: 1, questionCount: 3 },

            // Geometry
            { name: 'Triangles', subjectId: quantId, parentTopicId: geometryId, level: 1, questionCount: 3 },
            { name: 'Circles', subjectId: quantId, parentTopicId: geometryId, level: 1, questionCount: 3 }
        ];

        const insertedSubTopics = await Topic.insertMany(subTopicsData);

        // Create Maps for fast lookup
        const subjectMap = {};
        subjects.forEach(s => subjectMap[s.name] = s._id);

        const topicMap = {};
        insertedSubTopics.forEach(t => topicMap[t.name] = t._id);

        // Load Questions from JSON
        const questionsPath = path.join(__dirname, '../data/questions.json');

        if (fs.existsSync(questionsPath)) {
            const fileData = fs.readFileSync(questionsPath, 'utf-8');
            const questionsJson = JSON.parse(fileData);

            const preparedQuestions = questionsJson.map(q => {
                const sId = subjectMap[q.subject];
                const tId = topicMap[q.topic];

                if (!sId) console.warn(`Warning: Subject "${q.subject}" not found for question: ${q.text.substring(0, 20)}...`);
                if (!tId) console.warn(`Warning: Topic "${q.topic}" not found for question: ${q.text.substring(0, 20)}...`);

                if (sId && tId) {
                    return {
                        ...q,
                        subjectId: sId,
                        topicId: tId
                    };
                }
                return null;
            }).filter(q => q !== null);

            if (preparedQuestions.length > 0) {
                await Question.insertMany(preparedQuestions);
                console.log(`Imported ${preparedQuestions.length} questions from JSON file.`);
            } else {
                console.log('No valid questions found in JSON file to import.');
            }
        } else {
            console.log(`Error: JSON file not found at ${questionsPath}`);
        }

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Subject.deleteMany();
        await Topic.deleteMany();
        await Question.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
