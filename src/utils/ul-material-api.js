import axios from './axios';

export const fetchUlMaterialList = async (params = {}) => {
  try {
    const response = await axios.get('/ul/list-ul', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching UL material data:', error);
    throw error;
  }
};

export const createUlMaterial = async (data) => {
  try {
    const response = await axios.post('/ul/create-ul', data);
    return response.data;
  } catch (error) {
    console.error('Error creating UL material:', error);
    throw error;
  }
};

export const updateUlMaterial = async (id, data) => {
  try {
    const response = await axios.put(`/ul/update-ul/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating UL material:', error);
    throw error;
  }
};

export const deleteUlMaterial = async (id) => {
  try {
    const response = await axios.delete(`/ul/delete-ul/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting UL material:', error);
    throw error;
  }
};

export const exportUlMaterial = async () => {
  try {
    const response = await axios.get('/ul/export-ul', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting UL material:', error);
    throw error;
  }
};
