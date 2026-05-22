import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useTestStore from '../store/useTestStore';
import SubjectCard from '../components/SubjectCard';
import useAuthStore from '../store/useAuthStore';
import { LayoutGrid, Sparkles, TrendingUp, Target, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { subjects, fetchSubjects, isLoading } = useTestStore();
    const { user } = useAuthStore();
    const [weeklyTests, setWeeklyTests] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        fetchSubjects();
        fetchWeeklyStats();
    }, [fetchSubjects]);

    const fetchWeeklyStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setStatsLoading(false);
                return;
            }

            const { data } = await axios.get('/api/tests/history', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Calculate tests taken this week
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
            startOfWeek.setHours(0, 0, 0, 0);

            const testsThisWeek = data.filter(test => {
                const testDate = new Date(test.startedAt);
                return testDate >= startOfWeek;
            });

            setWeeklyTests(testsThisWeek.length);
            setStatsLoading(false);
        } catch (error) {
            console.error('Failed to fetch test history:', error);
            setStatsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-slide-up pb-12">

            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 shadow-xl border border-white/50 p-8 lg:p-10">
                {/* Subtle Background Pattern */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        {/* Status Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/20 shadow-sm mb-5"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                Ready to Excel
                            </span>
                        </motion.div>

                        {/* Hero Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4"
                        >
                            Welcome Back,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                                {user?.name?.split(' ')[0]}
                            </span>
                            ! 👋
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-base text-gray-600 leading-relaxed mb-5"
                        >
                            Your journey to excellence continues here. Choose a module below and start practicing.
                        </motion.p>

                        {/* Quick Action Chips */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap gap-2"
                        >
                            <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm flex items-center gap-1.5">
                                <Target className="text-primary" size={14} />
                                <span className="text-xs font-semibold text-gray-700">Smart Practice</span>
                            </div>
                            <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm flex items-center gap-1.5">
                                <TrendingUp className="text-green-600" size={14} />
                                <span className="text-xs font-semibold text-gray-700">Track Progress</span>
                            </div>
                            <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm flex items-center gap-1.5">
                                <Zap className="text-yellow-500" size={14} />
                                <span className="text-xs font-semibold text-gray-700">Instant Results</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Elegant Stats Widget */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="w-full lg:w-auto lg:min-w-[240px]"
                    >
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-hover p-6 shadow-xl border border-white/20">
                            {/* Decorative circle */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp className="text-white/90" size={18} />
                                    <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider">Weekly Progress</h3>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-4xl font-black text-white">
                                            {statsLoading ? '...' : weeklyTests}
                                        </p>
                                        <p className="text-sm text-white/80 font-medium mt-1">
                                            {weeklyTests === 1 ? 'Test' : 'Tests'} this week
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Award className="text-white" size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Subjects Grid Section */}
            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-4 px-2"
                >
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <LayoutGrid size={24} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Learning Modules</h2>
                        <p className="text-sm text-gray-500">Choose your focus area</p>
                    </div>
                </motion.div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-72 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {subjects.map((subject, index) => (
                            <motion.div
                                key={subject._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                            >
                                <SubjectCard subject={subject} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
