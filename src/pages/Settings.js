import React, { useState, useEffect } from 'react';
import './Settings.css';
import settingApi from '../utils/setting-api'
import CreateSettingModal from '../components/modal/CreateSettingModal'
import MainLayout from '../components/layout/MainLayout';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  FolderOpenOutlined,
  UnorderedListOutlined,
  CarryOutOutlined,
  InboxOutlined,
  LeftOutlined,
  LoadingOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';


const Settings = () => {
  const [businessTemplates, setBusinessTemplates] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [projectTemplates, setProjectTemplates] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [taskTemplates, setTaskTemplates] = useState([]);

  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    mode: 'create',
    initialData: null,
    parentId: null
  });

  // Load business templates khi component mount
  useEffect(() => {
    loadBusinessTemplates();
  }, []);

  // Load projects khi chọn business
  useEffect(() => {
    if (selectedBusiness) {
      loadProjectTemplates(selectedBusiness.ID);
    } else {
      setProjectTemplates([]);
      setSelectedProject(null);
    }
  }, [selectedBusiness]);

  // Load tasks khi chọn project
  useEffect(() => {
    if (selectedProject) {
      loadTaskTemplates(selectedProject.ID);
    } else {
      setTaskTemplates([]);
    }
  }, [selectedProject]);

  const loadBusinessTemplates = async () => {
    setLoading(true);
    try {
      const result = await settingApi.getBusinessTemplates();
      setBusinessTemplates(result.data || []);
    } catch (error) {
      console.error('Error loading business templates:', error);
      alert('Không thể tải danh sách business templates');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTemplates = async (boTemplateId) => {
    setLoading(true);
    try {
      const result = await settingApi.getProjectTemplates(boTemplateId);
      setProjectTemplates(result.data || []);
    } catch (error) {
      console.error('Error loading project templates:', error);
      alert('Không thể tải danh sách project templates');
    } finally {
      setLoading(false);
    }
  };

  const loadTaskTemplates = async (projectTemplateId) => {
    setLoading(true);
    try {
      const result = await settingApi.getTaskTemplates(projectTemplateId);
      setTaskTemplates(result.data || []);
    } catch (error) {
      console.error('Error loading task templates:', error);
      alert('Không thể tải danh sách task templates');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, mode = 'create', initialData = null, parentId = null) => {
    setModalState({
      isOpen: true,
      type,
      mode,
      initialData,
      parentId
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      mode: 'create',
      initialData: null,
      parentId: null
    });
  };

  const handleModalSuccess = () => {
    // Reload data sau khi thêm/sửa
    if (modalState.type === 'business') {
      loadBusinessTemplates();
    } else if (modalState.type === 'project' && selectedBusiness) {
      loadProjectTemplates(selectedBusiness.ID);
    } else if (modalState.type === 'task' && selectedProject) {
      loadTaskTemplates(selectedProject.ID);
    }
  };

  const handleDelete = async (type, id) => {
    const confirmMessage = `Bạn có chắc chắn muốn xóa ${type} template này?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      let result;
      if (type === 'business') {
        result = await settingApi.deleteBusinessTemplate(id);
        if (result.success) {
          loadBusinessTemplates();
          if (selectedBusiness?.ID === id) {
            setSelectedBusiness(null);
          }
        }
      } else if (type === 'project') {
        result = await settingApi.deleteProjectTemplate(id);
        if (result.success) {
          loadProjectTemplates(selectedBusiness.ID);
          if (selectedProject?.ID === id) {
            setSelectedProject(null);
          }
        }
      } else if (type === 'task') {
        result = await settingApi.deleteTaskTemplate(id);
        if (result.success) {
          loadTaskTemplates(selectedProject.ID);
        }
      }

      alert(result.message || 'Xóa thành công');
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Có lỗi xảy ra khi xóa template');
    }
  };

  const getPriorityBadge = (priority) => {
    const config = {
      'HIGH': { label: 'Cao', class: 'priority-high' },
      'MEDIUM': { label: 'TB', class: 'priority-medium' },
      'LOW': { label: 'Thấp', class: 'priority-low' }
    };
    const { label, class: className } = config[priority] || config['MEDIUM'];
    return <span className={`priority-badge ${className}`}>{label}</span>;
  };

  return (
    <MainLayout>
    <div className="settings-container">
      <div className="settings-header">
        <h1>
          <SettingOutlined style={{ marginRight: '8px' }} />
          Settings To do List 
        </h1>
        <p className="settings-description">
          Cấu hình các template cho Business Operations, Projects và Tasks
        </p>
      </div>

      <div className="settings-content">
        {/* Business Templates Column */}
        <div className="template-column">
          <div className="column-header">
            <h2>
              <UnorderedListOutlined style={{ marginRight: '8px' }} />
              Business Operations
            </h2>
            <button
              className="btn-add"
              onClick={() => openModal('business', 'create')}
            >
              <PlusOutlined />
            </button>
          </div>

          <div className="template-list">
            {loading && businessTemplates.length === 0 ? (
              <div className="loading-state">
                <LoadingOutlined style={{ fontSize: '24px' }} />
                <p>Đang tải...</p>
              </div>
            ) : businessTemplates.length === 0 ? (
              <div className="empty-state">
                <InboxOutlined style={{ fontSize: '48px' }} />
                <p>Chưa có business template nào</p>
                <button
                  className="btn-primary"
                  onClick={() => openModal('business', 'create')}
                >
                  Tạo template đầu tiên
                </button>
              </div>
            ) : (
              businessTemplates.map(business => (
                <div
                  key={business.ID}
                  className={`template-card ${selectedBusiness?.ID === business.ID ? 'active' : ''}`}
                  onClick={() => setSelectedBusiness(business)}
                >
                  <div className="card-header">
                    <h3>{business.NAME}</h3>
                    <div className="card-actions">
                      <button
                        className="btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('business', 'edit', business);
                        }}
                        title="Sửa"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete('business', business.ID);
                        }}
                        title="Xóa"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  </div>
                  {business.DESCRIPTION && (
                    <p className="card-description">{business.DESCRIPTION}</p>
                  )}
                  <div className="card-footer">
                    <span className={`status-badge ${business.IS_ACTIVE ? 'active' : 'inactive'}`}>
                      {business.IS_ACTIVE ? 'Kích hoạt' : 'Không kích hoạt'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project Templates Column */}
        <div className="template-column">
          <div className="column-header">
            <h2>
              <FolderOpenOutlined style={{ marginRight: '8px' }} />
              Projects
            </h2>
            {selectedBusiness && (
              <button
                className="btn-add"
                onClick={() => openModal('project', 'create', null, selectedBusiness.ID)}
              >
                <PlusOutlined />
              </button>
            )}
          </div>

          <div className="template-list">
            {!selectedBusiness ? (
              <div className="empty-state">
                <LeftOutlined style={{ fontSize: '48px' }} />
                <p>Chọn một business operation để xem projects</p>
              </div>
            ) : loading && projectTemplates.length === 0 ? (
              <div className="loading-state">
                <LoadingOutlined style={{ fontSize: '24px' }} />
                <p>Đang tải...</p>
              </div>
            ) : projectTemplates.length === 0 ? (
              <div className="empty-state">
                <InboxOutlined style={{ fontSize: '48px' }} />
                <p>Chưa có project template nào</p>
                <button
                  className="btn-primary"
                  onClick={() => openModal('project', 'create', null, selectedBusiness.ID)}
                >
                  Tạo project template
                </button>
              </div>
            ) : (
              projectTemplates.map(project => (
                <div
                  key={project.ID}
                  className={`template-card ${selectedProject?.ID === project.ID ? 'active' : ''}`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="card-header">
                    <div>
                      <h3>{project.NAME}</h3>
                      {project.CODE && (
                        <span className="project-code">{project.CODE}</span>
                      )}
                    </div>
                    <div className="card-actions">
                      <button
                        className="btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('project', 'edit', project, selectedBusiness.ID);
                        }}
                        title="Sửa"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete('project', project.ID);
                        }}
                        title="Xóa"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  </div>
                  {project.DESCRIPTION && (
                    <p className="card-description">{project.DESCRIPTION}</p>
                  )}
                  <div className="card-footer">
                    <span className={`status-badge ${project.IS_ACTIVE ? 'active' : 'inactive'}`}>
                      {project.IS_ACTIVE ? 'Kích hoạt' : 'Không kích hoạt'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task Templates Column */}
        <div className="template-column">
          <div className="column-header">
            <h2>
              <CarryOutOutlined style={{ marginRight: '8px' }} />
              Tasks
            </h2>
            {selectedProject && (
              <button
                className="btn-add"
                onClick={() => openModal('task', 'create', null, selectedProject.ID)}
              >
                <PlusOutlined />
              </button>
            )}
          </div>

          <div className="template-list">
            {!selectedProject ? (
              <div className="empty-state">
                <LeftOutlined style={{ fontSize: '48px' }} />
                <p>Chọn một project để xem tasks</p>
              </div>
            ) : loading && taskTemplates.length === 0 ? (
              <div className="loading-state">
                <LoadingOutlined style={{ fontSize: '24px' }} />
                <p>Đang tải...</p>
              </div>
            ) : taskTemplates.length === 0 ? (
              <div className="empty-state">
                <InboxOutlined style={{ fontSize: '48px' }} />
                <p>Chưa có task template nào</p>
                <button
                  className="btn-primary"
                  onClick={() => openModal('task', 'create', null, selectedProject.ID)}
                >
                  Tạo task template
                </button>
              </div>
            ) : (
              taskTemplates.map(task => (
                <div
                  key={task.ID}
                  className="template-card task-card"
                >
                  <div className="card-header">
                    <h3>{task.NAME}</h3>
                    <div className="card-actions">
                      <button
                        className="btn-icon"
                        onClick={() => openModal('task', 'edit', task, selectedProject.ID)}
                        title="Sửa"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete('task', task.ID)}
                        title="Xóa"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  </div>
                  {task.DESCRIPTION && (
                    <p className="card-description">{task.DESCRIPTION}</p>
                  )}
                  <div className="card-footer">
                    <div className="task-info">
                      {task.ESTIMATED_DURATION && (
                        <span className="duration-badge">
                          <ClockCircleOutlined style={{ marginRight: '4px' }} />
                          {task.ESTIMATED_DURATION}h
                        </span>
                      )}
                      {getPriorityBadge(task.PRIORITY)}
                    </div>
                    <span className={`status-badge ${task.IS_ACTIVE ? 'active' : 'inactive'}`}>
                      {task.IS_ACTIVE ? 'Kích hoạt' : 'Không kích hoạt'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreateSettingModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
        type={modalState.type}
        mode={modalState.mode}
        initialData={modalState.initialData}
        parentId={modalState.parentId}
      />
    </div>
    </MainLayout>
  );
};

export default Settings;