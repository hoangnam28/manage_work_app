import React from 'react';
import { Layout, Menu, Dropdown, Button, Avatar } from 'antd';
import { UserOutlined, DownOutlined, LogoutOutlined } from '@ant-design/icons';
import './SideBar.css';

const { Sider } = Layout;

const SideBar = ({ onLogout, userId }) => {
  const menu1 = {
    items: [
      { key: '1', label: 'Option 1' },
      { key: '2', label: 'Option 2' },
      { key: '3', label: 'Option 3' },
    ]
  };

  const menu2 = {
    items: [
      { key: '1', label: 'Option 1' },
      { key: '2', label: 'Option 2' },
      { key: '3', label: 'Option 3' },
    ]
  };

  const menu3 = {
    items: [
      { key: '1', label: 'Option 1' },
      { key: '2', label: 'Option 2' },
      { key: '3', label: 'Option 3' },
    ]
  };

  const storedUser = localStorage.getItem("userInfo");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const menuItems = [
    {
      key: '1',
      label: (
        <Dropdown menu={menu1} trigger={['click']}>
          <span className="ant-dropdown-link">
            Menu 1 <DownOutlined />
          </span>
        </Dropdown>
      ),
    },
    {
      key: '2',
      label: (
        <Dropdown menu={menu2} trigger={['click']}>
          <span className="ant-dropdown-link">
            Menu 2 <DownOutlined />
          </span>
        </Dropdown>
      ),
    },
    {
      key: '3',
      label: (
        <Dropdown menu={menu3} trigger={['click']}>
          <span className="ant-dropdown-link">
            Menu 3 <DownOutlined />
          </span>
        </Dropdown>
      ),
    },
  ];

  return (
    <Sider width={200} className="site-layout-background">
      <div className="sidebar-header">
        <Avatar
          size={32}
          icon={<UserOutlined />}
          src={userId ? `http://192.84.105.173:5000/api/auth/avatar/${userId}` : null}
        />
        <span style={{ marginLeft: '8px' }}>{user?.username || "Guest"}</span>
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
      />
      <div className="sidebar-footer">
        <Button type="primary" icon={<LogoutOutlined />} onClick={onLogout}>
          Logout
        </Button>
      </div>
    </Sider>
  );
};

export default SideBar;