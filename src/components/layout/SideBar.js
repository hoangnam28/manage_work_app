import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import './SideBar.css';

const { Sider } = Layout;

const SideBar = ({ onLogout, userId }) => {
  const [collapsed, setCollapsed] = useState(false); // State to manage sidebar collapse
  const location = useLocation(); // Get the current route

  const storedUser = localStorage.getItem("userInfo");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const menuItems = [
    {
      key: '/review_tasks',
      label: <Link to="/review_tasks">Review Tasks</Link>,
    },
    {
      key: '/impedance',
      label: <Link to="/impedance">Impedance</Link>,
    },
  ];

  return (
    <Sider
      width={200} // Full width when expanded
      collapsible
      collapsed={collapsed}
      collapsedWidth={0} // Fully collapse the sidebar
      onCollapse={setCollapsed}
      className="site-layout-background"
      trigger={null} // Disable default trigger
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