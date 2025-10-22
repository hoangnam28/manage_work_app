import axios from './axios';

export const settingApi = {
    // ============================================
    // BUSINESS OPERATION TEMPLATES
    // ============================================
    
    /**
     * Lấy tất cả Business Operation Templates
     * @returns {Promise} Danh sách business templates
     */
    getBusinessTemplates: async () => {
        try {
            const response = await axios.get('/settings/business-templates');
            return response.data;
        } catch (error) {
            console.error('Error fetching business templates:', error);
            throw error;
        }
    },

    /**
     * Tạo Business Operation Template mới
     * @param {Object} data - { name, description, isActive }
     * @returns {Promise} Business template đã tạo
     */
    createBusinessTemplate: async (data) => {
        try {
            const response = await axios.post('/settings/business-templates', data);
            return response.data;
        } catch (error) {
            console.error('Error creating business template:', error);
            throw error;
        }
    },

    /**
     * Cập nhật Business Operation Template
     * @param {number} id - ID của business template
     * @param {Object} data - { name, description, isActive }
     * @returns {Promise} Kết quả cập nhật
     */
    updateBusinessTemplate: async (id, data) => {
        try {
            const response = await axios.put(`/settings/business-templates/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating business template:', error);
            throw error;
        }
    },

    /**
     * Xóa Business Operation Template (soft delete)
     * @param {number} id - ID của business template
     * @returns {Promise} Kết quả xóa
     */
    deleteBusinessTemplate: async (id) => {
        try {
            const response = await axios.delete(`/settings/business-templates/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting business template:', error);
            throw error;
        }
    },

    // ============================================
    // PROJECT TEMPLATES
    // ============================================
    
    /**
     * Lấy Project Templates theo Business Template ID
     * @param {number} boTemplateId - ID của business template
     * @returns {Promise} Danh sách project templates
     */
    getProjectTemplates: async (boTemplateId) => {
        try {
            const response = await axios.get(`/settings/project-templates/${boTemplateId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching project templates:', error);
            throw error;
        }
    },

    /**
     * Tạo Project Template mới
     * @param {Object} data - { boTemplateId, name, code, description, isActive }
     * @returns {Promise} Project template đã tạo
     */
    createProjectTemplate: async (data) => {
        try {
            const response = await axios.post('/settings/project-templates', data);
            return response.data;
        } catch (error) {
            console.error('Error creating project template:', error);
            throw error;
        }
    },

    /**
     * Cập nhật Project Template
     * @param {number} id - ID của project template
     * @param {Object} data - { name, code, description, isActive }
     * @returns {Promise} Kết quả cập nhật
     */
    updateProjectTemplate: async (id, data) => {
        try {
            const response = await axios.put(`/settings/project-templates/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating project template:', error);
            throw error;
        }
    },

    /**
     * Xóa Project Template (soft delete)
     * @param {number} id - ID của project template
     * @returns {Promise} Kết quả xóa
     */
    deleteProjectTemplate: async (id) => {
        try {
            const response = await axios.delete(`/settings/project-templates/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting project template:', error);
            throw error;
        }
    },

    // ============================================
    // TASK TEMPLATES
    // ============================================
    
    /**
     * Lấy Task Templates theo Project Template ID
     * @param {number} projectTemplateId - ID của project template
     * @returns {Promise} Danh sách task templates
     */
    getTaskTemplates: async (projectTemplateId) => {
        try {
            const response = await axios.get(`/settings/task-templates/${projectTemplateId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching task templates:', error);
            throw error;
        }
    },

    /**
     * Tạo Task Template mới
     * @param {Object} data - { projectTemplateId, name, description, estimatedDuration, priority, isActive }
     * @returns {Promise} Task template đã tạo
     */
    createTaskTemplate: async (data) => {
        try {
            const response = await axios.post('/settings/task-templates', data);
            return response.data;
        } catch (error) {
            console.error('Error creating task template:', error);
            throw error;
        }
    },

    /**
     * Cập nhật Task Template
     * @param {number} id - ID của task template
     * @param {Object} data - { name, description, estimatedDuration, priority, isActive }
     * @returns {Promise} Kết quả cập nhật
     */
    updateTaskTemplate: async (id, data) => {
        try {
            const response = await axios.put(`/settings/task-templates/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating task template:', error);
            throw error;
        }
    },

    /**
     * Xóa Task Template (soft delete)
     * @param {number} id - ID của task template
     * @returns {Promise} Kết quả xóa
     */
    deleteTaskTemplate: async (id) => {
        try {
            const response = await axios.delete(`/settings/task-templates/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting task template:', error);
            throw error;
        }
    },

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    /**
     * Lấy toàn bộ cấu trúc template phân cấp (Business -> Projects -> Tasks)
     * @param {number} boTemplateId - ID của business template
     * @returns {Promise} Cấu trúc phân cấp đầy đủ
     */
    getTemplatesHierarchy: async (boTemplateId) => {
        try {
            const response = await axios.get(`/settings/templates-hierarchy/${boTemplateId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching templates hierarchy:', error);
            throw error;
        }
    },

    // ============================================
    // HELPER FUNCTIONS (Optional - để xử lý data)
    // ============================================
    
    /**
     * Format business template data để hiển thị
     * @param {Object} template - Business template object
     * @returns {Object} Formatted template
     */
    formatBusinessTemplate: (template) => {
        return {
            id: template.ID,
            name: template.NAME,
            description: template.DESCRIPTION,
            isActive: template.IS_ACTIVE === 1,
            createdBy: template.CREATED_BY,
            createdAt: template.CREATED_AT,
            updatedAt: template.UPDATED_AT,
            updatedBy: template.UPDATED_BY
        };
    },

    /**
     * Format project template data để hiển thị
     * @param {Object} template - Project template object
     * @returns {Object} Formatted template
     */
    formatProjectTemplate: (template) => {
        return {
            id: template.ID,
            boTemplateId: template.BO_TEMPLATE_ID,
            name: template.NAME,
            code: template.CODE,
            description: template.DESCRIPTION,
            isActive: template.IS_ACTIVE === 1,
            createdBy: template.CREATED_BY,
            createdAt: template.CREATED_AT,
            updatedAt: template.UPDATED_AT,
            updatedBy: template.UPDATED_BY
        };
    },

    /**
     * Format task template data để hiển thị
     * @param {Object} template - Task template object
     * @returns {Object} Formatted template
     */
    formatTaskTemplate: (template) => {
        return {
            id: template.ID,
            projectTemplateId: template.PROJECT_TEMPLATE_ID,
            name: template.NAME,
            description: template.DESCRIPTION,
            estimatedDuration: template.ESTIMATED_DURATION,
            priority: template.PRIORITY,
            isActive: template.IS_ACTIVE === 1,
            createdBy: template.CREATED_BY,
            createdAt: template.CREATED_AT,
            updatedAt: template.UPDATED_AT,
            updatedBy: template.UPDATED_BY
        };
    },

    /**
     * Validate business template data trước khi submit
     * @param {Object} data - Business template data
     * @returns {Object} { valid: boolean, errors: Array }
     */
    validateBusinessTemplate: (data) => {
        const errors = [];
        
        if (!data.name || data.name.trim() === '') {
            errors.push('Tên business template không được để trống');
        }
        
        if (data.name && data.name.length > 255) {
            errors.push('Tên business template không được vượt quá 255 ký tự');
        }
        
        if (data.description && data.description.length > 1000) {
            errors.push('Mô tả không được vượt quá 1000 ký tự');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Validate project template data trước khi submit
     * @param {Object} data - Project template data
     * @returns {Object} { valid: boolean, errors: Array }
     */
    validateProjectTemplate: (data) => {
        const errors = [];
        
        if (!data.boTemplateId) {
            errors.push('Business template ID không được để trống');
        }
        
        if (!data.name || data.name.trim() === '') {
            errors.push('Tên project template không được để trống');
        }
        
        if (data.name && data.name.length > 255) {
            errors.push('Tên project template không được vượt quá 255 ký tự');
        }
        
        if (data.code && data.code.length > 100) {
            errors.push('Mã project không được vượt quá 100 ký tự');
        }
        
        if (data.description && data.description.length > 1000) {
            errors.push('Mô tả không được vượt quá 1000 ký tự');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Validate task template data trước khi submit
     * @param {Object} data - Task template data
     * @returns {Object} { valid: boolean, errors: Array }
     */
    validateTaskTemplate: (data) => {
        const errors = [];
        
        if (!data.projectTemplateId) {
            errors.push('Project template ID không được để trống');
        }
        
        if (!data.name || data.name.trim() === '') {
            errors.push('Tên task template không được để trống');
        }
        
        if (data.name && data.name.length > 255) {
            errors.push('Tên task template không được vượt quá 255 ký tự');
        }
        
        if (data.description && data.description.length > 1000) {
            errors.push('Mô tả không được vượt quá 1000 ký tự');
        }
        
        if (data.estimatedDuration && (data.estimatedDuration < 0 || data.estimatedDuration > 10000)) {
            errors.push('Thời gian ước tính phải từ 0 đến 10000 giờ');
        }
        
        if (data.priority && !['HIGH', 'MEDIUM', 'LOW'].includes(data.priority)) {
            errors.push('Mức độ ưu tiên phải là HIGH, MEDIUM hoặc LOW');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Transform hierarchy data để dễ dàng sử dụng trong UI
     * @param {Object} hierarchyData - Raw hierarchy data from API
     * @returns {Object} Transformed hierarchy
     */
    transformHierarchy: (hierarchyData) => {
        return {
            business: {
                id: hierarchyData.ID,
                name: hierarchyData.NAME,
                description: hierarchyData.DESCRIPTION
            },
            projects: hierarchyData.projects?.map(project => ({
                id: project.ID,
                name: project.NAME,
                code: project.CODE,
                description: project.DESCRIPTION,
                tasks: project.tasks?.map(task => ({
                    id: task.ID,
                    name: task.NAME,
                    description: task.DESCRIPTION,
                    estimatedDuration: task.ESTIMATED_DURATION,
                    priority: task.PRIORITY
                })) || []
            })) || []
        };
    },

    /**
     * Get priority label in Vietnamese
     * @param {string} priority - Priority value (HIGH, MEDIUM, LOW)
     * @returns {string} Vietnamese label
     */
    getPriorityLabel: (priority) => {
        const labels = {
            'HIGH': 'Cao',
            'MEDIUM': 'Trung bình',
            'LOW': 'Thấp'
        };
        return labels[priority] || priority;
    },

    /**
     * Get priority color for UI
     * @param {string} priority - Priority value
     * @returns {string} Color class or hex code
     */
    getPriorityColor: (priority) => {
        const colors = {
            'HIGH': '#ef4444',    // red-500
            'MEDIUM': '#f59e0b',  // amber-500
            'LOW': '#10b981'      // green-500
        };
        return colors[priority] || '#6b7280'; // gray-500
    }
};

export default settingApi;