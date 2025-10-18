import axios from './axios';

// Task Management API service
export const taskApi = {
  // Lấy danh sách tasks theo project
  getTasksByProject: async (projectId) => {
    try {
      const response = await axios.get(`/bussiness/projects/${projectId}/tasks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Tạo task mới
  createTask: async (data) => {
    try {
      const response = await axios.post('/bussiness/tasks', data);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Cập nhật task
  updateTask: async (taskId, data) => {
    try {
      const response = await axios.put(`/bussiness/tasks/${taskId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Xóa task
  deleteTask: async (taskId) => {
    try {
      const response = await axios.delete(`/bussiness/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Bắt đầu task
  startTask: async (taskId) => {
    try {
      const response = await axios.post(`/bussiness/tasks/${taskId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting task:', error);
      if (error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // Kết thúc task
  endTask: async (taskId, note) => {
    try {
      const response = await axios.post(`/bussiness/tasks/${taskId}/end`, { note });
      return response.data;
    } catch (error) {
      console.error('Error ending task:', error);
      throw error;
    }
  },

  // Lấy tasks của tôi
  getMyTasks: async () => {
    try {
      const response = await axios.get('/bussiness/my-tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      throw error;
    }
  },

  // Lấy tasks cần kiểm tra
  getCheckTasks: async () => {
    try {
      const response = await axios.get('/bussiness/check-tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching check tasks:', error);
      throw error;
    }
  },

  // Lấy chi tiết task
  getTaskById: async (taskId) => {
    try {
      const response = await axios.get(`/bussiness/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task details:', error);
      throw error;
    }
  }
};

export default taskApi;