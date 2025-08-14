import axios from './axios';

// ✅ SỬA: Đơn giản hóa cách truyền tham số search
export const fetchMaterialNewList = async (params = {}) => {
  const token = localStorage.getItem('accessToken');
  const { page = 1, pageSize = 20, ...searchParams } = params;
  
  console.log('API call params:', { page, pageSize, searchParams });
  
  // ✅ Trực tiếp sử dụng các tham số search mà không cần prefix
  const queryParams = {
    page,
    pageSize,
    ...searchParams // Trực tiếp spread các search parameters
  };
  
  console.log('Final query params:', queryParams);
  
  const response = await axios.get(`/material-new/list`, {
    headers: { Authorization: `Bearer ${token}` },
    params: queryParams
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