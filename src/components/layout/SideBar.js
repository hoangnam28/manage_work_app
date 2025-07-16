import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar } from 'antd';
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
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import './SideBar.css';

const { Sider } = Layout;

const SideBar = ({ onLogout, userId }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.startsWith('/material')) {
      setOpenKeys(['material']);
    }
  }, [location.pathname]);

  const storedUser = localStorage.getItem("userInfo");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const menuItems = [
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
              Materials Core
            </Link>
          ),
        },
        {
          key: '/material-properties',
          label: (
            <Link to="/material-properties" style={location.pathname === '/material-properties' ? { color: '#1890ff', fontWeight: 600 } : {}}>
              Materials Prepreg
            </Link>
          ),
        }
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
      key: 'decide-use',
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
              size={32}
              icon={<UserOutlined />}
              src={userId ? `http://192.84.105.173:5000/api/auth/avatar/${userId}` : null}
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
        <Button type="primary" icon={<LogoutOutlined />} onClick={onLogout}>
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
    </Sider>
  );
};

export default SideBar;