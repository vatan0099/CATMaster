import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import useTestStore from '../store/useTestStore';
import {
    User, Mail, Shield, Award, Clock, Activity, LogOut,
    Eye, RotateCcw, TrendingUp, Calendar, Trash2,
    Zap, Target, PieChart, ChevronRight, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
    const { user, logout } = useAuthStore();
    const { retakeTest } = useTestStore();
    const navigate = useNavigate();
    const [testHistory, setTestHistory] = useState([]);
    const [stats, setStats] = useState({
        testsTaken: 0,
        avgAccuracy: 0,
        bestTopic: 'N/A',
        totalQuestions: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestHistory();
    }, []);

    const fetchTestHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('/api/tests/history', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTestHistory(data);

            const testsTaken = data.length;
            const completedTests = data.filter(t => t.status === 'completed');

            if (completedTests.length > 0) {
                let totalCorrect = 0;
                let totalAttempted = 0;

                completedTests.forEach(test => {
                    totalCorrect += test.score.correct || 0;
                    totalAttempted += (test.score.correct + test.score.incorrect) || 0;
                });

                const avgAccuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted * 100) : 0;

                setStats({
                    testsTaken,
                    avgAccuracy: avgAccuracy.toFixed(1),
                    totalQuestions: totalAttempted,
                    bestTopic: completedTests.length > 0 ? 'Quantitative' : 'N/A' // Placeholder
                });
            } else {
                setStats({ testsTaken, avgAccuracy: 0, totalQuestions: 0, bestTopic: 'N/A' });
            }

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleRetake = async (attemptId) => {
        const newAttemptId = await retakeTest(attemptId);
        if (newAttemptId) {
            navigate(`/test/attempt/${newAttemptId}`);
        }
    };

    const handleViewDetails = (attemptId) => {
        navigate(`/test/result/${attemptId}`);
    };

    const handleDelete = async (attemptId, attemptNumber) => {
        if (!window.confirm(`Are you sure you want to delete Test #${attemptNumber}? This cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/tests/${attemptId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTestHistory();
        } catch (error) {
            console.error('Failed to delete test:', error);
        }
    };

    if (!user) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-10 pb-20 px-4"
        >
            {/* --- HERO SECTION --- */}
            <motion.div
                variants={itemVariants}
                className="relative group h-72 md:h-80 rounded-[3rem] overflow-hidden shadow-2xl bg-gray-900 border border-white/10"
            >
                {/* Background Design Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-black opacity-90 transition-opacity group-hover:opacity-95"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px]"></div>

                <div className="relative h-full z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        {/* Avatar with Ring */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-125 animate-pulse"></div>
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white flex items-center justify-center text-primary text-5xl md:text-6xl font-black shadow-2xl relative border-4 border-white/50">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 p-2.5 rounded-full border-4 border-gray-900 shadow-lg" title="Online">
                                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                            </div>
                        </div>

                        {/* User Metadata */}
                        <div className="space-y-3">
                            <motion.h1
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="text-4xl md:text-5xl font-black text-white tracking-tight"
                            >
                                {user.name}
                            </motion.h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white/90 text-sm font-medium flex items-center gap-2">
                                    <Mail size={14} className="text-primary-light" />
                                    {user.email}
                                </div>
                                <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white/90 text-sm font-medium flex items-center gap-2">
                                    <Shield size={14} className="text-primary-light" />
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Candidate
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={logout}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 border border-white/20 shadow-xl group/btn"
                        >
                            <LogOut size={20} className="transition-transform group-hover/btn:-translate-x-1" />
                            Sign Out Account
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* --- STATS GRID --- */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                    { label: 'Tests Attempted', value: stats.testsTaken, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50', sub: 'Total Sessions' },
                    { label: 'Overall Accuracy', value: `${stats.avgAccuracy}%`, icon: Target, color: 'text-green-500', bg: 'bg-green-50', sub: 'Avg. Performance' },
                ].map((stat, i) => (
                    <div key={i} className="glass-panel p-6 rounded-[2.5rem] border border-white/60 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bg} -mr-8 -mt-8 rounded-full opacity-0 group-hover:opacity-40 transition-opacity blur-2xl`}></div>
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-3">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</h3>
                                <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 opacity-60">{stat.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* --- ACTIVITY SECTION --- */}
            <motion.div variants={itemVariants} className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-4">
                            <div className="p-2.5 bg-primary/10 rounded-2xl">
                                <BarChart3 size={24} className="text-primary" />
                            </div>
                            Learning Analytics
                        </h2>
                        <p className="text-gray-500 font-medium ml-14">Detailed breakdown of your practice history</p>
                    </div>
                </div>

                <div className="glass-panel rounded-[3rem] border border-white/60 overflow-hidden shadow-xl p-8 lg:p-12 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-primary font-bold animate-pulse">Syncing Test History...</p>
                        </div>
                    ) : testHistory.length === 0 ? (
                        <div className="text-center py-24 space-y-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto text-gray-300 border-2 border-dashed border-gray-200">
                                <Clock size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-gray-800">Your Journey Starts Here</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">No tests recorded yet. Start your first practice session to generate insights.</p>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                            >
                                Take New Test
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <AnimatePresence>
                                {testHistory.map((attempt, index) => {
                                    const isCompleted = attempt.status === 'completed';
                                    const isSpeedDrill = attempt.config?.timerMode === 'per_question';

                                    return (
                                        <motion.div
                                            key={attempt._id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group relative bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 hover:border-primary/30 hover:shadow-2xl transition-all duration-300"
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                                {/* Left Column: Progress & Identity */}
                                                <div className="flex items-start gap-6">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-xl shadow-inner
                                                        ${isCompleted ? 'bg-green-50 text-green-600' : 'bg-primary/5 text-primary'}
                                                    `}>
                                                        {testHistory.length - index}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <h4 className="text-xl font-black text-gray-900 tracking-tight">
                                                                {attempt.config?.subjectId?.name || 'Aptitude Test'}
                                                            </h4>
                                                            {isSpeedDrill && (
                                                                <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-200/50">
                                                                    <Zap size={10} fill="currentColor" /> Speed Drill
                                                                </span>
                                                            )}
                                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                                                                ${isCompleted
                                                                    ? 'bg-green-50 text-green-600 border-green-200'
                                                                    : 'bg-primary/5 text-primary border-primary/20'
                                                                }
                                                            `}>
                                                                {isCompleted ? <CheckCircle size={10} /> : <Clock size={10} />}
                                                                {isCompleted ? 'Finalized' : 'In Session'}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-400">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={14} className="text-gray-300" />
                                                                {new Date(attempt.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Target size={14} className="text-gray-300" />
                                                                {attempt.config?.questionCount || 0} Questions
                                                            </div>
                                                            {isCompleted && (
                                                                <div className="flex items-center gap-2 text-primary">
                                                                    <Award size={14} />
                                                                    Score: {attempt.score?.total || 0} pts
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Column: Dynamic Actions */}
                                                <div className="flex flex-wrap items-center gap-3">
                                                    {isCompleted ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleViewDetails(attempt._id)}
                                                                className="px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 border border-gray-200 transition-all active:scale-95"
                                                            >
                                                                <Eye size={16} strokeWidth={3} />
                                                                Analysis
                                                            </button>
                                                            <button
                                                                onClick={() => handleRetake(attempt._id)}
                                                                className="px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 border border-primary/10 transition-all active:scale-95 shadow-sm"
                                                            >
                                                                <RotateCcw size={16} strokeWidth={3} />
                                                                Retake
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => navigate(`/test/attempt/${attempt._id}`)}
                                                            className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/20 transition-all animate-pulse hover:animate-none"
                                                        >
                                                            <Activity size={16} strokeWidth={3} />
                                                            Resume Test
                                                            <ChevronRight size={16} strokeWidth={3} />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleDelete(attempt._id, testHistory.length - index)}
                                                        className="p-3 bg-white text-gray-300 hover:text-red-500 hover:bg-red-50 border border-gray-100 rounded-2xl transition-all"
                                                        title="Delete History"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const CheckCircle = ({ size }) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export default Profile;
