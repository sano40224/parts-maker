import axios from 'axios';

const isProduction = import.meta.env.MODE === 'production';

const BASE_URL = isProduction
  ? 'https://parts-maker.onrender.com/api'  // 本番 (Render)
  : 'http://localhost:5000/api';            // ローカル (Flask)

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;