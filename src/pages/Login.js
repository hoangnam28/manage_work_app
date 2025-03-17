import React, { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { Toaster, toast } from 'sonner';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true); // Bật loading khi bắt đầu đăng nhập
    try {
      const loginData = {
        company_id: values.company_id.trim(),
        password_hash: values.password_hash.trim()
      };

      console.log('Sending login data:', loginData);

      const response = await axios.post('http://localhost:5000/api/auth/login', loginData);

      if (response.data.accessToken) {
        // Lưu token
        localStorage.setItem('accessToken', response.data.accessToken);
        // Lưu thông tin user nếu cần
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));

        toast.success('Đăng nhập thành công');

        // Đợi một chút để toast hiển thị
        setTimeout(() => {
          // Chuyển hướng sau khi đăng nhập thành công
          navigate('/review_tasks', { replace: true });
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi đăng nhập';
      toast.error(errorMessage);
    } finally {
      setLoading(false); // Tắt loading khi hoàn thành
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Toaster position="top-right" richColors />
      <Card title="Đăng nhập" style={{ width: 400 }}>
        <Form
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
        >
          <Form.Item
            label="ID Công ty"
            name="company_id"
            rules={[{ required: true, message: 'Vui lòng nhập ID công ty!' }]}
          >
            <Input placeholder="Nhập ID công ty" />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password_hash"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;