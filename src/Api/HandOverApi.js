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
 * Retrieves uid and password from localStorage and sends them in the request body
 * @returns {Promise} API response containing handover data
 * @throws {Error} If credentials are not found or API call fails
 */
export const getHandovers = async () => {
  try {
    console.log('Getting credentials from localStorage...');
    const uid = localStorage.getItem('uidd');
    const password = localStorage.getItem('password');

    console.log('UID:', uid ? 'Found' : 'Not found');
    console.log('Password:', password ? 'Found' : 'Not found');

    if (!uid || !password) {
      throw new Error('Authentication credentials not found in localStorage');
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

    console.log('API Response received:', response);
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
