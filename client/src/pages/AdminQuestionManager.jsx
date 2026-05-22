import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    ArrowLeft, Trash2, Upload, AlertCircle, CheckCircle,
    Database, FileJson, ChevronDown, ChevronRight, Filter, Search,
    Layers, List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';

const AdminQuestionManager = () => {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'import'
    const [viewMode, setViewMode] = useState('topic'); // 'flat' or 'topic'
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedTopics, setExpandedTopics] = useState({});

    // Import State
    const [jsonInput, setJsonInput] = useState('');
    const [importStatus, setImportStatus] = useState(null);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const { data } = await axios.get('/api/questions/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestions(data);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            if (error.response?.status === 401) {
                logout();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [navigate, logout]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this question?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/questions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestions(questions.filter(q => q._id !== id));
        } catch (error) {
            alert('Failed to delete question');
        }
    };

    const handleImport = async () => {
        setImportStatus(null);
        try {
            let parsedData = JSON.parse(jsonInput);
            if (!Array.isArray(parsedData)) {
                parsedData = [parsedData];
            }

            const token = localStorage.getItem('token');
            const { data } = await axios.post('/api/questions/bulk', parsedData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setImportStatus({ type: 'success', message: data.message });
            setJsonInput('');
            fetchQuestions();
        } catch (error) {
            const msg = error.response?.data?.message || 'Invalid JSON format';
            setImportStatus({ type: 'error', message: msg });
        }
    };

    const filteredQuestions = useMemo(() => {
        if (!searchQuery.trim()) return questions;
        const q = searchQuery.toLowerCase();
        return questions.filter(item =>
            item.text.toLowerCase().includes(q) ||
            item.topicId?.name.toLowerCase().includes(q) ||
            item.subjectId?.name.toLowerCase().includes(q)
        );
    }, [questions, searchQuery]);

    const groupedData = useMemo(() => {
        if (viewMode === 'flat') return null;
        const groups = {};
        filteredQuestions.forEach(q => {
            const subject = q.subjectId?.name || 'Unassigned';
            const topic = q.topicId?.name || 'Unassigned';
            const key = `${subject} > ${topic}`;
            if (!groups[key]) groups[key] = { subject, topic, items: [] };
            groups[key].items.push(q);
        });
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [filteredQuestions, viewMode]);

    const toggleTopic = (key) => {
        setExpandedTopics(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold font-heading">Question Bank</h1>
                            <p className="text-gray-500 text-xs">Manage and organize exam content</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {activeTab === 'list' && (
                            <>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search questions..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary/50 outline-none text-sm w-full sm:w-64"
                                    />
                                </div>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setViewMode('topic')}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'topic' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Topic View
                                    </button>
                                    <button
                                        onClick={() => setViewMode('flat')}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'flat' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Flat List
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Nav & Stats */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-4 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
                        {[
                            { id: 'list', label: 'All Questions', icon: Database },
                            { id: 'import', label: 'Bulk Import', icon: Upload }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'list' && (
                        <div className="flex gap-4 bg-white px-4 py-2 border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total: {questions.length}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                    {activeTab === 'list' ? (
                        <div className="flex flex-col h-full">
                            {loading ? (
                                <div className="flex-1 py-32 flex flex-col items-center justify-center gap-4">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Accessing repository...</p>
                                </div>
                            ) : viewMode === 'topic' ? (
                                <div className="divide-y divide-gray-100">
                                    {groupedData.length === 0 ? (
                                        <div className="py-20 text-center text-gray-400">No questions found.</div>
                                    ) : (
                                        groupedData.map(([key, group]) => (
                                            <div key={key}>
                                                <button
                                                    onClick={() => toggleTopic(key)}
                                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-xs font-bold">
                                                            {group.items.length}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold">{group.topic}</h3>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{group.subject}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandedTopics[key] ? 'rotate-180' : ''}`} />
                                                </button>

                                                {expandedTopics[key] && (
                                                    <div className="bg-gray-50/50 border-y border-gray-100">
                                                        <table className="w-full text-left">
                                                            <tbody className="divide-y divide-gray-100">
                                                                {group.items.map(q => (
                                                                    <tr key={q._id} className="hover:bg-white transition-colors group/row">
                                                                        <td className="px-6 py-4 pl-20">
                                                                            <p className="text-xs text-gray-600 line-clamp-1">{q.text}</p>
                                                                        </td>
                                                                        <td className="px-6 py-4 w-24">
                                                                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md
                                                                                ${q.difficulty === 'easy' ? 'bg-green-50 text-green-600' :
                                                                                    q.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                                                                                        'bg-red-50 text-red-600'}
                                                                            `}>
                                                                                {q.difficulty}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 w-16 text-right">
                                                                            <button
                                                                                onClick={() => handleDelete(q._id)}
                                                                                className="p-1.5 text-gray-300 hover:text-red-600 transition-colors"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Question</th>
                                            <th className="px-6 py-4">Topic</th>
                                            <th className="px-6 py-4 text-center">Difficulty</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredQuestions.length === 0 ? (
                                            <tr><td colSpan="4" className="py-20 text-center text-gray-400">No questions found.</td></tr>
                                        ) : (
                                            filteredQuestions.map((q) => (
                                                <tr key={q._id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs text-gray-700 font-medium line-clamp-1 max-w-lg">{q.text}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{q.topicId?.name}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md
                                                            ${q.difficulty === 'easy' ? 'bg-green-50 text-green-600' :
                                                                q.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                                                                    'bg-red-50 text-red-600'}
                                                        `}>
                                                            {q.difficulty}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDelete(q._id)}
                                                            className="p-1.5 text-gray-300 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ) : (
                        <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Bulk Question Import</h2>
                                <button
                                    onClick={() => setJsonInput(JSON.stringify([{
                                        "text": "Question goes here?",
                                        "options": [{ "id": "a", "text": "Option 1" }, { "id": "b", "text": "Option 2" }],
                                        "correctAnswer": "a",
                                        "difficulty": "easy",
                                        "subject": "Quantitative Aptitude",
                                        "topic": "Arithmetic",
                                        "solution": "Brief explanation"
                                    }], null, 2))}
                                    className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                                >
                                    Get Template
                                </button>
                            </div>

                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                className="w-full h-80 p-6 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs outline-none focus:bg-white focus:border-primary/50 transition-all shadow-inner"
                                placeholder='Paste your question JSON array here...'
                            ></textarea>

                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500 max-w-sm">Required fields: <b>text, options, correctAnswer, subject, topic</b>.</p>
                                <button
                                    onClick={handleImport}
                                    disabled={!jsonInput.trim()}
                                    className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    Import Content
                                </button>
                            </div>

                            {importStatus && (
                                <div className={`p-4 rounded-xl text-xs font-bold border transition-all animate-in fade-in slide-in-from-bottom-2 ${importStatus.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {importStatus.message}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminQuestionManager;
