import axios from './axios';
import { data } from 'react-router-dom';


export const fetchImpedanceData = async () => {
  try {
    const response = await axios.get(`/impedance/list-impedance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching impedance data:', error);
    throw error;
  }
};


export const createImpedance = async (data) => {
  try {
    const response = await axios.post(`/impedance/create-impedance`, 
      data
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
    const response = await axios.put(
      `/impedance/update-impedance/${impId}`,
      data
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
    const response = await axios.put(`/impedance/soft-delete-impedance/${idStr}`,
     data
    );
    return response.data;
  } catch (error) {
    console.error('Error soft deleting impedance:', error);
    throw error;
  }
};

export const importImpedance = async (data) => {
  try {
    const response = await axios.post(
      `/impedance/import-impedance`,
      { data }
    );
    return response.data;
  } catch (error) {
    console.error('Error importing impedance:', error);
    throw error;
  }
};

export const bulkDeleteImpedancesByProduct = async (productCode) => {
  try {
    const response = await axios.put(
      `/impedance/bulk-delete-by-product/${productCode}`,
      null
    );
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting impedances:', error);
    throw error;
  }
};