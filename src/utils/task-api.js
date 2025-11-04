import axios from './axios';

// Task Management API service
export const taskApi = {
  // Lấy danh sách tasks theo project
  getTasksByProject: async (projectId) => {
    try {
      const response = await axios.get(`/projects/${projectId}/tasks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

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
      const response = await axios.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Bắt đầu session làm việc
  startTask: async (taskId) => {
    try {
      const response = await axios.post(`/tasks/${taskId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting task:', error);
      if (error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // Tạm dừng session hiện tại
  pauseTask: async (taskId, note) => {
    try {
      const response = await axios.post(`/tasks/${taskId}/pause`, { note });
      return response.data;
    } catch (error) {
      console.error('Error pausing task:', error);
      if (error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // Hoàn thành task (đánh dấu done)
  completeTask: async (taskId, note) => {
    try {
      const response = await axios.post(`/tasks/${taskId}/complete`, { note });
      return response.data;
    } catch (error) {
      console.error('Error completing task:', error);
      if (error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // Lấy lịch sử các session làm việc
  getTaskSessions: async (taskId) => {
    try {
      const response = await axios.get(`/tasks/${taskId}/sessions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task sessions:', error);
      throw error;
    }
  },

  // Lấy tất cả logs của task (cho dashboard)
  getTaskLogs: async (taskId) => {
    try {
      const response = await axios.get(`/tasks/${taskId}/all-logs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task logs:', error);
      throw error;
    }
  },
  
  // Lấy tasks của tôi
  getMyTasks: async () => {
    try {
      const response = await axios.get('/tasks/my-tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      throw error;
    }
  },

  // Lấy tasks cần kiểm tra
  getCheckTasks: async () => {
    try {
      const response = await axios.get('/tasks/check-tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching check tasks:', error);
      throw error;
    }
  },

  // Lấy chi tiết task
  getTaskById: async (taskId) => {
    try {
      const response = await axios.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task details:', error);
      throw error;
    }
  },

  // Legacy support - giữ tên cũ để tương thích
  endTask: async (taskId, note) => {
    // Redirect to completeTask
    return taskApi.completeTask(taskId, note);
  }
};

export default taskApi;