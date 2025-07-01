import { useState } from 'react';
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
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import './SideBar.css';

const { Sider } = Layout;

const SideBar = ({ onLogout, userId }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const storedUser = localStorage.getItem("userInfo");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const menuItems = [
    {
      key: '/review_tasks',
      icon: <FileSearchOutlined />, 
      label: <Link to="/review_tasks">Review Tasks</Link>,
    },
    {
      key: '/impedance',
      icon: <BarChartOutlined />,
      label: <Link to="/impedance">Impedance</Link>,
    },
    {
      key: 'material',
      icon: <FileSearchOutlined />,
      label: 'Material',
      children: [
        {
          key: '/material-core',
          label: <Link to="/material-core">Materials Core</Link>,
        },
        {
          key: '/material-properties',
          label: <Link to="/material-properties">Materials Prepreg</Link>,
        }
      ]
    },
    {
      key: '/user-management',
      icon: <TeamOutlined />, 
      label: <Link to="/user-management">User List</Link>,
    },
    {
      key: 'defect-details',
      icon: <CopyOutlined />,
      label: <a href="http://192.84.105.173:3000/services/defect-details" target="_blank" rel="noopener noreferrer">Defect Details</a>,
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