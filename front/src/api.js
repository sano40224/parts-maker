import axios from 'axios';

const BASE_URL = 'https://parts-maker-api.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

export default api;