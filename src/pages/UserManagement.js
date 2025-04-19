import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, Space, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import axios from 'axios';
import MainLayout from '../components/layout/MainLayout';
import { Toaster, toast } from 'sonner';

const { Title } = Typography;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);

  // Fetch users data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://192.84.105.173:5000/api/user/list', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 403) {
        toast.error('Bạn không có quyền truy cập trang này');
      } else {
        toast.error('Lỗi khi tải dữ liệu người dùng');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const userData = {
        ...values,
        is_admin: values.is_admin ? 1 : 0
      };

      if (editingUser) {
        // Update existing user
        const response = await axios.put(
          `http://192.84.105.173:5000/api/user/update/${editingUser.USER_ID}`,
          userData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.USER_ID === editingUser.USER_ID 
              ? { ...user, ...response.data.data } 
              : user
          )
        );
        
        toast.success('Cập nhật người dùng thành công');
      } else {
        // Create new user
        const response = await axios.post(
          'http://192.84.105.173:5000/api/user/create',
          userData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Add the new user to the local state
        if (response.data && response.data.data) {
          setUsers(prevUsers => [...prevUsers, response.data.data]);
        }
        
        toast.success('Tạo người dùng thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi lưu người dùng');
    }
  };

  // Handle edit user
  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.USERNAME,
      company_id: user.COMPANY_ID,
      department: user.DEPARTMENT
    });
    setIsModalVisible(true);
  };

  // Handle delete user
  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(
        `http://192.84.105.173:5000/api/user/delete/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xóa người dùng');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'USER_ID',
      key: 'user_id',
      width: 80,
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'USERNAME',
      key: 'username',
    },
    {
      title: 'ID Công ty',
      dataIndex: 'COMPANY_ID',
      key: 'company_id',
    },
    {
      title: 'Phòng ban',
      dataIndex: 'DEPARTMENT',
      key: 'department',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'CREATED_AT',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa người dùng"
            description="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.USER_ID)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Title level={2}>Quản lý người dùng</Title>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => {
              setEditingUser(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Thêm người dùng
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="USER_ID"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
            setEditingUser(null);
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="username"
              label="Tên người dùng"
              rules={[{ required: true, message: 'Vui lòng nhập tên người dùng' }]}
            >
              <Input />
            </Form.Item>

            {!editingUser && (
              <Form.Item
                name="company_id"
                label="ID Công ty"
                rules={[{ required: true, message: 'Vui lòng nhập ID công ty' }]}
              >
                <Input />
              </Form.Item>
            )}

            {!editingUser && (
              <Form.Item
                name="password_hash"
                label="Mật khẩu"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
              >
                <Input.Password />
              </Form.Item>
            )}

            {editingUser && (
              <Form.Item
                name="password_hash"
                label="Mật khẩu mới (để trống nếu không muốn thay đổi)"
              >
                <Input.Password />
              </Form.Item>
            )}

            <Form.Item
              name="department"
              label="Phòng ban"
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default UserManagement; 