import axios from 'axios';

// Create axios instance with custom configuration
const api = axios.create({
  baseURL: 'https://10.191.171.12:5443/EISHOME_TEST/shiftHandover',
 // baseURL: 'https://10.191.171.12:5443/EISHOME/'
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  }
});
