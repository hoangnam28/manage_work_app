import axios from 'axios';

export const fetchImpedanceData = async () => {
  try {
    const response = await axios.get('http://192.84.105.173:5000/api/impedance/list-impedance');
    return response.data;
  } catch (error) {
    console.error('Error fetching impedance data:', error);
    throw error;
  }
};