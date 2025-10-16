import axios from './axios';

// Project Management API service
export const projectApi = {
  // Lấy danh sách projects theo business
  getProjectsByBusiness: async (businessId) => {
    try {
      const response = await axios.get(`/bussiness/${businessId}/projects`);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Tạo project mới
  createProject: async (data) => {
    try {
      const response = await axios.post('/bussiness/projects', data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Cập nhật project
  updateProject: async (projectId, data) => {
    try {
      const response = await axios.put(`/bussiness/projects/${projectId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Xóa project
  deleteProject: async (projectId) => {
    try {
      const response = await axios.delete(`/bussiness/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Lấy chi tiết project
  getProjectById: async (projectId) => {
    try {
      const response = await axios.get(`/bussiness/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project details:', error);
      throw error;
    }
  }
};

export default projectApi;