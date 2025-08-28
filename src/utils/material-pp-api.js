import axios from './axios';

export const fetchMaterialPpList = async (params = {}) => {
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
  
  const response = await axios.get(`/material-pp/list`, {
    headers: { Authorization: `Bearer ${token}` },
    params: queryParams
  });
  
  return response.data;
};
export const createMaterialPp = async (data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(`/material-pp/create`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateMaterialPp = async (id, data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.put(`/material-pp/update/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteMaterialPp = async (id) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.delete(`/material-pp/delete/${id}`, {
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
    `/material-pp/export-xlsm`,
    { data: normalizedData },
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob', 
    }
  );
  return response;
};

export const fetchMaterialPpHistory = async (id) => {
  const token = localStorage.getItem('accessToken');
  try {
    const response = await axios.get(`/material-pp-history/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};

