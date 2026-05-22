import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import {
    Users, BookOpen, Activity, LogOut, Shield,
    Database, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const [statsData, setStatsData] = useState({
        users: '-',
        questions: '-',
        activeTests: '-'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const { data } = await axios.get('/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setStatsData(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                if (error.response?.status === 401) {
                    logout();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [navigate, logout]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Cleaner Admin Navbar */}
            <nav className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Shield size={20} className="text-primary" />
                    <span className="text-lg font-bold tracking-tight">Admin <span className="text-primary">Panel</span></span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold">{user?.name}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <main className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
                <header>
                    <h1 className="text-2xl font-bold">Dashboard Overview</h1>
                    <p className="text-gray-500 text-sm">Quick summary of the platform status.</p>
                </header>

                {/* Simplified Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Students', key: 'users', icon: Users, color: 'text-blue-500' },
                        { title: 'Questions', key: 'questions', icon: BookOpen, color: 'text-purple-500' },
                        { title: 'Live Tests', key: 'activeTests', icon: Activity, color: 'text-green-500' }
                    ].map((stat, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <stat.icon size={20} className={stat.color} />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</span>
                            </div>
                            <p className="text-3xl font-bold">
                                {loading ? '...' : statsData[stat.key]}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="group bg-white border border-gray-200 rounded-[1.5rem] p-8 text-left hover:border-primary/50 transition-all shadow-sm"
                    >
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 mb-4">
                            <Users size={24} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">User Management</h2>
                        <p className="text-gray-500 text-sm mb-6">Manage students, roles, and view test attempts.</p>
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                            Open Manager <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/admin/questions')}
                        className="group bg-white border border-gray-200 rounded-[1.5rem] p-8 text-left hover:border-primary/50 transition-all shadow-sm"
                    >
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 mb-4">
                            <BookOpen size={24} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Question Bank</h2>
                        <p className="text-gray-500 text-sm mb-6">Upload, edit, and organize exam content.</p>
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                            Open Manager <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
