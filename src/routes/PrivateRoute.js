import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        // Redirect về trang login nếu chưa đăng nhập
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;