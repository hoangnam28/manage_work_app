import React from 'react';
import { Layout, Menu, Dropdown, Button, Avatar } from 'antd';
import { UserOutlined, DownOutlined, LogoutOutlined } from '@ant-design/icons';
import './SideBar.css';

const { Sider } = Layout;

const SideBar = ({ username, onLogout, userId }) => {
    const menu = (
        <Menu>
            <Menu.Item key="1">Option 1</Menu.Item>
            <Menu.Item key="2">Option 2</Menu.Item>
            <Menu.Item key="3">Option 3</Menu.Item>
        </Menu>
    );

    return (
        <Sider width={200} className="site-layout-background">
            <div className="sidebar-header">
                <Avatar 
                    size={32}
                    icon={<UserOutlined />}
                    src={userId ? `http://localhost:5000/api/auth/avatar/${userId}` : null}
                />
                <span style={{ marginLeft: '8px' }}>{username}</span>
            </div>
            <Menu mode="inline" defaultSelectedKeys={['1']} style={{ height: '100%', borderRight: 0 }}>
                <Menu.Item key="1">
                    <Dropdown overlay={menu}>
                        <button className="ant-dropdown-link" onClick={e => e.preventDefault()} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                            Menu 1 <DownOutlined />
                        </button>
                    </Dropdown>
                </Menu.Item>
                <Menu.Item key="2">
                    <Dropdown overlay={menu}>
                        <button className="ant-dropdown-link" onClick={e => e.preventDefault()} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                            Menu 2 <DownOutlined />
                        </button>
                    </Dropdown>
                </Menu.Item>
                <Menu.Item key="3">
                    <Dropdown overlay={menu}>
                        <button className="ant-dropdown-link" onClick={e => e.preventDefault()} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                            Menu 3 <DownOutlined />
                        </button>
                    </Dropdown>
                </Menu.Item>
            </Menu>
            <div className="sidebar-footer">
                <Button type="primary" icon={<LogoutOutlined />} onClick={onLogout}>
                    Logout
                </Button>
            </div>
        </Sider>
    );
};

export default SideBar;