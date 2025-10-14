import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { Link } from 'react-router-dom';
import {
  FileSearchOutlined,
  BarChartOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  CopyOutlined,
  BgColorsOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const MenuItem = ({ icon, title, path, description }) => (
  <Col xs={24} sm={12} md={8} lg={6} style={{ padding: '12px' }}>
    <Link to={path}>
      <Card 
        hoverable
        style={{ height: '100%' }}
        cover={
          <div style={{ 
            fontSize: '48px', 
            textAlign: 'center', 
            padding: '24px',
            color: '#1890ff',
            backgroundColor: '#f0f5ff'
          }}>
            {icon}
          </div>
        }
      >
        <Card.Meta
          title={<span style={{ fontSize: '18px', color: '#1890ff' }}>{title}</span>}
          description={description}
        />
      </Card>
    </Link>
  </Col>
);

const Home = () => {
  const menuItems = [
    {
      icon: <FileSearchOutlined />,
      title: 'Review Tasks',
      path: '/review_tasks',
      description: 'Xem và quản lý các task cần review'
    },
    {
      icon: <BarChartOutlined />,
      title: 'Impedance',
      path: '/impedance',
      description: 'Kiểm tra và phân tích impedance'
    },
    {
      icon: <FileSearchOutlined />,
      title: 'Material Core',
      path: '/material-core',
      description: 'Quản lý vật liệu core'
    },
    {
      icon: <FileSearchOutlined />,
      title: 'Material Prepreg',
      path: '/material-properties',
      description: 'Quản lý vật liệu prepreg'
    },
    {
      icon: <FileSearchOutlined />,
      title: 'Material New',
      path: '/material-new',
      description: 'Thêm vật liệu mới'
    },
    {
      icon: <BgColorsOutlined />,
      title: 'Material Ink',
      path: '/material-ink',
      description: 'Quản lý vật liệu mực'
    },
    {
      icon: <TeamOutlined />,
      title: 'User Management',
      path: '/user-management',
      description: 'Quản lý người dùng'
    },
    {
      icon: <CheckCircleOutlined />,
      title: 'Large Size Board',
      path: '/decide-use',
      description: 'Quản lý bảng kích thước lớn'
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: 'Material Certification',
      path: '/material-certification',
      description: 'Quản lý chứng nhận vật liệu'
    },
    {
      icon: <CopyOutlined />,
      title: 'Defect Details',
      path: 'http://192.84.105.173:3000/services/defect-details',
      description: 'Báo cáo tỷ lệ lỗi DR'
    }
  ];

  const storedUser = localStorage.getItem("userInfo");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Title level={2}>Welcome, {user?.username || 'User'}!</Title>
        <Title level={4} style={{ color: '#8c8c8c' }}>Chọn 1 trang bạn muốn truy cập</Title>
      </div>
      
      <Row gutter={[16, 16]} justify="center">
        {menuItems.map((item, index) => (
          <MenuItem key={index} {...item} />
        ))}
      </Row>
    </div>
  );
};

export default Home;
