import { useState, useEffect, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, Space, Select } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import axios from '../utils/axios';
import MainLayout from '../components/layout/MainLayout';
import { Toaster, toast } from 'sonner';

const { Option } = Select;


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);



  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/user/list`);
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

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        return;
      }
      if (!values.username?.trim()) {
        toast.error('Vui lòng nhập tên người dùng');
        return;
      }

      if (!editingUser && !values.company_id?.trim()) {
        toast.error('Vui lòng nhập ID công ty');
        return;
      }
      const userData = editingUser ? {
        username: values.username.trim(),
        ...(values.password_hash && { password_hash: values.password_hash }),
        ...(values.role && { role: Array.isArray(values.role) ? values.role : [values.role] })
      } : {
        username: values.username.trim(),
        company_id: values.company_id.trim(),
        password_hash: values.password_hash,
        department: values.department?.trim(),
        role: Array.isArray(values.role) ? values.role : [values.role]
      };

      if (editingUser) {
        const response = await axios.put(
          `/user/update/${editingUser.USER_ID}`,
          userData
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
      } else {
        const response = await axios.post(
          `/user/create`,
          userData
        );

        if (response.data?.data) {
          setUsers(prevUsers => [...prevUsers, response.data.data]);
          toast.success('Tạo người dùng thành công');
          setIsModalVisible(false);
          form.resetFields();
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);

      if (error.response?.data?.error?.includes('unique constraint')) {
        toast.error('Tên người dùng đã tồn tại, vui lòng chọn tên khác');
        return;
      }

      const errorMessage = error.response?.data?.message || 'Lỗi khi lưu người dùng';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.USERNAME,
      role: typeof user.ROLE === 'string' ? user.ROLE.split(',').map(r => r.trim()) : user.ROLE
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(
        `/user/delete/${userId}`
      );
      toast.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xóa người dùng');
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users;
    
    // Lọc theo text tìm kiếm
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(user =>
        user.USERNAME?.toLowerCase().includes(searchLower) ||
        user.COMPANY_ID?.toLowerCase().includes(searchLower)
      );
    }

    // Lọc theo vai trò được chọn
    if (selectedRoles.length > 0) {
      result = result.filter(user => {
        const userRoles = typeof user.ROLE === 'string' 
          ? user.ROLE.split(',').map(r => r.trim()) 
          : Array.isArray(user.ROLE) ? user.ROLE : [];
        return selectedRoles.some(role => userRoles.includes(role));
      });
    }

    return result;
  }, [users, searchText, selectedRoles]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

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
      title: 'Vai trò',
      dataIndex: 'ROLE',
      key: 'role',
      render: (role) => {
        const roleColors = {
          admin: 'red',
          editor: 'blue',
          viewer: 'green',
          imp: 'purple',
          bo: 'orange'
        };
        const roleNames = {
          admin: 'Admin',
          editor: 'Editor',
          viewer: 'Viewer',
          imp: 'Imp',
          bo: 'Bo'
        };
        const rolesArr = typeof role === 'string' ? role.split(',').map(r => r.trim()) : Array.isArray(role) ? role : [];
        return rolesArr.map(r => (
          <span key={r} style={{ color: roleColors[r] || 'black', marginRight: 8 }}>
            {roleNames[r] || r}
          </span>
        ));
      }
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
        <h1 style={{ color: 'red' }}>User Management</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
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
          <Select
            mode="multiple"
            allowClear
            style={{ width: 300 }}
            placeholder="Lọc theo vai trò"
            onChange={setSelectedRoles}
            value={selectedRoles}
          >
            <Option value="admin">Admin</Option>
            <Option value="editor">Editor</Option>
            <Option value="viewer">Viewer</Option>
            <Option value="imp">Imp</Option>
            <Option value="bo">Bo</Option>
          </Select>
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
              name="role"
              label="Vai trò"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            >
              <Select mode="multiple" allowClear placeholder="Chọn vai trò">
                <Option value="admin">Admin</Option>
                <Option value="editor">Editor</Option>
                <Option value="viewer">Viewer</Option>
                <Option value="imp">Imp</Option>
                <Option value="bo">Bo</Option>
              </Select>
            </Form.Item>

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
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập email!',
                },
                {
                  type: 'email',
                  message: 'Email không hợp lệ!',
                },
                {
                  pattern: /^[A-Za-z0-9._%+-]+@meiko-elec\.com$/,
                  message: 'Email phải có đuôi @meiko-elec.com',
                },
              ]}
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