// client/src/components/TenantProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import { ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * @component TenantProtectedRoute
 * @description Secures tenant-specific routes. It verifies that the user is 
 * logged in and explicitly has the role 'tenant'. It crucialy waits for 
 * the AuthContext 'loading' state to be false before checking the role.
 */
const TenantProtectedRoute = () => {
    // We rely on 'loading' to know when the 'user' object is fully populated from storage.
    const { user, loading } = useAuth(); 
    
    // 1. Show loading state while checking authentication status
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="flex items-center text-xl text-primary-dark">
                    <ArrowPathIcon className="w-6 h-6 mr-3 animate-spin" />
                    Checking Tenant Access...
                </div>
            </div>
        );
    }

    // 2. Check if the user object exists AND has the 'tenant' role
    if (user && user.role === 'tenant') {
        // If authorized, render the nested component
        return <Outlet />;
    } 
    
    // 3. If unauthorized (role mismatch or not logged in), redirect to login
    else {
        // This warning appears if the user is logged in as Admin or Owner, or not logged in at all.
        console.warn('Access attempt denied: User is not authorized for the Tenant Portal.');
        return <Navigate to="/login" replace />; 
    }
};

export default TenantProtectedRoute;