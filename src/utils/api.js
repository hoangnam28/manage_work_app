import axios from 'axios';
import { data } from 'react-router-dom';

export const fetchImpedanceData = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get('http://192.84.105.173:5000/api/impedance/list-impedance', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching impedance data:', error);
    throw error;
  }
};


export const createImpedance = async (data) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post('http://192.84.105.173:5000/api/impedance/create-impedance', 
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating impedance:', error);
    throw error;
  }
};

export const updateImpedance = async (impId, data) => {
  if (!impId || impId === 'undefined' || impId === 'null') {
    throw new Error('ID không hợp lệ');
  }
  
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.put(
      `http://192.84.105.173:5000/api/impedance/update-impedance/${impId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating impedance:', error);
    throw error;
  }
};

export const softDeleteImpedance = async (impId) => {
  const idStr = String(impId).trim();
  if (!idStr || idStr === 'undefined' || idStr === 'null' || idStr === 'NaN') {
    console.error('Invalid impedance ID provided for soft delete:', impId);
    throw new Error('ID không hợp lệ');
  }
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.put(`http://192.84.105.173:5000/api/impedance/soft-delete-impedance/${idStr}`,
     data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error soft deleting impedance:', error);
    throw error;
  }
};