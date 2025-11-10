import axios from './axios';


export const projectCustomFieldsApi = {
  /**
   * Lấy danh sách custom fields của một project
   * @param {number} projectId - ID của project
   * @returns {Promise<Array>} Danh sách custom fields
   */
  getCustomFields: async (projectId) => {
    try {
      const response = await axios.get(`/projects/${projectId}/custom-fields`);
      return response.data;
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      throw error;
    }
  },

  /**
   * Tạo custom field mới cho project
   * @param {number} projectId - ID của project
   * @param {Object} fieldData - Dữ liệu custom field
   * @param {string} fieldData.fieldName - Tên cột
   * @param {string} fieldData.fieldType - Loại dữ liệu (TEXT, NUMBER, DATE, SELECT)
   * @param {Array<string>} fieldData.fieldOptions - Danh sách tùy chọn (cho SELECT)
   * @param {boolean} fieldData.isRequired - Có bắt buộc không
   * @param {number} fieldData.displayOrder - Thứ tự hiển thị
   * @returns {Promise<Object>} Response với id của custom field mới
   */
  createCustomField: async (projectId, fieldData) => {
    try {
      const response = await axios.post(
        `/projects/${projectId}/custom-fields`,
        fieldData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating custom field:', error);
      throw error;
    }
  },

  /**
   * Cập nhật custom field
   * @param {number} projectId - ID của project
   * @param {number} fieldId - ID của custom field
   * @param {Object} fieldData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Response message
   */
  updateCustomField: async (projectId, fieldId, fieldData) => {
    try {
      const response = await axios.put(
        `/projects/${projectId}/custom-fields/${fieldId}`,
        fieldData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating custom field:', error);
      throw error;
    }
  },

  /**
   * Xóa custom field (soft delete)
   * @param {number} projectId - ID của project
   * @param {number} fieldId - ID của custom field cần xóa
   * @returns {Promise<Object>} Response message
   */
  deleteCustomField: async (projectId, fieldId) => {
    try {
      const response = await axios.delete(
        `/projects/${projectId}/custom-fields/${fieldId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting custom field:', error);
      throw error;
    }
  },

  /**
   * Lấy tasks kèm giá trị custom fields
   * @param {number} projectId - ID của project
   * @returns {Promise<Array>} Danh sách tasks với custom field values
   */
  getTasksWithCustomFields: async (projectId) => {
    try {
      const response = await axios.get(
        `/projects/${projectId}/tasks-with-custom-fields`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks with custom fields:', error);
      throw error;
    }
  },

  /**
   * Lưu/Cập nhật giá trị custom field cho task
   * @param {number} taskId - ID của task
   * @param {number} customFieldId - ID của custom field
   * @param {string} fieldValue - Giá trị cần lưu
   * @returns {Promise<Object>} Response message
   */
  saveTaskCustomFieldValue: async (taskId, customFieldId, fieldValue) => {
    try {
      const response = await axios.post(
        `/tasks/${taskId}/custom-field-values`,
        {
          customFieldId,
          fieldValue
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error saving task custom field value:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả giá trị custom fields của một task
   * @param {number} taskId - ID của task
   * @returns {Promise<Array>} Danh sách custom field values
   */
  getTaskCustomFieldValues: async (taskId) => {
    try {
      const response = await axios.get(
        `/tasks/${taskId}/custom-field-values`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching task custom field values:', error);
      throw error;
    }
  },

  /**
   * Xóa giá trị custom field của task
   * @param {number} taskId - ID của task
   * @param {number} customFieldId - ID của custom field
   * @returns {Promise<Object>} Response message
   */
  deleteTaskCustomFieldValue: async (taskId, customFieldId) => {
    try {
      const response = await axios.delete(
        `/tasks/${taskId}/custom-field-values/${customFieldId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting task custom field value:', error);
      throw error;
    }
  },

  /**
   * Reorder custom fields (thay đổi thứ tự hiển thị)
   * @param {number} projectId - ID của project
   * @param {Array<{id: number, displayOrder: number}>} orderData - Mảng chứa id và thứ tự mới
   * @returns {Promise<Object>} Response message
   */
  reorderCustomFields: async (projectId, orderData) => {
    try {
      const response = await axios.put(
        `/projects/${projectId}/custom-fields/reorder`,
        orderData
      );
      return response.data;
    } catch (error) {
      console.error('Error reordering custom fields:', error);
      throw error;
    }
  },
};

export const projectColApi = projectCustomFieldsApi;

export default projectCustomFieldsApi;