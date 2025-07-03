import axios from 'axios';

const API_URL = 'http://192.84.105.173:5000/api';

export const fetchMaterialDecideList = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(`${API_URL}/large-size/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
export const fetchMaterialDecideCustomerList = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(`${API_URL}/large-size/customers`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createMaterialDecide = async (data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(`${API_URL}/large-size/create`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateMaterialDecide = async (id, data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.put(`${API_URL}/large-size/update/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteMaterialDecide = async (id) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.delete(`${API_URL}/large-size/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};