import React, { useState, useEffect } from 'react';
import '../css/CreateSettingModal.css';
import settingApi from '../../utils/setting-api';

const CreateSettingModal = ({
  isOpen,
  onClose,
  onSuccess,
  type, // 'business', 'project', 'task'
  mode = 'create', // 'create' or 'edit'
  initialData = null,
  parentId = null // boTemplateId cho project, projectTemplateId cho task
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    estimatedDuration: '',
    priority: 'MEDIUM',
    isActive: true
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          name: initialData.name || initialData.NAME || '',
          description: initialData.description || initialData.DESCRIPTION || '',
          code: initialData.code || initialData.CODE || '',
          estimatedDuration: initialData.estimatedDuration || initialData.ESTIMATED_DURATION || '',
          priority: initialData.priority || initialData.PRIORITY || 'MEDIUM',
          isActive: initialData.isActive !== undefined
            ? initialData.isActive
            : (initialData.IS_ACTIVE === 1 || initialData.IS_ACTIVE === undefined)
        });
      } else {
        resetForm();
      }
      setErrors([]);
    }
  }, [isOpen, mode, initialData]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      code: '',
      estimatedDuration: '',
      priority: 'MEDIUM',
      isActive: true
    });
    setErrors([]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors khi user nhập
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    let validation;

    switch (type) {
      case 'business':
        validation = settingApi.validateBusinessTemplate(formData);
        break;
      case 'project':
        validation = settingApi.validateProjectTemplate({
          ...formData,
          boTemplateId: parentId
        });
        break;
      case 'task':
        validation = settingApi.validateTaskTemplate({
          ...formData,
          projectTemplateId: parentId,
          estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : null
        });
        break;
      default:
        validation = { valid: false, errors: ['Invalid template type'] };
    }

    setErrors(validation.errors);
    return validation.valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let result;
      const submitData = {
        ...formData,
        isActive: formData.isActive ? 1 : 0,
        estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : null
      };

      if (type === 'business') {
        if (mode === 'edit') {
          result = await settingApi.updateBusinessTemplate(initialData.id || initialData.ID, submitData);
        } else {
          result = await settingApi.createBusinessTemplate(submitData);
        }
      } else if (type === 'project') {
        submitData.boTemplateId = parentId;
        if (mode === 'edit') {
          result = await settingApi.updateProjectTemplate(initialData.id || initialData.ID, submitData);
        } else {
          result = await settingApi.createProjectTemplate(submitData);
        }
      } else if (type === 'task') {
        submitData.projectTemplateId = parentId;
        if (mode === 'edit') {
          result = await settingApi.updateTaskTemplate(initialData.id || initialData.ID, submitData);
        } else {
          result = await settingApi.createTaskTemplate(submitData);
        }
      }

      if (result.success) {
        onSuccess && onSuccess(result.data);
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setErrors([error.response?.data?.message || 'Có lỗi xảy ra khi lưu template']);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const typeNames = {
      business: 'Business Operation',
      project: 'Project',
      task: 'Task'
    };
    return `${mode === 'edit' ? 'Chỉnh sửa' : 'Tạo mới'} ${typeNames[type] || ''} Template`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content setting-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{getTitle()}</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <div key={index} className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              ))}
            </div>
          )}

          {/* Tên */}
          <div className="form-group">
            <label htmlFor="name">
              Tên <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={`Nhập tên ${type === 'business' ? 'business operation' : type}`}
              required
            />
          </div>

          {/* Code - chỉ cho Project */}
          {type === 'project' && (
            <div className="form-group">
              <label htmlFor="code">Mã Project</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Ví dụ: FE-DEV, BE-DEV"
              />
            </div>
          )}

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả chi tiết"
              rows="4"
            />
          </div>

          {/* Estimated Duration & Priority - chỉ cho Task */}
          {type === 'task' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="estimatedDuration">
                    Thời gian ước tính (giờ)
                  </label>
                  <input
                    type="number"
                    id="estimatedDuration"
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    max="10000"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Mức độ ưu tiên</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="HIGH">Cao</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="LOW">Thấp</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Is Active */}
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span>Kích hoạt template</span>
            </label>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang lưu...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {mode === 'edit' ? 'Cập nhật' : 'Tạo mới'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSettingModal;