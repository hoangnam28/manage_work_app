
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { Toaster, toast } from 'sonner';
import axiosInstance from '../utils/axiosConfig';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const navigate = useNavigate(); 

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const loginData = {
        company_id: values.company_id.trim(),
        password_hash: values.password_hash.trim()
      };

      const response = await axiosInstance.post('/auth/login', loginData);

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));

        toast.success('Đăng nhập thành công');
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi đăng nhập';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (values) => {
    setLoading(true);
    try {
      await axiosInstance.post('/auth/forgot-password', {
        company_id: values.company_id?.trim(),
        email: values.email?.trim()
      });
      toast.success('Nếu ID hợp lệ, mật khẩu tạm thời đã được gửi email');
      setMode('login');
    } catch (error) {
      const msg = error.response?.data?.message || 'Không thể thực hiện quên mật khẩu';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container"
    style={{ backgroundImage: `url("/bgr.jpg")` }}> 
      <Toaster position="top-right" richColors />
      <Card className="login-card">
        <div className={`card-switch ${mode}`}>
          <div className="login-form">
              <Typography.Title level={4} style={{ textAlign: 'center' }}>Đăng nhập</Typography.Title>
              <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
                <Form.Item label="ID Công ty" name="company_id" rules={[{ required: true, message: 'Vui lòng nhập ID công ty!' }]}>
                  <Input placeholder="Nhập ID công ty" />
                </Form.Item>
                <Form.Item label="Mật khẩu" name="password_hash" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                  <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                </Form.Item>
              </Form>
              <div style={{ textAlign: 'center' }}>
                <Button type="link" onClick={() => setMode('forgot')}>Quên mật khẩu?</Button>
              </div>
          </div>
          <div className="forgot-form">
              <Typography.Title level={4} style={{ textAlign: 'center' }}>Quên mật khẩu</Typography.Title>
              <Form layout="vertical" onFinish={handleForgot} autoComplete="off">
                <Form.Item label="ID Công ty" name="company_id" rules={[{ required: true, message: 'Vui lòng nhập ID công ty!' }]}>
                  <Input placeholder="Nhập ID công ty" />
                </Form.Item>
                <Form.Item label="Email nhận mật khẩu (tùy chọn)" name="email">
                  <Input placeholder="user.123@meiko-elec.com" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                  </Button>
                </Form.Item>
              </Form>
              <div style={{ textAlign: 'center' }}>
                <Button type="link" onClick={() => setMode('login')}>Quay lại đăng nhập</Button>
              </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;