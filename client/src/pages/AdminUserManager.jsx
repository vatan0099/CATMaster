import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    ArrowLeft, Trash2, Upload, AlertCircle, CheckCircle,
    Users as UsersIcon, FileJson, Mail, Shield, ShieldCheck,
    UserPlus, Search, ChevronRight, List, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';

const AdminUserManager = () => {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'student', 'admin', 'import'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Import State
    const [jsonInput, setJsonInput] = useState('');
    const [importStatus, setImportStatus] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const { data } = await axios.get('/api/auth/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            if (error.response?.status === 401) {
                logout();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [navigate, logout]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user? This cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/auth/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u._id !== id));
        } catch (error) {
            alert('Failed to delete user');
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
            const { data } = await axios.post('/api/auth/users/bulk', parsedData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setImportStatus({ type: 'success', message: data.message });
            setJsonInput('');
            fetchUsers();
        } catch (error) {
            const msg = error.response?.data?.message || 'Invalid JSON format';
            setImportStatus({ type: 'error', message: msg });
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const roleMatch = activeTab === 'all' ||
                (activeTab === 'student' && (u.role || 'student') === 'student') ||
                (activeTab === 'admin' && u.role === 'admin');

            const matchesSearch =
                (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
            return roleMatch && matchesSearch;
        });
    }, [users, activeTab, searchQuery]);

    const stats = useMemo(() => ({
        total: users.length,
        students: users.filter(u => (u.role || 'student') === 'student').length,
        admins: users.filter(u => u.role === 'admin').length
    }), [users]);

    const setSampleImport = (role) => {
        const sample = [{
            "name": role === 'admin' ? "Admin User" : "John Doe",
            "email": role === 'admin' ? "admin@example.com" : "john@example.com",
            "password": "password123",
            "role": role
        }];
        setJsonInput(JSON.stringify(sample, null, 2));
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold">User Management</h1>
                            <p className="text-gray-500 text-xs">Manage students and administrators</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex gap-4">
                        <div className="text-center px-4 border-r border-gray-100">
                            <p className="text-xs text-gray-400 font-bold uppercase">Total</p>
                            <p className="text-lg font-bold">{stats.total}</p>
                        </div>
                        <div className="text-center px-4 border-r border-gray-100">
                            <p className="text-xs text-blue-400 font-bold uppercase">Students</p>
                            <p className="text-lg font-bold">{stats.students}</p>
                        </div>
                        <div className="text-center px-4">
                            <p className="text-xs text-purple-400 font-bold uppercase">Admins</p>
                            <p className="text-lg font-bold">{stats.admins}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {[
                            { id: 'all', label: 'All Users', icon: List },
                            { id: 'student', label: 'Students', icon: UsersIcon },
                            { id: 'admin', label: 'Admins', icon: ShieldCheck },
                            { id: 'import', label: 'Bulk Import', icon: Upload }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab !== 'import' && (
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-primary/50 outline-none text-sm shadow-sm"
                            />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {activeTab === 'import' ? (
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold">Bulk User Import</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setSampleImport('student')} className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">Student Template</button>
                                    <button onClick={() => setSampleImport('admin')} className="text-[10px] font-bold text-purple-500 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100">Admin Template</button>
                                </div>
                            </div>

                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                className="w-full h-80 p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs outline-none focus:bg-white transition-all"
                                placeholder='Paste JSON array here...'
                            ></textarea>

                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500 max-w-md">
                                    Note: Required fields are <b>name, email, password</b>. Role is optional (defaults to student).
                                </div>
                                <button
                                    onClick={handleImport}
                                    disabled={!jsonInput.trim()}
                                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    Import Users
                                </button>
                            </div>

                            {importStatus && (
                                <div className={`p-4 rounded-xl text-xs font-bold border ${importStatus.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {importStatus.message}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="py-20 flex justify-center">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="py-20 text-center text-gray-400 text-sm">No users found.</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Joined</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredUsers.map(u => (
                                            <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold leading-none mb-1">{u.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-medium">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${u.role === 'admin' ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'}`}>
                                                        {u.role || 'student'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-xs">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {u.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handleDelete(u._id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUserManager;
