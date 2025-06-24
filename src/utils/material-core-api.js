import axios from 'axios';

const API_URL = 'http://192.84.105.173:5000/api';

export const fetchMaterialCoreList = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(`${API_URL}/material-core/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createMaterialCore = async (data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(`${API_URL}/material-core/create`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateMaterialCore = async (id, data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.put(`${API_URL}/material-core/update/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteMaterialCore = async (id) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.delete(`${API_URL}/material-core/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const exportMaterialCore = async (data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(
    `${API_URL}/material-core/export`,
    { data },
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob', 
    }
  );
  return response;
};
