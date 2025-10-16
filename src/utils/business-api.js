import axios from './axios';

// Business Management API service
export const businessApi = {
  // Lấy danh sách business
  getBusinesses: async () => {
    try {
      const response = await axios.get('/bussiness');
      return response.data;
    } catch (error) {
      console.error('Error fetching businesses:', error);
      throw error;
    }
  },

  // Tạo business mới
  createBusiness: async (data) => {
    try {
      const response = await axios.post('/bussiness', data);
      return response.data;
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  },

  // Cập nhật business
  updateBusiness: async (businessId, data) => {
    try {
      const response = await axios.put(`/bussiness/${businessId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating business:', error);
      throw error;
    }
  },

  // Xóa business (soft delete)
  deleteBusiness: async (businessId) => {
    try {
      const response = await axios.delete(`/bussiness/${businessId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting business:', error);
      throw error;
    }
  },

  // Lấy chi tiết business
  getBusinessById: async (businessId) => {
    try {
      const response = await axios.get(`/bussiness/${businessId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business details:', error);
      throw error;
    }
  },

  // Lấy danh sách projects theo business
  getProjectsByBusiness: async (businessId) => {
    try {
      const response = await axios.get(`/bussiness/${businessId}/projects`);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }
};

export default businessApi;
