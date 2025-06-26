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
  // Chuyển đổi key thường sang key viết hoa trước khi gửi sang backend export
  const normalizeKeys = (obj) => {
    const result = {};
    Object.keys(obj).forEach((key) => {
      result[key.toUpperCase()] = obj[key];
    });
    return result;
  };
  // Nếu là mảng thì map, nếu không thì giữ nguyên
  const normalizedData = Array.isArray(data) ? data.map(normalizeKeys) : data;
  const response = await axios.post(
    `${API_URL}/material-core/export-xlsm`,
    { data: normalizedData },
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob', 
    }
  );
  return response;
};
