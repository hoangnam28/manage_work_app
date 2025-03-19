import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    // Redirect to the login page if the user is not authenticated
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;