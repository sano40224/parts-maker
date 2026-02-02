import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // FlaskのURL
  withCredentials: true
});

export default api;