import React, { useState, useEffect, useMemo } from 'react';
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
  const [searchText, setSearchText] = useState('');


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
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        return;
      }

      // Add some basic validation
      if (!values.username?.trim()) {
        toast.error('Vui lòng nhập tên người dùng');
        return;
      }

      if (!editingUser && !values.company_id?.trim()) {
        toast.error('Vui lòng nhập ID công ty');
        return;
      }

      // Prepare user data based on whether we're editing or creating
      const userData = editingUser ? {
        username: values.username.trim(),
        // Only include password_hash if it's provided
        ...(values.password_hash && { password_hash: values.password_hash })
      } : {
        username: values.username.trim(),
        company_id: values.company_id.trim(),
        password_hash: values.password_hash,
        department: values.department?.trim()
      };

      if (editingUser) {
        // Update existing user
        const response = await axios.put(
          `http://192.84.105.173:5000/api/user/update/${editingUser.USER_ID}`,
          userData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data?.data) {
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.USER_ID === editingUser.USER_ID 
                ? { ...user, ...response.data.data }
                : user
            )
          );
          toast.success('Cập nhật người dùng thành công');
          setIsModalVisible(false);
          form.resetFields();
          setEditingUser(null);
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      
      // Xử lý lỗi unique constraint
      if (error.response?.data?.error?.includes('unique constraint')) {
        toast.error('Tên người dùng đã tồn tại, vui lòng chọn tên khác');
        return;
      }
      
      const errorMessage = error.response?.data?.message || 'Lỗi khi lưu người dùng';
      toast.error(errorMessage);
    }
  };

  // Handle edit user
  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.USERNAME,
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

  // Tạo dữ liệu đã được filter và search
  const filteredUsers = useMemo(() => {
    let result = users;
    
 
    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(user => 
        user.USERNAME?.toLowerCase().includes(searchLower) ||
        user.COMPANY_ID?.toLowerCase().includes(searchLower)
      );
    }
    
    return result;
  }, [users, searchText]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
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

        {/* Thêm section filter và search */}
        <div style={{ 
          marginBottom: '16px',
          display: 'flex',
          gap: '16px'
        }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên hoặc ID công ty"
            allowClear
            style={{ width: 300 }}
            onChange={handleSearch}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
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
              rules={[
                { required: true, message: 'Vui lòng nhập tên người dùng' },
                { min: 3, message: 'Tên người dùng phải có ít nhất 3 ký tự' },
                { max: 100, message: 'Tên người dùng không được vượt quá 100 ký tự' },
                {
                  validator: async (_, value) => {
                    if (!value || value === editingUser?.USERNAME) {
                      return Promise.resolve();
                    }
                    try {
                      const token = localStorage.getItem('accessToken');
                      const response = await axios.get(
                        `http://192.84.105.173:5000/api/user/check-username?username=${value}`,
                        {
                          headers: { Authorization: `Bearer ${token}` }
                        }
                      );
                      if (response.data.exists) {
                        return Promise.reject('Tên người dùng đã tồn tại');
                      }
                      return Promise.resolve();
                    } catch (error) {
                      return Promise.resolve(); // Cho phép submit form nếu API check lỗi
                    }
                  }
                }
              ]}
            >
              <Input />
            </Form.Item>

            {!editingUser && (
              <Form.Item
                name="company_id"
                label="ID Công ty"
                rules={[
                  { required: true, message: 'Vui lòng nhập ID công ty' },
                  { max: 50, message: 'ID công ty không được vượt quá 50 ký tự' }
                ]}
              >
                <Input />
              </Form.Item>
            )}

            <Form.Item
              name="password_hash"
              label={editingUser ? "Mật khẩu mới (để trống nếu không muốn thay đổi)" : "Mật khẩu"}
              rules={[
                { required: !editingUser, message: 'Vui lòng nhập mật khẩu' },
                { max: 255, message: 'Mật khẩu không được vượt quá 255 ký tự' }
              ]}
            >
              <Input.Password />
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