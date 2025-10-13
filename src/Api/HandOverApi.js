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
    const uid = localStorage.getItem('uidd');
    const password = localStorage.getItem('password');
    if (!uid || !password) {
      throw new Error('Authentication credentials not found in localStorage');
    }
    const payload = { uid, password };
    const response = await api.post('/get_Handover/', payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Creates or updates a task via the backend API
 * @param {Object} taskData - Task data object
 * @returns {Promise} API response
 */
export const saveTask = async (taskData) => {
  try {
    const response = await api.post('/saveNew_task/', taskData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
