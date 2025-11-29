// client/src/components/Admin/AdminProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminProtectedRoute = ({ allowedRoles = ['admin', 'super_admin'] }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    
    if (user && allowedRoles.includes(user.role)) {
        return <Outlet />;
    }
    
    return <Navigate to="/login" replace />;
};

export default AdminProtectedRoute;