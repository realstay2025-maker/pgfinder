// client/src/components/Admin/AdminLayout.jsx
// UPDATED: Unified Blue Professional Theme
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    ShieldCheckIcon, 
    BuildingStorefrontIcon, 
    UsersIcon, 
    HomeIcon,
    CogIcon,
    CreditCardIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import DashboardNavigation from '../DashboardNavigation';
import { THEME } from '../../config/theme';

const AdminLayout = () => {
    const { logout } = useAuth();
    
    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: HomeIcon },
        { name: 'Property Approvals', path: '/admin/properties', icon: BuildingStorefrontIcon },
        { name: 'User Management', path: '/admin/users', icon: UsersIcon },
        { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCardIcon },
        { name: 'Analytics', path: '/admin/analytics', icon: ChartBarIcon },
        { name: 'System Settings', path: '/admin/settings', icon: CogIcon },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Navigation Component - Handles sidebar, topbar, and layout */}
            <DashboardNavigation 
                roleDisplayName="Admin Panel"
                logoIcon={ShieldCheckIcon}
                navItems={navItems}
                onLogout={logout}
                changePasswordPath="/admin/change-password"
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden pt-16 md:pl-72">
                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;