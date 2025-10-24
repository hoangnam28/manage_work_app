import axios from './axios';

// Project Management API service
export const projectApi = {
  // Lấy danh sách projects theo business
 getProjectById: async (projectId) => {
  try {
    const response = await axios.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project details:', error);
    throw error;
  }
},
getProjectsByBusiness: async (businessId) => {
    try {
      // ✅ Cập nhật đường dẫn mới
      const response = await axios.get(`/projects/business/${businessId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },


  // Tạo project mới
  createProject: async (data) => {
    try {
      const response = await axios.post('/projects', data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Cập nhật project
  updateProject: async (projectId, data) => {
    try {
      const response = await axios.put(`/projects/${projectId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Xóa project
  deleteProject: async (projectId) => {
    try {
      const response = await axios.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },
  getBusinessById: async (businessId) => {
    try {
      const response = await axios.get(`/bussiness/${businessId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business details:', error);
      throw error;
    }
  },
};

 

export default projectApi;