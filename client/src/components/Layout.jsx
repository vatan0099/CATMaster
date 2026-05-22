import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { LogOut, Home, User as UserIcon } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
            {/* Glassmorphism Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none">
                <div className="max-w-7xl mx-auto pointer-events-auto">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg shadow-gray-200/20 rounded-2xl px-6 h-16 flex items-center justify-between transition-all duration-300">

                        {/* Logo */}
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-primary/30 transition-all">
                                C
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-primary transition-colors">
                                CAT<span className="text-primary">Master</span>
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-primary font-medium transition-all"
                            >
                                <Home size={18} />
                                Dashboard
                            </button>

                            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                            {/* Profile Trigger */}
                            <div className="flex items-center gap-3 pl-2">
                                <div
                                    onClick={() => navigate('/profile')}
                                    className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 hidden sm:block">
                                        {user?.name?.split(' ')[0]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Content - Added top padding to account for fixed navbar */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
