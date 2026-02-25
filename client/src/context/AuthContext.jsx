import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, characterAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('finquest_token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await authAPI.getMe();
            setUser(data.user);
            setCharacter(data.character);
        } catch {
            localStorage.removeItem('finquest_token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const { data } = await authAPI.login({ email, password });
            localStorage.setItem('finquest_token', data.token);
            setUser(data.user);
            setCharacter(data.character);
            return data;
        } catch (err) {
            const msg = err.response?.data?.error || 'Login failed';
            setError(msg);
            throw new Error(msg);
        }
    };

    const register = async (username, email, password) => {
        try {
            setError(null);
            const { data } = await authAPI.register({ username, email, password });
            localStorage.setItem('finquest_token', data.token);
            setUser(data.user);
            return data;
        } catch (err) {
            const msg = err.response?.data?.error || 'Registration failed';
            setError(msg);
            throw new Error(msg);
        }
    };

    const logout = () => {
        localStorage.removeItem('finquest_token');
        setUser(null);
        setCharacter(null);
    };

    const refreshCharacter = async () => {
        try {
            const { data } = await characterAPI.getMe();
            setCharacter(data.character);
            return data.character;
        } catch {
            return null;
        }
    };

    const createCharacter = async (name) => {
        try {
            const { data } = await characterAPI.create({ name });
            setCharacter(data.character);
            return data;
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Failed to create character');
        }
    };

    return (
        <AuthContext.Provider value={{
            user, character, loading, error,
            login, register, logout,
            refreshCharacter, createCharacter,
            setError,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export default AuthContext;
