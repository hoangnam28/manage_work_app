import axios from './axios';

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
    const response = await axios.post(`/impedance/create-impedance`, data);
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
    const response = await axios.put(`/impedance/update-impedance/${impId}`, data);
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
    const response = await axios.put(`/impedance/soft-delete-impedance/${idStr}`, {}); // Gửi object rỗng
    return response.data;
  } catch (error) {
    console.error('Error soft deleting impedance:', error);
    throw error;
  }
};

export const importImpedance = async (data) => {
  try {
    const response = await axios.post(`/impedance/import-impedance`, { data });
    return response.data;
  } catch (error) {
    console.error('Error importing impedance:', error);
    throw error;
  }
};

export const bulkDeleteImpedancesByProduct = async (productCode) => {
  try {
    // Axios tự động gửi token từ interceptor, không cần thêm headers thủ công
    const response = await axios.put(`/impedance/bulk-delete-by-product/${productCode}`, {}); // Gửi object rỗng
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting impedances:', error);
    // Axios tự động throw error với response data
    throw error.response?.data?.message || error.message || 'Có lỗi xảy ra';
  }
};