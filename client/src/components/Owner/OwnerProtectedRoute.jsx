// client/src/components/Owner/OwnerProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowPathIcon } from '@heroicons/react/24/outline'; 

/**
 * @component OwnerProtectedRoute
 * @description Protects routes intended only for PG Owners. 
 * Checks for authentication status and required role ('pg_owner').
 */
const OwnerProtectedRoute = () => {
    const { user, loading } = useAuth();
    
    // 1. Handle Loading State
    // Crucial to prevent premature rendering or redirection before user status is known
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <ArrowPathIcon className="w-8 h-8 mr-2 animate-spin text-primary-dark" />
                <p className="text-lg text-gray-700">Checking authorization...</p>
            </div>
        );
    }

    // 2. Check Authentication and Role
    // If the user is logged in AND their role is 'pg_owner', render the nested route content (Outlet)
    if (user && user.role === 'pg_owner') {
        return <Outlet />;
    }

    // 3. Handle Unauthorized Access
    // If the user is not logged in or their role is incorrect, redirect them to the login page.
    // The 'replace' prop ensures the unauthorized route is not kept in the history stack.
    return <Navigate to="/login" replace />;
};

export default OwnerProtectedRoute;