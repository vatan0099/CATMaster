import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Home, CheckCircle, XCircle, Clock, Award,
    TrendingUp, ChevronRight, BarChart3, Target,
    RefreshCcw, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

const Result = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`/api/tests/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResult(data);
            } catch (error) {
                console.error(error);
                navigate('/dashboard');
            }
        };
        fetchResult();
    }, [id, navigate]);

    if (!result) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <p className="text-gray-500 font-bold animate-pulse">Calculating Score...</p>
            </div>
        </div>
    );

    const { score, questions, config } = result;
    if (!questions || !score) return <div className="p-10 text-center font-bold text-gray-500">Invalid test data. Please try again from your profile.</div>;

    const totalQuestions = config?.questionCount || questions.length;
    const accuracy = score.total > 0 ? ((score.correct / (score.correct + score.incorrect)) * 100).toFixed(1) : 0;
    const isPassing = accuracy >= 70;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
            className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20 px-4"
        >
            {/* Header Section */}
            <motion.div
                variants={itemVariants}
                className="glass-panel p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden border border-white/60 bg-gradient-to-br from-white/80 to-gray-50/50 shadow-xl"
            >
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] -mr-10 -mt-10">
                    <Award size={280} className="text-gray-900" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                                {isPassing ? 'Great Work! 🌟' : 'Good Effort! 💪'}
                            </h1>
                            {config?.timerMode === 'per_question' && (
                                <span className="bg-yellow-50 text-yellow-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-200/50 shadow-sm mt-1">
                                    Speed Drill
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 font-bold text-lg max-w-lg">
                            Performance summary for your session on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 flex items-center gap-3 active:scale-95"
                        >
                            <Home size={18} />
                            Dashboard
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Final Score', value: score.total, max: `out of ${totalQuestions * 3}`, icon: Award, color: 'text-primary', bg: 'bg-primary/5' },
                    { label: 'Accuracy', value: `${accuracy}%`, max: 'Precision Rate', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Correct', value: score.correct, max: `of ${totalQuestions}`, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
                    { label: 'Incorrect', value: score.incorrect, max: 'Needs Review', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="glass-panel p-6 rounded-[2rem] border border-white/60 bg-white/50 text-center space-y-3 shadow-md group transition-all"
                    >
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mx-auto shadow-inner`}>
                            <stat.icon size={24} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className={`text-3xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{stat.max}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Detailed Analysis Section */}
            <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                    <div className="p-3 bg-gray-100 rounded-2xl">
                        <BookOpen size={24} className="text-gray-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Question Breakdown</h2>
                        <p className="text-sm font-bold text-gray-400">Identify patterns and learn from your mistakes</p>
                    </div>
                </div>

                <div className="glass-panel rounded-[2.5rem] border border-white/60 bg-white/40 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Index</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Outcome</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Question Preview</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Choice</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Correct Solution</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {questions.map((q, idx) => {
                                    const userAns = q.selectedOption ? q.questionId.options.find(o => o.id === q.selectedOption)?.text : null;
                                    const correctAns = q.questionId.options.find(o => o.id === q.questionId.correctAnswer)?.text;

                                    return (
                                        <tr key={idx} className="hover:bg-white/60 transition-colors group">
                                            <td className="px-10 py-6">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-black text-gray-500 shadow-inner group-hover:bg-white transition-colors">
                                                    {idx + 1}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-center">
                                                    {q.status === 'unattempted' ? (
                                                        <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">
                                                            Timeout
                                                        </span>
                                                    ) : q.status === 'skipped' ? (
                                                        <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-yellow-50 text-yellow-600 border border-yellow-100">
                                                            Skipped
                                                        </span>
                                                    ) : q.isCorrect ? (
                                                        <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-600 border border-green-100 flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Correct
                                                        </span>
                                                    ) : (
                                                        <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100 flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Wrong
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 max-w-sm">
                                                <p className="text-sm font-bold text-gray-600 line-clamp-2 leading-relaxed" title={q.questionId.text}>
                                                    {q.questionId.text}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className={`text-sm font-black tracking-tight ${q.isCorrect ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {userAns || '—'}
                                                </p>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-2 group/sol">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 opacity-40"></div>
                                                    <p className="text-sm font-black text-gray-900 tracking-tight">
                                                        {correctAns}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Result;
