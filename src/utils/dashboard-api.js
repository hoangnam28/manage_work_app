import axios from './axios';

// Dashboard API service
export const dashboardApi = {
  // Lấy thống kê tổng quan dashboard
  getStats: async () => {
    try {
      const response = await axios.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Lấy hoạt động gần đây
  getActivities: async () => {
    try {
      const response = await axios.get('/dashboard/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard activities:', error);
      throw error;
    }
  },

  // Lấy dữ liệu dashboard đầy đủ (stats + activities)
  getDashboardData: async () => {
    try {
      const [statsResponse, activitiesResponse] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/dashboard/activity')
      ]);
      
      return {
        stats: statsResponse.data,
        activities: activitiesResponse.data
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

// Business API service
export const businessApi = {
  // Lấy danh sách business
  getBusinesses: async () => {
    try {
      const response = await axios.get('/businesses');
      return response.data;
    } catch (error) {
      console.error('Error fetching businesses:', error);
      throw error;
    }
  },

  // Tạo business mới
  createBusiness: async (data) => {
    try {
      const response = await axios.post('/businesses', data);
      return response.data;
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  },

  // Cập nhật business
  updateBusiness: async (businessId, data) => {
    try {
      const response = await axios.put(`/businesses/${businessId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating business:', error);
      throw error;
    }
  },

  // Xóa business (soft delete)
  deleteBusiness: async (businessId) => {
    try {
      const response = await axios.delete(`/businesses/${businessId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting business:', error);
      throw error;
    }
  },

  // Lấy danh sách projects theo business
  getProjectsByBusiness: async (businessId) => {
    try {
      const response = await axios.get(`/businesses/${businessId}/projects`);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }
};

// Project API service
export const projectApi = {
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

  // Lấy danh sách tasks theo project
  getTasksByProject: async (projectId) => {
    try {
      const response = await axios.get(`/projects/${projectId}/tasks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }
};

// Task API service
export const taskApi = {
  // Tạo task mới
  createTask: async (data) => {
    try {
      const response = await axios.post('/tasks', data);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Cập nhật task
  updateTask: async (taskId, data) => {
    try {
      const response = await axios.put(`/tasks/${taskId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Xóa task
  deleteTask: async (taskId) => {
    try {
      const response = await axios.delete(`/api/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Bắt đầu task
  startTask: async (taskId) => {
    try {
      const response = await axios.post(`/api/tasks/${taskId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting task:', error);
      throw error;
    }
  },
};

// User API service
export const userApi = {
  // Lấy danh sách users
  getUsers: async () => {
    try {
      const response = await axios.get('/api/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Tạo user mới
  createUser: async (data) => {
    try {
      const response = await axios.post('/api/users', data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Cập nhật user
  updateUser: async (userId, data) => {
    try {
      const response = await axios.put(`/api/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Xóa user
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

// Export default để có thể import dễ dàng
const apiServices = {
  dashboard: dashboardApi,
  business: businessApi,
  project: projectApi,
  task: taskApi,
  user: userApi
};

export default apiServices;
