import axios from './axios';

export const fetchMaterialDecideList = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(`/large-size/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
export const fetchMaterialDecideCustomerList = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(`/large-size/customers`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createMaterialDecide = async (data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(`/large-size/create`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateMaterialDecide = async (id, data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.put(`/large-size/update/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteMaterialDecide = async (id) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.delete(`/large-size/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const restoreMaterialDecide = async (id) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.put(`/large-size/restore/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const cancelRequestMaterialDecide = async (id, data = {}) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.put(`/large-size/cancel-request/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};