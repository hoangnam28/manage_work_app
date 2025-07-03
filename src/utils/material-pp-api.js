import axios from 'axios';

const API_URL = 'http://192.84.105.173:5000/api';

export const fetchMaterialPpList = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(`${API_URL}/material-pp/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createMaterialPp = async (data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(`${API_URL}/material-pp/create`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateMaterialPp = async (id, data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.put(`${API_URL}/material-pp/update/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteMaterialPp = async (id) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.delete(`${API_URL}/material-pp/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const exportMaterialPp = async (data) => {
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
    `${API_URL}/material-pp/export-xlsm`,
    { data: normalizedData },
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob', 
    }
  );
  return response;
};
