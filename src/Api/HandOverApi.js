
import axios from 'axios';

// Create axios instance with custom configuration
const api = axios.create({
  baseURL: 'https://10.191.171.12:5443/EISHOME_TEST/shiftHandover',
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  }
});



export const getHandovers = async () => {
  try {
    const uid = localStorage.getItem('uidd');
    const password = localStorage.getItem('password');
    
    const payload = {
      uid,
      password,
    };
    
    const response = await api.post('/get_Handover/', payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response;
  } catch (error) {
    console.error('Could not fetch handovers:', error);
    throw error;
  }
};
