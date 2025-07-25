import axios from './axios';

export const fetchMaterialNewList = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(`/material-new/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createMaterialNew = async (data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(`/material-new/create`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateMaterialNew = async (id, data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.put(`/material-new/update/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteMaterialNew = async (id) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.delete(`/material-new/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchMaterialNewHistory = async (id) => {
  const token = localStorage.getItem('accessToken');
  try {
    const response = await axios.get(`/material-new-history/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};


export const exportMaterialNew = async (data) => {
  const token = localStorage.getItem('accessToken');
  const normalizeKeys = (obj) => {
    const result = {};
    Object.keys(obj).forEach((key) => {
      result[key.toUpperCase()] = obj[key];
    });
    return result;
  };
  const normalizedData = Array.isArray(data) ? data.map(normalizeKeys) : data;
  const response = await axios.post(
    `/material-new/export-xlsm`,
    { data: normalizedData },
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob', 
    }
  );
  return response;
};
