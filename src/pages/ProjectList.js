import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, message,
  Popconfirm, Space, Typography, Row, Col, Statistic,
  Tag, Select, Divider, Alert, Tooltip
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  FolderOutlined, ThunderboltOutlined, SettingOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { projectApi } from '../utils/project-api';
import { businessApi } from '../utils/business-api';
import { settingApi } from '../utils/setting-api';
import { projectCustomFieldsApi } from '../utils/project-custom-fields-api';
import CustomFieldsManager from '../components/CustomFieldsManager';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProjectList = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form] = Form.useForm();
  const [customFieldsVisible, setCustomFieldsVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [customFields, setCustomFields] = useState([]);

  // Template states
  const [projectTemplates, setProjectTemplates] = useState([]);
  const [selectedProjectTemplate, setSelectedProjectTemplate] = useState(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Load custom fields and their values for all projects
  const loadCustomFields = useCallback(async () => {
    if (!businessId || !projects.length) return;
    
    try {
      // First, get all custom fields from the first project (assuming all projects share same fields)
      const firstProject = projects[0];
      const fields = await projectCustomFieldsApi.getCustomFields(firstProject.id);
      
      // Then get custom field values for each project
      const projectsWithFields = await Promise.all(
        projects.map(async (project) => {
          try {
            const values = await projectCustomFieldsApi.getCustomFields(project.id);
            return {
              ...project,
              customFields: values.map(field => ({
                fieldId: field.id,
                value: field.value || field.defaultValue
              }))
            };
          } catch (error) {
            console.error(`Error loading custom fields for project ${project.id}:`, error);
            return project;
          }
        })
      );
      
      setCustomFields(fields);
      setProjects(projectsWithFields);
    } catch (error) {
      console.error('Error loading custom fields:', error);
      message.error('Lỗi khi tải thông tin cột tùy chỉnh');
    }
  }, [businessId, projects]);

  // Load projects
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectApi.getProjectsByBusiness(businessId);
      setProjects(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách dự án');
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  // Load business info
  const loadBusiness = useCallback(async () => {
    try {
      const data = await businessApi.getBusinessById(businessId);
      setBusiness(data);
    } catch (error) {
      console.error('Error loading business:', error);
    }
  }, [businessId]);

  // Load all active project templates
  const loadAllProjectTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const businessTemplatesResult = await settingApi.getActiveBusinessTemplates();
      const businessTemplates = businessTemplatesResult.data || [];
      
      const allProjectTemplates = [];
      for (const boTemplate of businessTemplates) {
        try {
          const result = await settingApi.getActiveProjectTemplates(boTemplate.ID);
          if (result.data && result.data.length > 0) {
            allProjectTemplates.push(...result.data);
          }
        } catch (error) {
          console.error(`Error loading project templates for business template ${boTemplate.ID}:`, error);
        }
      }
      
      setProjectTemplates(allProjectTemplates);
    } catch (error) {
      console.error('Error loading project templates:', error);
      setProjectTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      loadProjects();
      loadBusiness();
    }
  }, [businessId, loadProjects, loadBusiness]);

  // Load custom fields after projects are loaded
  useEffect(() => {
    if (projects.length > 0) {
      loadCustomFields();
    }
  }, [projects, loadCustomFields]);

  // Load project templates when modal opens for creation
  useEffect(() => {
    if (modalVisible && !editingProject) {
      loadAllProjectTemplates();
    }
  }, [modalVisible, editingProject]);

  const handleProjectTemplateSelect = (templateId) => {
    setSelectedProjectTemplate(templateId);
    
    if (templateId) {
      const template = projectTemplates.find(t => t.ID === templateId);
      if (template) {
        form.setFieldsValue({
          name: template.NAME,
          code: template.CODE || '',
          description: template.DESCRIPTION || ''
        });
        message.success(`Đã áp dụng template: ${template.NAME}`);
      }
    } else {
      form.resetFields();
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingProject) {
        await projectApi.updateProject(editingProject.id, values);
        message.success('Cập nhật dự án thành công');
      } else {
        await projectApi.createProject({ 
          ...values, 
          businessId,
          projectTemplateId: selectedProjectTemplate
        });
        message.success('Tạo dự án thành công');
      }

      handleModalCancel();
      await loadProjects();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu dự án');
      console.error('Error saving project:', error);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    form.setFieldsValue({
      name: project.name,
      code: project.code,
      description: project.description
    });
    setModalVisible(true);
  };

  const handleDelete = async (projectId) => {
    try {
      await projectApi.deleteProject(projectId);
      message.success('Xóa dự án thành công');
      await loadProjects();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa dự án');
      console.error('Error deleting project:', error);
    }
  };

  const handleViewTasks = (projectId) => {
    navigate(`/business/${businessId}/project/${projectId}/tasks`);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingProject(null);
    setSelectedProjectTemplate(null);
    setProjectTemplates([]);
    form.resetFields();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'INACTIVE': return 'red';
      case 'COMPLETED': return 'blue';
      default: return 'default';
    }
  };

  // Generate dynamic columns from custom fields
  const getDynamicColumns = useCallback(() => {
    if (!customFields || customFields.length === 0) return [];
    
    return customFields.map(field => ({
      title: (
        <div style={{ whiteSpace: 'nowrap' }}>
          {field.fieldName}
          {field.defaultValue && (
            <Tooltip title={`Giá trị mặc định: ${field.defaultValue}`} placement="top">
              <Tag color="gold" style={{ marginLeft: 8, cursor: 'help' }}>
                Mặc định
              </Tag>
            </Tooltip>
          )}
        </div>
      ),
      key: `custom_${field.id}`,
      width: 150,
      render: (_, record) => {
        const value = record.customFields?.find(cf => cf.fieldId === field.id)?.value 
                     || field.defaultValue;

        if (!value) return <Tag color="default">-</Tag>;

        switch (field.fieldType) {
          case 'SELECT':
            return <Tag color="blue">{value}</Tag>;
          case 'DATE':
            return <Tag color="orange">
              {new Date(value).toLocaleDateString('vi-VN')}
            </Tag>;
          case 'NUMBER':
            return <Tag color="green">{value}</Tag>;
          default:
            return value;
        }
      },
      ellipsis: true
    }));
  }, [customFields]);

  // Base columns (fixed columns)
  const baseColumns = [
    {
      title: 'Mã dự án',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Tên dự án',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'ACTIVE' ? 'Hoạt động' :
           status === 'INACTIVE' ? 'Tạm dừng' : 'Hoàn thành'}
        </Tag>
      )
    },
    {
      title: 'Người tạo',
      dataIndex: 'creatorName',
      key: 'creatorName',
      width: 150,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
  ];

  // Action column (always last)
  const actionColumn = {
    title: 'Thao tác',
    key: 'actions',
    width: 280,
    fixed: 'right',
    render: (_, record) => (
      <Space>
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewTasks(record.id)}
        >
          Tasks
        </Button>
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => handleEdit(record)}
        >
          Sửa
        </Button>
        <Popconfirm
          title="Bạn có chắc muốn xóa dự án này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger icon={<DeleteOutlined />} size="small">
            Xóa
          </Button>
        </Popconfirm>
        <Button
          icon={<SettingOutlined />}
          size="small"
          onClick={() => {
            setSelectedProject(record);
            setCustomFieldsVisible(true);
          }}
        >
          Cột
        </Button>
      </Space>
    )
  };
  const allColumns = [...baseColumns, ...getDynamicColumns(), actionColumn];

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={2} style={{ margin: 0 }}>
                    <FolderOutlined style={{ marginRight: '8px' }} />
                    Quản lý Dự án
                  </Title>
                  <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                    Nghiệp vụ: {business?.name || 'Loading...'}
                  </p>
                  {customFields.length > 0 && (
                    <Tag color="cyan" style={{ marginTop: '8px' }}>
                      {customFields.length} cột tùy chỉnh
                    </Tag>
                  )}
                </Col>
                <Col>
                  <Space>
                    <Button onClick={() => navigate(`/business`)}>
                      Quay lại
                    </Button>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingProject(null);
                        setSelectedProjectTemplate(null);
                        form.resetFields();
                        setModalVisible(true);
                      }}
                    >
                      Tạo dự án mới
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng số dự án"
                value={projects.length}
                prefix={<FolderOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Dự án hoạt động"
                value={projects.filter((p) => p.status === 'ACTIVE').length}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Dự án hoàn thành"
                value={projects.filter((p) => p.status === 'COMPLETED').length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="Cột tùy chỉnh" 
                value={customFields.length} 
                suffix="cột" 
              />
            </Card>
          </Col>
        </Row>

        <Card>
          {customFields.length > 0 && (
            <Alert
              message={`Đang hiển thị ${customFields.length} cột tùy chỉnh`}
              type="info"
              showIcon
              closable
              style={{ marginBottom: 16 }}
            />
          )}
          <Table
            columns={allColumns}
            dataSource={projects}
            loading={loading}
            rowKey="id"
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} dự án`
            }}
          />
        </Card>

        {/* Modal tạo/sửa project */}
        <Modal
          title={
            <Space>
              {editingProject ? 'Cập nhật dự án' : 'Tạo dự án mới'}
              {!editingProject && projectTemplates.length > 0 && (
                <Tag color="blue" icon={<ThunderboltOutlined />}>
                  Có {projectTemplates.length} project template
                </Tag>
              )}
            </Space>
          }
          open={modalVisible}
          onCancel={handleModalCancel}
          footer={null}
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {!editingProject && projectTemplates.length > 0 && (
              <>
                <Alert
                  message="Sử dụng Project Template"
                  description={`Chọn template dự án có sẵn để tự động điền thông tin.`}
                  type="info"
                  showIcon
                  icon={<ThunderboltOutlined />}
                  style={{ marginBottom: 16 }}
                />

                <Form.Item
                  label={
                    <Space>
                      <ThunderboltOutlined style={{ color: '#1890ff' }} />
                      <span>Chọn Project Template</span>
                    </Space>
                  }
                >
                  <Select
                    placeholder="-- Chọn template hoặc nhập thủ công --"
                    value={selectedProjectTemplate}
                    onChange={handleProjectTemplateSelect}
                    loading={loadingTemplates}
                    allowClear
                  >
                    {projectTemplates.map(template => (
                      <Option key={template.ID} value={template.ID}>
                        <Space>
                          <FolderOutlined />
                          {template.NAME}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Divider />
              </>
            )}

            <Form.Item
              name="name"
              label="Tên dự án"
              rules={[{ required: true, message: 'Vui lòng nhập tên dự án' }]}
            >
              <Input placeholder="Nhập tên dự án" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Mã dự án"
              rules={[{ required: true, message: 'Vui lòng nhập mã dự án' }]}
            >
              <Input placeholder="Nhập mã dự án" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
            >
              <TextArea rows={4} placeholder="Nhập mô tả" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={handleModalCancel}>Hủy</Button>
                <Button type="primary" htmlType="submit">
                  {editingProject ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal quản lý custom fields */}
        <CustomFieldsManager
          projectId={selectedProject?.id}
          visible={customFieldsVisible}
          onClose={() => {
            setCustomFieldsVisible(false);
            setSelectedProject(null);
            loadProjects();
          }}
          onFieldsChange={() => {
            loadCustomFields();
          }}
        />
      </div>
    </MainLayout>
  );
};

export default ProjectList;