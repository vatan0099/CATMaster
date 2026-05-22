import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { ArrowRight, BookOpen } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            // Get user from store or local storage to check role
            const user = JSON.parse(localStorage.getItem('user'));
            if (user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }
    };

    return (
        <div className="min-h-screen flex text-gray-900 font-sans overflow-hidden bg-gradient-to-br from-gray-50 to-primary/10">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-20 relative z-10 animate-fade-in">
                <div className="w-full max-w-md space-y-8 glass-panel p-10 rounded-3xl shadow-2xl relative overflow-hidden">

                    {/* Decorative Blob */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>

                    <div className="text-center relative">
                        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transform rotate-3">
                            <BookOpen className="text-primary" size={32} />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Sign in to continue your preparation journey.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="block w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-gray-900 placeholder-gray-500 font-medium"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="block w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-gray-900 placeholder-gray-500 font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium animate-slide-up">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center py-3.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                            {!isLoading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    {/* Sign Up Link Removed for Invite Only Mode */}
                </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:flex flex-1 bg-primary relative items-center justify-center overflow-hidden" style={{ backgroundColor: '#9C4145' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover opacity-90 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-20 filter grayscale mix-blend-overlay"></div>

                <div className="relative z-10 max-w-lg text-center px-8 text-white">
                    <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight text-shadow">
                        Master Your<br />Future
                    </h1>
                    <p className="text-lg text-white/80 leading-relaxed font-light">
                        "Success is not final, failure is not fatal: it is the courage to continue that counts."
                    </p>
                </div>

                {/* Abstract Shapes */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default Login;
