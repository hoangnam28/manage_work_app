import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Select,
  Divider,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FolderOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { projectApi } from '../utils/project-api';
import { businessApi } from '../utils/business-api';
import { settingApi } from '../utils/setting-api';

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

  // Template states - Chỉ cần project templates
  const [projectTemplates, setProjectTemplates] = useState([]);
  const [selectedProjectTemplate, setSelectedProjectTemplate] = useState(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

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

  // Load all active project templates (không cần chọn business template nữa)
  const loadAllProjectTemplates = async () => {
    try {
      setLoadingTemplates(true);
      // Load tất cả business templates active
      const businessTemplatesResult = await settingApi.getActiveBusinessTemplates();
      const businessTemplates = businessTemplatesResult.data || [];
      
      // Load project templates từ tất cả business templates
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

  // Load project templates when modal opens for creation
  useEffect(() => {
    if (modalVisible && !editingProject) {
      loadAllProjectTemplates();
    }
  }, [modalVisible, editingProject]);

  // Handle project template selection
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

  // Handle create/update project
  const handleSubmit = async (values) => {
    try {
      if (editingProject) {
        await projectApi.updateProject(editingProject.id, values);
        message.success('Cập nhật dự án thành công');
      } else {
        await projectApi.createProject({ 
          ...values, 
          businessId,
          projectTemplateId: selectedProjectTemplate // Lưu template ID
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

  // Handle edit project
  const handleEdit = (project) => {
    setEditingProject(project);
    form.setFieldsValue({
      name: project.name,
      code: project.code,
      description: project.description
    });
    setModalVisible(true);
  };

  // Handle delete project
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

  // Handle view tasks
  const handleViewTasks = (projectId) => {
    console.log('🔍 ProjectList - Navigating to tasks for projectId:', projectId, 'businessId:', businessId);
    navigate(`/business/${businessId}/project/${projectId}/tasks`);
  };
  // Handle modal cancel
  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingProject(null);
    setSelectedProjectTemplate(null);
    setProjectTemplates([]);
    form.resetFields();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'red';
      case 'COMPLETED':
        return 'blue';
      default:
        return 'default';
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Mã dự án',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Tên dự án',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'pending'
            ? 'Hoạt động'
            : status === 'done' || status === 'checked'
            ? 'Tạm dừng'
            : 'Hoàn thành'}
        </Tag>
      )
    },
    {
      title: 'Người tạo',
      dataIndex: 'creatorName',
      key: 'creatorName'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
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
            type="default"
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
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

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
              <Statistic title="Tổng tasks" value={0} suffix="tasks" />
            </Card>
          </Col>
        </Row>

        <Card>
          <Table
            columns={columns}
            dataSource={projects}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} dự án`
            }}
          />
        </Card>

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
            {/* Template Selector - Chỉ hiển thị khi tạo mới */}
            {!editingProject && projectTemplates.length > 0 && (
              <>
                <Alert
                  message="Sử dụng Project Template"
                  description={`Chọn template dự án có sẵn cho nghiệp vụ "${business?.name || ''}" để tự động điền thông tin, hoặc nhập thủ công bên dưới.`}
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
                      <Tag color="green">{projectTemplates.length} template có sẵn</Tag>
                    </Space>
                  }
                >
                  <Select
                    placeholder="-- Chọn template dự án hoặc nhập thủ công --"
                    value={selectedProjectTemplate}
                    onChange={handleProjectTemplateSelect}
                    loading={loadingTemplates}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option?.children?.props?.children?.[1]?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {projectTemplates.map(template => (
                      <Option key={template.ID} value={template.ID}>
                        <Space>
                          <FolderOutlined style={{ color: '#faad14' }} />
                          {template.NAME}
                          {template.CODE && (
                            <Tag color="blue">{template.CODE}</Tag>
                          )}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                  <div style={{ 
                    marginTop: '8px', 
                    fontSize: '12px', 
                    color: '#8c8c8c',
                    fontStyle: 'italic' 
                  }}>
                    💡 Template sẽ tự động điền tên, mã và mô tả dự án
                  </div>
                </Form.Item>

                <Divider style={{ margin: '16px 0' }}>
                  <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                    Thông tin dự án
                  </span>
                </Divider>
              </>
            )}

            {!editingProject && projectTemplates.length === 0 && (
              <Alert
                message="Chưa có Project Template"
                description={
                  <span>
                    Chưa có project template nào. Bạn có thể{' '}
                    <a href="/settings">tạo template mới</a> hoặc nhập thủ công bên dưới.
                  </span>
                }
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                closable
              />
            )}

            <Form.Item
              name="name"
              label="Tên dự án"
              rules={[
                { required: true, message: 'Vui lòng nhập tên dự án' },
                { min: 3, message: 'Tên dự án phải có ít nhất 3 ký tự' }
              ]}
            >
              <Input 
                placeholder="Nhập tên dự án" 
                prefix={<FolderOutlined style={{ color: '#bfbfbf' }} />}
              />
            </Form.Item>

            <Form.Item
              name="code"
              label="Mã dự án"
              rules={[
                { required: true, message: 'Vui lòng nhập mã dự án' },
                { min: 2, message: 'Mã dự án phải có ít nhất 2 ký tự' }
              ]}
            >
              <Input 
                placeholder="Nhập mã dự án (VD: FE-DEV, BE-API)" 
                style={{ textTransform: 'uppercase' }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả' },
                { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' }
              ]}
            >
              <TextArea rows={4} placeholder="Nhập mô tả chi tiết về dự án" />
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
      </div>
    </MainLayout>
  );
};

export default ProjectList;