import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', values);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.user.username); 
            message.success('Đăng nhập thành công!');
            navigate('/review_tasks');
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi đăng nhập');
        }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Card title="Đăng nhập" style={{ width: 400 }}>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item label="ID Công ty" name="company_id" rules={[{ required: true, message: 'Vui lòng nhập ID công ty!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;