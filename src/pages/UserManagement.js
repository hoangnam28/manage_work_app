import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Switch
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';

const { Title } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      // const data = await userApi.getUsers();
      // setUsers(data);
      
      // Mock data for now
      setUsers([
        {
          id: 1,
          username: 'admin',
          fullName: 'Administrator',
          email: 'admin@example.com',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          username: 'user1',
          fullName: 'User 1',
          email: 'user1@example.com',
          role: 'USER',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          username: 'user2',
          fullName: 'User 2',
          email: 'user2@example.com',
          role: 'USER',
          isActive: false,
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      message.error('Lỗi khi tải danh sách người dùng');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handle create/update user
  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        // TODO: Implement update API
        // await userApi.updateUser(editingUser.id, values);
        message.success('Cập nhật người dùng thành công');
      } else {
        // TODO: Implement create API
        // await userApi.createUser(values);
        message.success('Tạo người dùng thành công');
      }
      
      setModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      loadUsers();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu người dùng');
      console.error('Error saving user:', error);
    }
  };

  // Handle edit user
  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    setModalVisible(true);
  };

  // Handle delete user
  const handleDelete = async (userId) => {
    try {
      // TODO: Implement delete API
      // await userApi.deleteUser(userId);
      message.success('Xóa người dùng thành công');
      loadUsers();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa người dùng');
      console.error('Error deleting user:', error);
    }
  };

  // Handle toggle user status
  const handleToggleStatus = async (userId, isActive) => {
    try {
      // TODO: Implement toggle API
      // await userApi.toggleUserStatus(userId, isActive);
      message.success(`${isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} người dùng thành công`);
      loadUsers();
    } catch (error) {
      message.error('Có lỗi xảy ra khi thay đổi trạng thái người dùng');
      console.error('Error toggling user status:', error);
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'red';
      case 'MANAGER': return 'blue';
      case 'USER': return 'green';
      default: return 'default';
    }
  };

  // Get role text
  const getRoleText = (role) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên';
      case 'MANAGER': return 'Quản lý';
      case 'USER': return 'Người dùng';
      default: return role;
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleStatus(record.id, checked)}
          checkedChildren={<UnlockOutlined />}
          unCheckedChildren={<LockOutlined />}
        />
      )
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
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa người dùng này?"
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
                    <TeamOutlined style={{ marginRight: '8px' }} />
                    Quản lý Người dùng
                  </Title>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingUser(null);
                      form.resetFields();
                      setModalVisible(true);
                    }}
                  >
                    Tạo người dùng mới
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số người dùng"
                value={users.length}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Người dùng hoạt động"
                value={users.filter(u => u.isActive).length}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Quản trị viên"
                value={users.filter(u => u.role === 'ADMIN').length}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Người dùng thường"
                value={users.filter(u => u.role === 'USER').length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        <Card>
          <Table
            columns={columns}
            dataSource={users}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} người dùng`
            }}
          />
        </Card>

        <Modal
          title={editingUser ? 'Cập nhật người dùng' : 'Tạo người dùng mới'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingUser(null);
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
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="username"
                  label="Tên đăng nhập"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                    { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' }
                  ]}
                >
                  <Input placeholder="Nhập tên đăng nhập" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="fullName"
                  label="Họ tên"
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ tên' },
                    { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
                  ]}
                >
                  <Input placeholder="Nhập họ tên" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="role"
                  label="Vai trò"
                  rules={[
                    { required: true, message: 'Vui lòng chọn vai trò' }
                  ]}
                >
                  <Select placeholder="Chọn vai trò">
                    <Option value="ADMIN">Quản trị viên</Option>
                    <Option value="MANAGER">Quản lý</Option>
                    <Option value="USER">Người dùng</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="Trạng thái"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Tạm khóa"
                  />
                </Form.Item>
              </Col>
            </Row>

            {!editingUser && (
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
            )}

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingUser ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default UserManagement;
