import axios from 'axios';

// Create a new axios instance with a base URL
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Your backend server URL
});

// IMPORTANT: Add an interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    // Get the user data from local storage
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.token) {
      // If the user and token exist, add the Authorization header
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;