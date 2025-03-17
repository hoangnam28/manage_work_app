import React from 'react';
import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import SideBar from './SideBar';
import './MainLayout.css';

const { Header, Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  const username = localStorage.getItem('username');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideBar username={username} onLogout={handleLogout} />
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}></Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;