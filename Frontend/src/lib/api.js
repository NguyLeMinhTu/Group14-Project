import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

// Set axios baseURL
axios.defaults.baseURL = API_BASE;

export function setAuthFromLocalStorage() {
    const token = localStorage.getItem('token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
}

export function clearAuth() {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
}

export default axios;
