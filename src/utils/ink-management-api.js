import axios from './axios';

// Lấy danh sách yêu cầu màu mực
export const fetchInkList = async () => {
  const token = localStorage.getItem('accessToken');
    const response = await axios.get(`/ink-management/list`,{
    headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;

};

export const createInkRequest = async (data) => {
     const token = localStorage.getItem('accessToken');
    const response = await axios.post(`/ink-management/create`, data,{
    headers: { Authorization: `Bearer ${token}` }
  });
    return response.data;
};

export const updateInkRequest = async (id, data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.put(`/ink-management/update/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const approveInkRequest = async (id) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.put(`/ink-management/approve/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteInkRequest = async (id) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.put(`/ink-management/delete/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
