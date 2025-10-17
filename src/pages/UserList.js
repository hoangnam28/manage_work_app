import { useState, useEffect, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, Space, Select, Card, Avatar, Upload, Tag, Descriptions, Row, Col, Statistic, message } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined, EyeOutlined, UserOutlined, UploadOutlined, TeamOutlined, SafetyOutlined, ClockCircleOutlined } from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import { Toaster, toast } from 'sonner';
import { fetchUsersList, createUser, updateUser, deleteUser, uploadAvatar } from '../utils/user-api';

const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsersList();
      setUsers(data);
    } catch (error) {
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

      const userData = editingUser
        ? {
            username: values.username.trim(),
            department: values.department?.trim(),
            email: values.email?.trim(),
            avatar: avatarUrl || editingUser.AVATAR || null,
            ...(values.password_hash && { password_hash: values.password_hash }),
            ...(values.role && { role: Array.isArray(values.role) ? values.role : [values.role] }),
          }
        : {
            username: values.username.trim(),
            company_id: values.company_id.trim(),
            password_hash: values.password_hash,
            department: values.department?.trim(),
            email: values.email?.trim(),
            avatar: avatarUrl || null,
            role: Array.isArray(values.role) ? values.role : [values.role],
          };

      if (editingUser) {
        await updateUser(editingUser.USER_ID, userData);
        toast.success('Cập nhật người dùng thành công');

        const currentUser = JSON.parse(localStorage.getItem('userInfo'));
        if (currentUser && currentUser.userId === editingUser.USER_ID) {
          const updatedUserInfo = {
            ...currentUser,
            username: userData.username || currentUser.username,
            avatar: userData.avatar || currentUser.avatar,
            email: userData.email || currentUser.email,
          };
          localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        }

        handleCloseModal();
        await fetchUsers();
      } else {
        const response = await createUser(userData);

        if (response?.data) {
          setUsers((prevUsers) => [...prevUsers, response.data]);
          toast.success('Tạo người dùng thành công');
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi lưu người dùng';
      toast.error(errorMessage);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingUser(null);
    setAvatarUrl('');
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setAvatarUrl(user.AVATAR || '');
    form.setFieldsValue({
      username: user.USERNAME,
      department: user.DEPARTMENT,
      email: user.EMAIL,
      role: typeof user.ROLE === 'string' ? user.ROLE.split(',').map((r) => r.trim()) : user.ROLE,
    });
    setIsModalVisible(true);
  };

  const handleView = (user) => {
    setViewingUser(user);
    setIsDetailModalVisible(true);
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      toast.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xóa người dùng');
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users;

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(
        (user) =>
          user.USERNAME?.toLowerCase().includes(searchLower) ||
          user.COMPANY_ID?.toLowerCase().includes(searchLower) ||
          user.EMAIL?.toLowerCase().includes(searchLower) ||
          user.DEPARTMENT?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedRoles.length > 0) {
      result = result.filter((user) => {
        const userRoles = typeof user.ROLE === 'string' ? user.ROLE.split(',').map((r) => r.trim()) : Array.isArray(user.ROLE) ? user.ROLE : [];
        return selectedRoles.some((role) => userRoles.includes(role));
      });
    }

    return result;
  }, [users, searchText, selectedRoles]);

  const getRoleColor = (role) => {
    const colors = {
      admin: 'red',
      editor: 'blue',
      viewer: 'green',
      imp: 'purple',
      bo: 'orange',
    };
    return colors[role] || 'default';
  };

  const getRoleName = (role) => {
    const names = {
      admin: 'Admin',
      editor: 'Editor',
      viewer: 'Viewer',
      imp: 'Imp',
      bo: 'Bo',
    };
    return names[role] || role;
  };

  const handleAvatarUpload = async (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ được upload file ảnh!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!');
      return false;
    }

    setUploadLoading(true);
    try {
      const response = await uploadAvatar(file);

      if (response?.url) {
        console.log('Avatar uploaded, URL:', response.url);
        setAvatarUrl(response.url);
        message.success('Upload avatar thành công');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      message.error(error.response?.data?.message || 'Lỗi khi upload avatar');
    } finally {
      setUploadLoading(false);
    }
    return false;
  };

  const getAvatarSrc = (avatar) => {
    if (!avatar) return null;

    console.log('Getting avatar src for:', avatar);

    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }

    if (avatar.startsWith('/')) {
      const fullUrl = `http://192.84.105.173:5000${avatar}`;
      console.log('Full avatar URL:', fullUrl);
      return fullUrl;
    }

    return avatar;
  };

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'AVATAR',
      key: 'avatar',
      width: 80,
      align: 'center',
      render: (avatar, record) => (
        <Avatar
          size={48}
          src={getAvatarSrc(avatar)}
          icon={!avatar && <UserOutlined />}
          style={{ backgroundColor: !avatar ? '#1890ff' : undefined }}
        >
          {!avatar && record.USERNAME?.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'USERNAME',
      key: 'username',
      sorter: (a, b) => (a.USERNAME || '').localeCompare(b.USERNAME || ''),
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'ID Công ty',
      dataIndex: 'COMPANY_ID',
      key: 'company_id',
      sorter: (a, b) => (a.COMPANY_ID || '').localeCompare(b.COMPANY_ID || ''),
    },
    {
      title: 'Email',
      dataIndex: 'EMAIL',
      key: 'email',
      render: (email) => email || <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: 'Phòng ban',
      dataIndex: 'DEPARTMENT',
      key: 'department',
      render: (dept) => dept || <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: 'Vai trò',
      dataIndex: 'ROLE',
      key: 'role',
      render: (role) => {
        const rolesArr = typeof role === 'string' ? role.split(',').map((r) => r.trim()) : Array.isArray(role) ? role : [];
        return (
          <Space size={4} wrap>
            {rolesArr.map((r) => (
              <Tag key={r} color={getRoleColor(r)}>
                {getRoleName(r)}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'CREATED_AT',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
      sorter: (a, b) => new Date(a.CREATED_AT) - new Date(b.CREATED_AT),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 160,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="default" icon={<EyeOutlined />} onClick={() => handleView(record)} title="Xem chi tiết" />
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} title="Chỉnh sửa" />
          <Popconfirm
            title="Xóa người dùng"
            description="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.USER_ID)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const statsData = useMemo(() => {
    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.ROLE?.includes('admin')).length;
    const editorCount = users.filter((u) => u.ROLE?.includes('editor')).length;
    const viewerCount = users.filter((u) => u.ROLE?.includes('viewer')).length;

    return { totalUsers, adminCount, editorCount, viewerCount };
  }, [users]);

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff', marginBottom: '8px' }}>
            <TeamOutlined /> Quản lý người dùng
          </h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>Quản lý tài khoản và phân quyền người dùng hệ thống</p>

          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng người dùng"
                  value={statsData.totalUsers}
                  prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Admin"
                  value={statsData.adminCount}
                  prefix={<SafetyOutlined style={{ color: '#f5222d' }} />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Editor"
                  value={statsData.editorCount}
                  prefix={<EditOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Viewer"
                  value={statsData.viewerCount}
                  prefix={<EyeOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                size="large"
                onClick={() => {
                  setEditingUser(null);
                  form.resetFields();
                  setAvatarUrl('');
                  setIsModalVisible(true);
                }}
              >
                Thêm người dùng
              </Button>
            </div>

            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Input.Search
                  placeholder="Tìm kiếm theo tên, ID công ty, email, phòng ban..."
                  allowClear
                  size="large"
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  mode="multiple"
                  allowClear
                  size="large"
                  style={{ width: '100%' }}
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
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="Số dòng trên trang"
                  value={pageSize}
                  onChange={setPageSize}
                >
                  <Option value={5}>5 dòng/trang</Option>
                  <Option value={10}>10 dòng/trang</Option>
                  <Option value={20}>20 dòng/trang</Option>
                  <Option value={50}>50 dòng/trang</Option>
                  <Option value={100}>100 dòng/trang</Option>
                </Select>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={filteredUsers}
              rowKey="USER_ID"
              loading={loading}
              pagination={{
                pageSize: pageSize,
                showSizeChanger: false,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
                position: ['bottomCenter'],
              }}
              scroll={{ x: 1200 }}
            />
          </Space>
        </Card>

        <Modal
          title={
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </div>
          }
          open={isModalVisible}
          onCancel={handleCloseModal}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item label="Avatar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Avatar
                  size={80}
                  src={getAvatarSrc(avatarUrl || editingUser?.AVATAR)}
                  icon={!avatarUrl && !editingUser?.AVATAR && <UserOutlined />}
                  style={{ backgroundColor: !avatarUrl && !editingUser?.AVATAR ? '#1890ff' : undefined }}
                >
                  {!avatarUrl && !editingUser?.AVATAR && (editingUser?.USERNAME || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <Upload
                  showUploadList={false}
                  beforeUpload={handleAvatarUpload}
                  accept="image/*"
                  disabled={uploadLoading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadLoading}>
                    {uploadLoading ? 'Đang tải...' : 'Upload Avatar'}
                  </Button>
                </Upload>
                {(avatarUrl || editingUser?.AVATAR) && <Button danger onClick={() => setAvatarUrl('')}>
                    Xóa
                  </Button>}
              </div>
            </Form.Item>

            <Form.Item
              name="username"
              label="Tên người dùng"
              rules={[
                { required: true, message: 'Vui lòng nhập tên người dùng' },
                { min: 3, message: 'Tên người dùng phải có ít nhất 3 ký tự' },
                { max: 100, message: 'Tên người dùng không được vượt quá 100 ký tự' },
              ]}
            >
              <Input size="large" placeholder="Nhập tên người dùng" />
            </Form.Item>

            {!editingUser && (
              <Form.Item
                name="company_id"
                label="ID Công ty"
                rules={[
                  { required: true, message: 'Vui lòng nhập ID công ty' },
                  { max: 50, message: 'ID công ty không được vượt quá 50 ký tự' },
                ]}
              >
                <Input size="large" placeholder="Nhập ID công ty" />
              </Form.Item>
            )}

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
                {
                  pattern: /^[A-Za-z0-9._%+-]+@meiko-elec\.com$/,
                  message: 'Email phải có đuôi @meiko-elec.com',
                },
              ]}
            >
              <Input size="large" placeholder="example@meiko-elec.com" />
            </Form.Item>

            <Form.Item
              name="department"
              label="Phòng ban"
              rules={[{ max: 50, message: 'Phòng ban không được vượt quá 50 ký tự' }]}
            >
              <Input size="large" placeholder="Nhập phòng ban" />
            </Form.Item>

            <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
              <Select mode="multiple" size="large" allowClear placeholder="Chọn vai trò">
                <Option value="admin">Admin</Option>
                <Option value="editor">Editor</Option>
                <Option value="viewer">Viewer</Option>
                <Option value="imp">Imp</Option>
                <Option value="bo">Bo</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="password_hash"
              label={editingUser ? 'Mật khẩu mới (để trống nếu không muốn thay đổi)' : 'Mật khẩu'}
              rules={[
                { required: !editingUser, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                { max: 255, message: 'Mật khẩu không được vượt quá 255 ký tự' },
              ]}
            >
              <Input.Password size="large" placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
              <Space>
                <Button type="primary" htmlType="submit" size="large">
                  {editingUser ? 'Cập nhật' : 'Tạo mới'}
                </Button>
                <Button size="large" onClick={handleCloseModal}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              <EyeOutlined /> Chi tiết người dùng
            </div>
          }
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
              Đóng
            </Button>,
            <Button
              key="edit"
              type="primary"
              onClick={() => {
                setIsDetailModalVisible(false);
                handleEdit(viewingUser);
              }}
            >
              Chỉnh sửa
            </Button>,
          ]}
          width={700}
        >
          {viewingUser && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Avatar
                  size={120}
                  src={getAvatarSrc(viewingUser.AVATAR)}
                  icon={!viewingUser.AVATAR && <UserOutlined />}
                  style={{ backgroundColor: !viewingUser.AVATAR ? '#1890ff' : undefined }}
                >
                  {!viewingUser.AVATAR && viewingUser.USERNAME?.charAt(0).toUpperCase()}
                </Avatar>
                <h2 style={{ marginTop: '16px', marginBottom: '4px' }}>{viewingUser.USERNAME}</h2>
                <p style={{ color: '#666' }}>{viewingUser.COMPANY_ID}</p>
              </div>

              <Descriptions bordered column={1}>
                <Descriptions.Item label="User ID">{viewingUser.USER_ID}</Descriptions.Item>
                <Descriptions.Item label="Email">
                  {viewingUser.EMAIL || <span style={{ color: '#999' }}>Chưa cập nhật</span>}
                </Descriptions.Item>
                <Descriptions.Item label="Phòng ban">
                  {viewingUser.DEPARTMENT || <span style={{ color: '#999' }}>Chưa cập nhật</span>}
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                  <Space size={4} wrap>
                    {(typeof viewingUser.ROLE === 'string'
                      ? viewingUser.ROLE.split(',').map((r) => r.trim())
                      : Array.isArray(viewingUser.ROLE)
                      ? viewingUser.ROLE
                      : []
                    ).map((r) => (
                      <Tag key={r} color={getRoleColor(r)}>
                        {getRoleName(r)}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  <ClockCircleOutlined /> {new Date(viewingUser.CREATED_AT).toLocaleString('vi-VN')}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default UserManagement;