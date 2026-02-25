import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('finquest_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('finquest_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Character API
export const characterAPI = {
    create: (data) => api.post('/characters', data),
    getMe: () => api.get('/characters/me'),
    update: (data) => api.put('/characters/me', data),
    getStats: () => api.get('/characters/stats'),
};

// Quest API
export const questAPI = {
    getAll: (params) => api.get('/quests', { params }),
    getCategories: () => api.get('/quests/categories'),
    getById: (id) => api.get(`/quests/${id}`),
    accept: (id) => api.post(`/quests/${id}/accept`),
    submit: (id, answers) => api.post(`/quests/${id}/submit`, { answers }),
};

// Achievement API
export const achievementAPI = {
    getAll: () => api.get('/achievements'),
    getMy: () => api.get('/achievements/my'),
};

// Leaderboard API
export const leaderboardAPI = {
    get: (params) => api.get('/leaderboard', { params }),
};

// Social API
export const socialAPI = {
    getFriends: () => api.get('/social/friends'),
    getRequests: () => api.get('/social/requests'),
    addFriend: (username) => api.post('/social/add', { username }),
    acceptFriend: (id) => api.put(`/social/accept/${id}`),
    compare: (userId) => api.post(`/social/compare/${userId}`),
    search: (q) => api.get('/social/search', { params: { q } }),
};

// Mini-game API
export const minigameAPI = {
    submitScore: (data) => api.post('/minigames/score', data),
    getHistory: () => api.get('/minigames/history'),
    getBest: () => api.get('/minigames/best'),
};

export default api;
