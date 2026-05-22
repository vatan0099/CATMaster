import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });

            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);

            set({
                user: data,
                token: data.token,
                isAuthenticated: true,
                isLoading: false
            });
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Login failed',
                isLoading: false
            });
            return false;
        }
    },

    signup: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await axios.post('/api/auth/signup', { name, email, password });

            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);

            set({
                user: data,
                token: data.token,
                isAuthenticated: true,
                isLoading: false
            });
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Signup failed',
                isLoading: false
            });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));

export default useAuthStore;
