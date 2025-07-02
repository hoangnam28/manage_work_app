import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import SideBar from './SideBar';
import './MainLayout.css';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    navigate('/'); 
  };

  const username = localStorage.getItem('username');

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <SideBar username={username} onLogout={handleLogout} />
      <Layout>
        <Content style={{ margin: '24px 16px 0', overflow: 'auto', height: 'calc(100vh - 24px)' }}>
          <div className="main-content">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;