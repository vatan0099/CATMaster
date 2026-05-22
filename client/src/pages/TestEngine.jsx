import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, AlertCircle, ChevronLeft, ChevronRight, CheckCircle2, LayoutGrid } from 'lucide-react';

const TestEngine = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [testData, setTestData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNext = () => {
        if (!testData) return;
        setCurrentQuestionIndex(currentIdx =>
            (currentIdx < testData.questions.length - 1) ? currentIdx + 1 : currentIdx
        );
    };

    const handlePrev = () => {
        if (!testData) return;
        setCurrentQuestionIndex(currentIdx =>
            (currentIdx > 0) ? currentIdx - 1 : currentIdx
        );
    };

    const isInitialLoad = React.useRef(true);
    const prevIndexRef = React.useRef(0);

    // Save progress to backend
    const saveProgress = async (currentAnswers, currentTimeLeft, currentIndex) => {
        if (!testData || isSubmitting) return;
        try {
            const token = localStorage.getItem('token');

            // Build answers and question state for backend
            const answersArray = testData.questions.map((q, idx) => {
                const qId = q.questionId._id;
                const ans = currentAnswers[qId] || {};

                // If this is the active question, use the current timeLeft
                // Otherwise use what's already in the testData
                const finalTimeRemaining = (idx === currentIndex) ? currentTimeLeft : q.timeRemaining;

                return {
                    questionId: qId,
                    selectedOption: ans.selectedOption || null,
                    status: ans.status || q.status || 'unattempted',
                    timeTaken: ans.timeTaken || q.timeTaken || 0,
                    timeRemaining: finalTimeRemaining
                };
            });

            await axios.post(`/api/tests/${id}/progress`, {
                answers: answersArray,
                timeRemaining: testData.config.timerMode === 'overall' ? currentTimeLeft : null,
                currentQuestionIndex: currentIndex !== undefined ? currentIndex : currentQuestionIndex
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Failed to save progress', error);
        }
    };

    // Fetch Test Data and Initialize
    useEffect(() => {
        const fetchTest = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`/api/tests/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setTestData(data);

                // Restore last question index
                const lastIdx = data.lastQuestionIndex || 0;
                setCurrentQuestionIndex(lastIdx);
                prevIndexRef.current = lastIdx;

                // Restore answers if any
                if (data.questions) {
                    const restoredAnswers = {};
                    data.questions.forEach(q => {
                        if (q.status === 'attempted' || q.selectedOption) {
                            restoredAnswers[q.questionId._id] = {
                                selectedOption: q.selectedOption,
                                status: q.status,
                                timeTaken: q.timeTaken || 0
                            };
                        }
                    });
                    setAnswers(restoredAnswers);
                }

                // Initialize Timer
                const mode = data.config.timerMode || 'overall';
                const limitInSeconds = (data.config.timeLimit || 30) * 60;

                if (mode === 'overall') {
                    if (data.timeRemaining !== null && data.timeRemaining !== undefined) {
                        setTimeLeft(data.timeRemaining);
                    } else {
                        const elapsed = (Date.now() - new Date(data.startedAt).getTime()) / 1000;
                        setTimeLeft(Math.max(0, limitInSeconds - elapsed));
                    }
                } else {
                    // Speed Drill - Load current question's remaining time
                    const currentQ = data.questions[lastIdx];
                    if (currentQ && currentQ.timeRemaining !== null && currentQ.timeRemaining !== undefined) {
                        setTimeLeft(currentQ.timeRemaining);
                    } else {
                        setTimeLeft(limitInSeconds);
                    }
                }

            } catch (error) {
                console.error(error);
                navigate('/dashboard');
            }
        };
        fetchTest();
    }, [id, navigate]);

    // Handle Speed Drill Timer on question change (Sequential/Paused logic)
    useEffect(() => {
        if (!testData || testData.config.timerMode !== 'per_question') return;

        // Skip on first load as it's handled by fetchTest
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }

        const prevIdx = prevIndexRef.current;
        const nextIdx = currentQuestionIndex;

        // Safety guard for indices
        if (nextIdx < 0 || nextIdx >= testData.questions.length) {
            console.error(`Attempted to navigate to invalid index: ${nextIdx}`);
            setCurrentQuestionIndex(Math.max(0, Math.min(nextIdx, testData.questions.length - 1)));
            return;
        }

        if (prevIdx === nextIdx) return;

        // 1. Snapshot previous question's time
        setTestData(prev => {
            if (!prev || !prev.questions) return prev;

            const newQuestions = [...prev.questions];
            if (newQuestions[prevIdx]) {
                newQuestions[prevIdx] = {
                    ...newQuestions[prevIdx],
                    timeRemaining: timeLeft
                };
            }

            // 2. Load next question's time
            const nextQ = newQuestions[nextIdx];
            if (!nextQ) {
                console.warn(`Question at index ${nextIdx} not found`);
                return { ...prev, questions: newQuestions };
            }

            const limitInSeconds = (prev.config.timeLimit || 2) * 60;
            const nextTime = (nextQ.timeRemaining !== null && nextQ.timeRemaining !== undefined)
                ? nextQ.timeRemaining
                : limitInSeconds;

            setTimeLeft(nextTime);

            // Update ref for next transition
            prevIndexRef.current = nextIdx;

            return { ...prev, questions: newQuestions };
        });

        // 3. Persist immediately on change
        saveProgress(answers, timeLeft, nextIdx);

    }, [currentQuestionIndex]);

    const isQuestionLocked = (idx) => {
        if (!testData || testData.config.timerMode !== 'per_question' || idx < 0 || !testData.questions[idx]) return false;
        const q = testData.questions[idx];
        // Only lock if time explicitly ran out to 0
        return q.timeRemaining === 0;
    };

    // Periodic Save & BeforeUnload
    useEffect(() => {
        if (!testData || timeLeft <= 0) return;

        const saveInterval = setInterval(() => {
            saveProgress(answers, timeLeft, currentQuestionIndex);
        }, 30000); // 30 seconds

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                saveProgress(answers, timeLeft, currentQuestionIndex);
            }
        };

        const handleBeforeUnload = (e) => {
            saveProgress(answers, timeLeft, currentQuestionIndex);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(saveInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [testData, timeLeft, answers, currentQuestionIndex]);

    // Timer Countdown
    useEffect(() => {
        if (!testData || timeLeft <= 0 || isSubmitting) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    const mode = testData.config.timerMode || 'overall';

                    if (mode === 'overall') {
                        handleSubmit();
                    } else {
                        // Sequential Mode - Auto advance with strict boundary check
                        setCurrentQuestionIndex(currentIdx => {
                            if (currentIdx < testData.questions.length - 1) {
                                return currentIdx + 1;
                            } else {
                                // Last question timed out - submit
                                setTimeout(handleSubmit, 100); // Small delay to allow state to settle
                                return currentIdx;
                            }
                        });
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, testData?.questions?.length, testData?.config?.timerMode, isSubmitting]);

    const handleOptionSelect = (optionId) => {
        if (!testData || isQuestionLocked(currentQuestionIndex)) return;
        const currentQ = testData.questions[currentQuestionIndex];
        const currentAnswer = answers[currentQ.questionId._id];

        // If clicking the same option, deselect it (toggle off)
        if (currentAnswer?.selectedOption === optionId) {
            setAnswers(prev => {
                const newAnswers = { ...prev };
                delete newAnswers[currentQ.questionId._id];
                return newAnswers;
            });
        } else {
            // Select the new option
            setAnswers(prev => ({
                ...prev,
                [currentQ.questionId._id]: {
                    selectedOption: optionId,
                    status: 'attempted',
                    timeTaken: 0
                }
            }));
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting || !testData) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');

            // Build comprehensive answers array for final submission
            const answersArray = testData.questions.map(q => {
                const qId = q.questionId?._id || q.questionId;
                const ans = answers[qId] || {};
                return {
                    questionId: qId,
                    selectedOption: ans.selectedOption || null,
                    status: ans.status || q.status || 'unattempted',
                    timeTaken: ans.timeTaken || q.timeTaken || 0,
                    timeRemaining: (qId === testData.questions[currentQuestionIndex]?.questionId?._id) ? timeLeft : q.timeRemaining
                };
            });

            await axios.post(`/api/tests/${id}/submit`, { answers: answersArray }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/test/result/${id}`);
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    if (!testData || !testData.questions || testData.questions.length === 0) return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-4">
                <AlertCircle size={48} className="text-red-500 mx-auto" />
                <h2 className="text-xl font-bold text-gray-900">Test Data Loading Error</h2>
                <p className="text-gray-500">We couldn't load the questions for this test. This might happen if the test was deleted or the data is incomplete.</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 bg-primary text-white rounded-xl font-bold"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );

    const currentAttemptQ = testData.questions[currentQuestionIndex];
    if (!currentAttemptQ || !currentAttemptQ.questionId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-4">
                    <AlertCircle size={48} className="text-red-500 mx-auto" />
                    <h2 className="text-xl font-bold text-gray-900">Question Not Found</h2>
                    <p className="text-gray-500">Current question appears to be missing. Please try refreshing or starting a new test.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2 bg-primary text-white rounded-xl font-bold"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = currentAttemptQ?.questionId;
    if (!currentQ || typeof currentQ !== 'object') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-4">
                    <AlertCircle size={48} className="text-orange-500 mx-auto" />
                    <h2 className="text-xl font-bold text-gray-900">Loading Question Details...</h2>
                    <p className="text-gray-500">Wait a moment while we fetch the latest question data. If this persists, try refreshing.</p>
                </div>
            </div>
        );
    }
    const currentAnswer = answers[currentQ._id]?.selectedOption;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                        QA
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900">Quantitative Aptitude</h1>
                        <p className="text-xs text-gray-500">Test ID: {id.slice(-6).toUpperCase()}</p>
                    </div>
                </div>

                <div className={`
                    flex items-center space-x-3 px-5 py-2 rounded-full font-mono font-bold text-lg shadow-inner
                    ${timeLeft < 300 ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-gray-100 text-gray-700 border border-gray-200'}
                `}>
                    <Clock size={20} />
                    <span>{formatTime(timeLeft)}</span>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? 'Submitting...' : 'Finish Test'}
                </button>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-4xl mx-auto">
                        {/* Progress Bar */}
                        <div className="mb-8 flex items-center justify-between text-sm text-gray-500">
                            <span>Question {currentQuestionIndex + 1} of {testData.questions.length}</span>
                            <span>{Math.round(((currentQuestionIndex + 1) / testData.questions.length) * 100)}% Completed</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-10 overflow-hidden">
                            <div
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${((currentQuestionIndex + 1) / testData.questions.length) * 100}%` }}
                            ></div>
                        </div>

                        {/* Question Card */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-12 mb-8 animate-fade-in relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>

                            <h2 className="text-xl lg:text-2xl font-medium text-gray-900 leading-relaxed mb-8">
                                {currentQ.text}
                            </h2>

                            <div className="space-y-4">
                                {currentQ.options.map(opt => (
                                    <div
                                        key={opt.id}
                                        onClick={() => handleOptionSelect(opt.id)}
                                        className={`
                                            group p-4 lg:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center
                                            ${currentAnswer === opt.id
                                                ? 'border-primary bg-primary/5 shadow-md'
                                                : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0
                                            ${currentAnswer === opt.id ? 'border-primary bg-primary text-white' : 'border-gray-300 group-hover:border-gray-400'}
                                        `}>
                                            {currentAnswer === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <span className={`text-lg transition-colors ${currentAnswer === opt.id ? 'text-primary font-medium' : 'text-gray-700'}`}>
                                            {opt.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between items-center">
                            <button
                                disabled={currentQuestionIndex === 0 || (currentQuestionIndex > 0 && isQuestionLocked(currentQuestionIndex - 1))}
                                onClick={handlePrev}
                                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={20} />
                                <span>Previous</span>
                            </button>
                            <button
                                disabled={currentQuestionIndex === testData.questions.length - 1}
                                onClick={handleNext}
                                className="flex items-center space-x-2 px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all hover:-translate-y-1"
                            >
                                <span>Next</span>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto hidden lg:block p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center">
                        <LayoutGrid size={18} className="mr-2 text-primary" />
                        Question Palette
                    </h3>

                    <div className="grid grid-cols-4 gap-3">
                        {testData.questions.map((q, idx) => {
                            const isAnswered = answers[q.questionId._id]?.selectedOption;
                            const isCurrent = idx === currentQuestionIndex;
                            const isLocked = isQuestionLocked(idx);

                            return (
                                <button
                                    key={q.questionId._id}
                                    onClick={() => !isLocked && setCurrentQuestionIndex(idx)}
                                    disabled={isLocked}
                                    className={`
                                        h-10 rounded-lg font-medium text-sm transition-all relative
                                        ${isCurrent ? 'ring-2 ring-primary ring-offset-2 z-10' : ''}
                                        ${isLocked
                                            ? 'bg-red-50 text-red-300 border border-red-100 cursor-not-allowed'
                                            : isAnswered
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    {isLocked ? (
                                        <AlertCircle size={12} className="mx-auto" />
                                    ) : (
                                        <>
                                            {isAnswered && (
                                                <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                            )}
                                            {idx + 1}
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-8 p-4 bg-gray-50 rounded-xl space-y-3">
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Answered</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                            <span>Locked (Timed Out)</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <div className="w-3 h-3 bg-white border-2 border-primary rounded-lg"></div>
                            <span>Current</span>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default TestEngine;
