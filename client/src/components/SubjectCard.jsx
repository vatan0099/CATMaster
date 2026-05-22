import React from 'react';
import { useNavigate } from 'react-router-dom';
import useTestStore from '../store/useTestStore';
import {
    Calculator,
    BookOpen,
    BarChart2,
    Lock,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
    'calculator': Calculator,
    'book-open': BookOpen,
    'bar-chart': BarChart2
};

const SubjectCard = ({ subject }) => {
    const navigate = useNavigate();
    const selectSubject = useTestStore(state => state.selectSubject);
    const Icon = iconMap[subject.icon] || BookOpen;

    const handleSelect = () => {
        if (subject.status !== 'active') return;
        selectSubject(subject);
        navigate('/test/config');
    };

    const isDisabled = subject.status !== 'active';

    return (
        <motion.div
            whileHover={!isDisabled ? { y: -8, scale: 1.02 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={handleSelect}
            className={`
                relative h-72 rounded-3xl p-8 flex flex-col justify-between overflow-hidden group
                ${isDisabled
                    ? 'cursor-not-allowed bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 opacity-60'
                    : 'cursor-pointer bg-gradient-to-br from-white via-blue-50/20 to-purple-50/30 border border-white/60 shadow-lg hover:shadow-2xl hover:shadow-primary/10'
                }
                backdrop-blur-sm transition-all duration-500
            `}
        >
            {/* Elegant background glow */}
            {!isDisabled && (
                <>
                    <motion.div
                        className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-primary/20 to-purple-400/20 rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </>
            )}

            {/* Header Content */}
            <div className="relative z-10 flex items-start justify-between">
                {/* Elegant Icon */}
                <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className={`
                        p-4 rounded-2xl flex items-center justify-center shadow-lg
                        ${isDisabled
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-gradient-to-br from-primary to-primary-hover text-white group-hover:shadow-xl group-hover:shadow-primary/30'
                        }
                        transition-all duration-300
                    `}
                >
                    <Icon size={32} strokeWidth={2} />
                </motion.div>

                {/* Active Badge */}
                {!isDisabled && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 shadow-sm"
                    >
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-green-700">Active</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Main Content */}
            <div className="relative z-10 space-y-3">
                <h3 className={`text-3xl font-bold ${isDisabled
                        ? 'text-gray-400'
                        : 'text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-600'
                    } transition-all duration-300`}>
                    {subject.name}
                </h3>
                <p className={`text-sm leading-relaxed ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isDisabled ? 'Coming soon - Stay tuned!' : 'Adaptive practice tests with instant feedback and detailed analytics'}
                </p>
            </div>

            {/* Footer Action */}
            <div className="relative z-10 flex items-center justify-between pt-6 border-t border-gray-200/50">
                <div className={`flex items-center gap-2 text-sm font-semibold ${isDisabled ? 'text-gray-400' : 'text-gray-700 group-hover:text-primary'
                    } transition-colors`}>
                    {!isDisabled && <Sparkles size={16} className="opacity-70" />}
                    <span>{isDisabled ? 'Locked' : 'Start Learning'}</span>
                </div>

                {/* Action Button */}
                <motion.div
                    whileHover={!isDisabled ? { x: 4 } : {}}
                    className={`
                        w-12 h-12 rounded-xl flex items-center justify-center shadow-md
                        ${isDisabled
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-gradient-to-br from-primary to-primary-hover text-white group-hover:shadow-lg group-hover:shadow-primary/40'
                        }
                        transition-all duration-300
                    `}
                >
                    {isDisabled ? (
                        <Lock size={20} />
                    ) : (
                        <ArrowRight size={20} strokeWidth={2.5} />
                    )}
                </motion.div>
            </div>

            {/* Decorative corner accent */}
            {!isDisabled && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
            )}
        </motion.div>
    );
};

export default SubjectCard;
