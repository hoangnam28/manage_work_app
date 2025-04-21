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


export const createImpedance = async (data) => {
  try {
    const response = await axios.post('http://192.84.105.173:5000/api/impedance/create-impedance', data);
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
    const response = await axios.put(`http://192.84.105.173:5000/api/impedance/update-impedance/${impId}`, data);
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
    const response = await axios.put(`http://192.84.105.173:5000/api/impedance/soft-delete-impedance/${idStr}`);
    return response.data;
  } catch (error) {
    console.error('Error soft deleting impedance:', error);
    throw error;
  }
};