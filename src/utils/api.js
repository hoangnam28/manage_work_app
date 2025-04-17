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
    
    // The backend now returns data already formatted with both uppercase and lowercase keys
    return response.data;
  } catch (error) {
    console.error('Error creating impedance:', error);
    throw error;
  }
};

export const updateImpedance = async (impId, data) => {
  // Validate the ID before making the request
  if (!impId || impId === 'undefined' || impId === 'null') {
    console.error('Invalid impedance ID provided for update:', impId);
    throw new Error('ID không hợp lệ');
  }
  
  try {
    console.log(`Sending PUT request to update impedance ID: ${impId}`);
    const response = await axios.put(`http://192.84.105.173:5000/api/impedance/update-impedance/${impId}`, data);
    
    // The backend now returns data formatted with both uppercase and lowercase keys
    return response.data;
  } catch (error) {
    console.error('Error updating impedance:', error);
    throw error;
  }
};

export const softDeleteImpedance = async (impId) => {
  // Convert to string and trim
  const idStr = String(impId).trim();
  
  // Check if ID is valid
  if (!idStr || idStr === 'undefined' || idStr === 'null' || idStr === 'NaN') {
    console.error('Invalid impedance ID provided for soft delete:', impId);
    throw new Error('ID không hợp lệ');
  }
  
  try {
    console.log(`Sending PUT request to soft delete impedance ID: ${idStr}`);
    const response = await axios.put(`http://192.84.105.173:5000/api/impedance/soft-delete-impedance/${idStr}`);
    return response.data;
  } catch (error) {
    console.error('Error soft deleting impedance:', error);
    throw error;
  }
};