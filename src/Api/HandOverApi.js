import axios from 'axios';

// Create axios instance with custom configuration
const api = axios.create({
  baseURL: 'https://10.191.171.12:5443/EISHOME_TEST/shiftHandover',
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Fetches handovers from the API
 * Retrieves uid and password from memory (passed as parameters)
 * @param {string} uid - User ID
 * @param {string} password - User password
 * @returns {Promise} API response containing handover data
 * @throws {Error} If credentials are not provided or API call fails
 */
export const getHandovers = async (uid, password) => {
  try {
    console.log('Getting handovers with credentials...');
    
    if (!uid || !password) {
      throw new Error('Authentication credentials are required');
    }
    
    const payload = {
      uid,
      password,
    };
    
    console.log('Making API call to:', api.defaults.baseURL + '/get_Handover/');
    console.log('Payload:', { uid, password: '***' }); // Hide password in logs
    
    const response = await api.post('/get_Handover/', payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('API Response received:', response.data);
    
    // Return the data directly
    return response.data;
  } catch (error) {
    console.error('Could not fetch handovers:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

/**
 * Helper function to store credentials in memory
 * This should be called after user login
 */
let storedCredentials = null;

export const setCredentials = (uid, password) => {
  storedCredentials = { uid, password };
};

export const getStoredCredentials = () => {
  return storedCredentials;
};

export const clearCredentials = () => {
  storedCredentials = null;
};
