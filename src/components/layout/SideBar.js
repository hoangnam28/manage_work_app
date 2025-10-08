import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Modal, Form, Input } from 'antd';
import axios from '../../utils/axios';
import { toast } from 'sonner';
import {
  UserOutlined,
  LogoutOutlined,
  RightOutlined,
  LeftOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  TeamOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import './SideBar.css';
const { Sider } = Layout;

const SideBar = ({ onLogout, userId }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const [pwOpen, setPwOpen] = useState(false);
  const [form] = Form.useForm();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.startsWith('/material') || location.pathname.startsWith('/ul-material')) {
      setOpenKeys(['material']);
    }
  }, [location.pathname]);

  const storedUser = localStorage.getItem("userInfo");
  const user = storedUser ? JSON.parse(storedUser) : null;
   const getAvatarSrc = () => {
    if (!user?.avatar) return null;
    if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
      return user.avatar;
    } 
    if (user.avatar.startsWith('/uploads/')) {
      return `http://192.84.105.173:5000${user.avatar}`;
    }
    
    return user.avatar;
  };


  const menuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: (
        <Link
          to="/home"
          style={location.pathname === '/home' ? { color: '#1890ff', fontWeight: 600 } : {}}
        >
          Home
        </Link>
      ),
    },
    {
      key: '/review_tasks',
      icon: <FileSearchOutlined />,
      label: (
        <Link to="/review_tasks" style={location.pathname === '/review_tasks' ? { color: '#1890ff', fontWeight: 600 } : {}}>
          Review Tasks
        </Link>
      ),
    },
    {
      key: '/impedance',
      icon: <BarChartOutlined />,
      label: (
        <Link to="/impedance" style={location.pathname === '/impedance' ? { color: '#1890ff', fontWeight: 600 } : {}}>
          Impedance
        </Link>
      ),
    },
    {
      key: 'material',
      icon: <FileSearchOutlined />,
      label: 'Material',
      children: [
        {
          key: '/material-core',
          label: (
            <Link to="/material-core" style={location.pathname === '/material-core' ? { color: '#1890ff', fontWeight: 600 } : {}}>
              Core
            </Link>
          ),
        },
        {
          key: '/material-properties',
          label: (
            <Link to="/material-properties" style={location.pathname === '/material-properties' ? { color: '#1890ff', fontWeight: 600 } : {}}>
              Prepreg
            </Link>
          ),
        },
        {
          key: '/material-new',
          label: (
            <Link to="/material-new" style={location.pathname === '/material-new' ? { color: '#1890ff', fontWeight: 600 } : {}}>
              New
            </Link>
          ),
        },
        // {
        //   key: '/ul-material',
        //   label: (
        //     <Link to="/ul-material" style={location.pathname === '/ul-material' ? { color: '#1890ff', fontWeight: 600 } : {}}>
        //       UL Material
        //     </Link>
        //   ),
        // },
       
      ]
    },
    {
      key: '/user-management',
      icon: <TeamOutlined />,
      label: (
        <Link to="/user-management" style={location.pathname === '/user-management' ? { color: '#1890ff', fontWeight: 600 } : {}}>
          User List
        </Link>
      ),
    },
    {
      key: '/decide-use',
      icon: <CheckCircleOutlined />,
      label: (
        <Link to="/decide-use" style={location.pathname === '/decide-use' ? { color: '#1890ff', fontWeight: 600 } : {}}>
          Large Size Board
        </Link>
      )
    },
    {
      key: 'defect-details',
      icon: <CopyOutlined />,
      label: (
        <a href="http://192.84.105.173:3000/services/defect-details" target="_blank" rel="noopener noreferrer" style={location.pathname === '/defect-details' ? { color: '#1890ff', fontWeight: 600 } : {}}>
          Defect Details
        </a>
      ),
    },
     {
          key: '/material-certification',
          icon: <SafetyCertificateOutlined />,
          label: (
            <Link to="/material-certification" style={location.pathname === '/material-certification' ? { color: '#1890ff', fontWeight: 600 } : {}}>
              Material Certification
            </Link>
          ),
        },
        { key: '/ink-management',
          icon: <SafetyCertificateOutlined />,
          label: (
            <Link to="/ink-management" style={location.pathname === '/ink-management' ? { color: '#1890ff', fontWeight: 600 } : {}}>
              Ink Management
            </Link>
          ),
        },
  ];
  return (
    <Sider
      width={200}
      collapsible
      collapsed={collapsed}
      collapsedWidth={0}
      onCollapse={setCollapsed}
      className="site-layout-background"
      trigger={null}
    >
      <div className="sidebar-header">
        {!collapsed && (
          <>
            <Avatar
              size={42}
              icon={<UserOutlined />}
              src={getAvatarSrc()} // ✅ Thay đổi chỗ này
              onClick={() => setPwOpen(true)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ marginLeft: '8px' }}>{user?.username}</span>
          </>
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
      />
      <div className="sidebar-footer">
        <Button
          type="primary"
          icon={<LogoutOutlined />}
          onClick={onLogout}
          title="Bạn sẽ đăng xuất đấy"
        >
          {!collapsed && 'Logout'}
        </Button>
      </div>

      <div className={`sidebar-toggle-container ${collapsed ? 'collapsed' : ''}`}>
        <Button
          type="primary"
          shape="circle"
          icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>
      <Modal
        title="Đổi mật khẩu"
        open={pwOpen}
        onCancel={() => setPwOpen(false)}
        onOk={async () => {
          try {
            const values = await form.validateFields();
            if (values.new_password !== values.confirm_password) {
              toast.error('Mật khẩu mới và xác nhận không khớp');
              return;
            }
            await axios.post('/auth/change-password', {
              current_password: values.current_password,
              new_password: values.new_password
            });
            toast.success('Đổi mật khẩu thành công');
            setPwOpen(false);
            form.resetFields();
          } catch (e) {
            if (e?.errorFields) return; // form error
            const msg = e?.response?.data?.message || 'Lỗi khi đổi mật khẩu';
            toast.error(msg);
          }
        }}
        okText="Đổi mật khẩu"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="current_password" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Nhập mật khẩu hiện tại' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="new_password" label="Mật khẩu mới" rules={[{ required: true, message: 'Nhập mật khẩu mới' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirm_password" label="Xác nhận mật khẩu mới" rules={[{ required: true, message: 'Nhập xác nhận mật khẩu' }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Sider>
  );
};

export default SideBar;