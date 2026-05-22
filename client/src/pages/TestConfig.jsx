import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useTestStore from '../store/useTestStore';
import { ChevronRight, Check, Sliders, Clock, Layers, Zap, BookOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TestConfig = () => {
    const navigate = useNavigate();
    const {
        selectedSubject,
        topics,
        fetchTopics,
        selectedTopics,
        toggleTopic,
        testConfig,
        setTestConfig,
        startTest,
        loading
    } = useTestStore();

    useEffect(() => {
        if (!selectedSubject) {
            navigate('/dashboard');
            return;
        }
        fetchTopics(selectedSubject._id);
    }, [selectedSubject, navigate, fetchTopics]);

    const handleStart = async () => {
        if (selectedTopics.length === 0) return;
        const attemptId = await startTest();
        if (attemptId) {
            navigate(`/test/attempt/${attemptId}`);
        }
    };

    if (!selectedSubject) return null;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-slide-up pb-32 px-4 sm:px-6 lg:px-8">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col gap-4 pt-4">
                <nav className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
                    <span
                        className="cursor-pointer hover:text-primary transition-colors hover:underline decoration-2 underline-offset-4"
                        onClick={() => navigate('/dashboard')}
                    >
                        Dashboard
                    </span>
                    <ChevronRight size={14} className="text-gray-400" />
                    <span className="text-primary bg-primary/5 px-2 py-0.5 rounded-md font-semibold">
                        {selectedSubject.name}
                    </span>
                </nav>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight"
                        >
                            Design Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">Practice</span>
                        </motion.h1>
                        <p className="text-gray-500 mt-2 text-lg">Customize your session to focus on what matters most.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left Column - Topics Selection (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/40 relative overflow-hidden group">

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Select Topics</h2>
                                    <p className="text-gray-400 font-medium mt-1">What would you like to master today?</p>
                                </div>
                                <div className="bg-gray-50 px-5 py-2 rounded-full text-xs font-bold text-gray-900 uppercase tracking-widest border border-gray-100">
                                    {selectedTopics.length} Selected
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar p-1">
                                <AnimatePresence>
                                    {topics.map((topic, index) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.04, type: "spring", stiffness: 200 }}
                                            key={topic._id}
                                            onClick={() => toggleTopic(topic._id)}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`
                                                relative cursor-pointer rounded-2xl p-6 transition-all duration-300 group overflow-hidden
                                                ${selectedTopics.includes(topic._id)
                                                    ? 'bg-gray-900 text-white shadow-2xl shadow-gray-900/30'
                                                    : 'bg-gray-50 text-gray-500 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center justify-between relative z-10">
                                                <span className={`font-bold text-lg tracking-tight ${selectedTopics.includes(topic._id) ? 'text-white' : 'text-gray-700'}`}>
                                                    {topic.name}
                                                </span>

                                                <div className={`
                                                    w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                                                    ${selectedTopics.includes(topic._id)
                                                        ? 'bg-white text-gray-900 scale-110'
                                                        : 'bg-gray-200 text-transparent group-hover:bg-gray-300'
                                                    }
                                                `}>
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Settings (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Configuration Card */}
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 sticky top-24 border border-gray-100/50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-900">
                                <Sliders size={18} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Test Config</h2>
                        </div>

                        <div className="space-y-10">
                            {/* Question Count */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Questions</label>
                                    <span className="text-xl font-black text-gray-900">
                                        {testConfig.count}
                                    </span>
                                </div>
                                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <input
                                        type="range"
                                        min="5"
                                        max="30"
                                        value={testConfig.count}
                                        onChange={(e) => setTestConfig({ count: e.target.value })}
                                        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div
                                        className="h-full bg-gray-900 rounded-full transition-all duration-300"
                                        style={{ width: `${((testConfig.count - 5) / 25) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 block">Difficulty</label>
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {['easy', 'medium', 'hard'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setTestConfig({ difficulty: level })}
                                            className={`
                                                py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                                                ${testConfig.difficulty === level
                                                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}
                                            `}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setTestConfig({ difficulty: 'mixed' })}
                                    className={`
                                        w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                        ${testConfig.difficulty === 'mixed'
                                            ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/30'
                                            : 'bg-gray-50 text-gray-400 hover:bg-primary/5 hover:text-primary'}
                                    `}
                                >
                                    <Sparkles size={14} fill="currentColor" />
                                    Adaptive Mixed
                                </button>
                            </div>

                            {/* Timer Mode */}
                            <div>
                                <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 block">Timer</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'overall', label: 'Exam', default: 30, icon: BookOpen },
                                        { id: 'per_question', label: 'Drill', default: 2, icon: Clock }
                                    ].map(mode => (
                                        <div
                                            key={mode.id}
                                            onClick={() => setTestConfig({
                                                timerMode: mode.id,
                                                timeLimit: mode.default
                                            })}
                                            className={`
                                                p-4 rounded-2xl cursor-pointer transition-all flex flex-col items-center gap-2 text-center
                                                ${testConfig.timerMode === mode.id
                                                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                                }
                                            `}
                                        >
                                            <mode.icon size={20} />
                                            <div className="font-bold text-xs uppercase tracking-wider">{mode.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Time Limit */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Time Limit</label>
                                    <span className="text-xl font-black text-gray-900">
                                        {testConfig.timeLimit}m
                                    </span>
                                </div>
                                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <input
                                        type="range"
                                        min={testConfig.timerMode === 'per_question' ? '1' : '10'}
                                        max={testConfig.timerMode === 'per_question' ? '8' : '60'}
                                        value={testConfig.timeLimit}
                                        onChange={(e) => setTestConfig({ timeLimit: e.target.value })}
                                        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div
                                        className="h-full bg-gray-900 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${((testConfig.timeLimit - (testConfig.timerMode === 'per_question' ? 1 : 10)) / (testConfig.timerMode === 'per_question' ? 7 : 50)) * 100}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button - Modernized */}
            <AnimatePresence>
                {selectedTopics.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-50 pointer-events-none"
                    >
                        <div className="bg-gray-900/90 backdrop-blur-xl p-2 rounded-[1.5rem] shadow-2xl flex items-center justify-between pointer-events-auto border border-white/10 ring-1 ring-black/5">
                            <div className="pl-6 pr-4 py-2">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-0.5">Ready to Start</p>
                                <p className="text-white font-bold text-lg">
                                    {selectedTopics.length} Topic{selectedTopics.length !== 1 ? 's' : ''} • {testConfig.count} Questions
                                </p>
                            </div>

                            <button
                                onClick={handleStart}
                                disabled={loading}
                                className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg flex items-center gap-2 group"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Start</span>
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TestConfig;
