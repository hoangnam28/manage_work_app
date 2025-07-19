import axios from 'axios';
import { data } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const fetchImpedanceData = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${BASE_URL}/impedance/list-impedance`, {
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
    const response = await axios.post(`${BASE_URL}/impedance/create-impedance`, 
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
      `${BASE_URL}/impedance/update-impedance/${impId}`,
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
    const response = await axios.put(`${BASE_URL}/impedance/soft-delete-impedance/${idStr}`,
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

export const importImpedance = async (data) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${BASE_URL}/impedance/import-impedance`,
      { data },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error importing impedance:', error);
    throw error;
  }
};

export const bulkDeleteImpedancesByProduct = async (productCode) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.put(
      `${BASE_URL}/impedance/bulk-delete-by-product/${productCode}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting impedances:', error);
    throw error;
  }
};