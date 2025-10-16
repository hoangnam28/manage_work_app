import React, { useState, useEffect } from 'react';
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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const { Title } = Typography;
const { TextArea } = Input;

const ProjectList = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [business, setBusiness] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form] = Form.useForm();

  // Load projects
  const loadProjects = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      // const data = await projectApi.getProjectsByBusiness(businessId);
      // setProjects(data);
      
      // Mock data for now
      setProjects([
        {
          id: 1,
          name: 'Dự án A',
          code: 'PA001',
          description: 'Mô tả dự án A',
          status: 'ACTIVE',
          createdBy: 1,
          creatorName: 'Admin',
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      message.error('Lỗi khi tải danh sách dự án');
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load users
  const loadUsers = async () => {
    try {
      // TODO: Implement API call
      // const data = await userApi.getUsers();
      // setUsers(data);
      
      // Mock data for now
      setUsers([
        { id: 1, username: 'admin', fullName: 'Administrator' },
        { id: 2, username: 'user1', fullName: 'User 1' },
        { id: 3, username: 'user2', fullName: 'User 2' }
      ]);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, [businessId]);

  // Handle create/update project
  const handleSubmit = async (values) => {
    try {
      if (editingProject) {
        // TODO: Implement update API
        // await projectApi.updateProject(editingProject.id, values);
        message.success('Cập nhật dự án thành công');
      } else {
        // TODO: Implement create API
        // await projectApi.createProject({ ...values, businessId });
        message.success('Tạo dự án thành công');
      }
      
      setModalVisible(false);
      setEditingProject(null);
      form.resetFields();
      loadProjects();
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
      // TODO: Implement delete API
      // await projectApi.deleteProject(projectId);
      message.success('Xóa dự án thành công');
      loadProjects();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa dự án');
      console.error('Error deleting project:', error);
    }
  };

  // Handle view tasks
  const handleViewTasks = (projectId) => {
    navigate(`/business/${businessId}/project/${projectId}/tasks`);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'INACTIVE': return 'red';
      case 'COMPLETED': return 'blue';
      default: return 'default';
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
          {status === 'ACTIVE' ? 'Hoạt động' : 
           status === 'INACTIVE' ? 'Tạm dừng' : 'Hoàn thành'}
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
                    <Button onClick={() => navigate(`/business/${businessId}`)}>
                      Quay lại
                    </Button>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingProject(null);
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
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số dự án"
                value={projects.length}
                prefix={<FolderOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Dự án hoạt động"
                value={projects.filter(p => p.status === 'ACTIVE').length}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Dự án hoàn thành"
                value={projects.filter(p => p.status === 'COMPLETED').length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng tasks"
                value={0}
                suffix="tasks"
              />
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
          title={editingProject ? 'Cập nhật dự án' : 'Tạo dự án mới'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingProject(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Tên dự án"
              rules={[
                { required: true, message: 'Vui lòng nhập tên dự án' },
                { min: 3, message: 'Tên dự án phải có ít nhất 3 ký tự' }
              ]}
            >
              <Input placeholder="Nhập tên dự án" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Mã dự án"
              rules={[
                { required: true, message: 'Vui lòng nhập mã dự án' },
                { min: 2, message: 'Mã dự án phải có ít nhất 2 ký tự' }
              ]}
            >
              <Input placeholder="Nhập mã dự án" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả' },
                { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập mô tả chi tiết về dự án"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Hủy
                </Button>
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
