// client/src/components/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, ShieldCheckIcon, UsersIcon, ArrowRightOnRectangleIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { name: 'Dashboard', path: '/admin', icon: HomeIcon },
    { name: 'Property Approvals', path: '/admin/properties', icon: ShieldCheckIcon },
    { name: 'User Management', path: '/admin/users', icon: UsersIcon },
    { name: 'System Settings', path: '/admin/settings', icon: BuildingOfficeIcon }, // Placeholder
];

const AdminSidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();
    
    return (
        <div className="w-64 bg-gray-900 text-white flex flex-col h-full fixed shadow-xl">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-accent-green">Admin Panel</h2>
            </div>
            
            <nav className="flex-grow p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <li key={item.name}>
                                <Link 
                                    to={item.path} 
                                    className={`flex items-center p-2 rounded-lg transition duration-150 ${
                                        isActive 
                                        ? 'bg-gray-700 text-white font-semibold' 
                                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-6 h-6 mr-3" />
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={logout}
                    className="w-full flex items-center p-2 rounded-lg text-red-400 hover:bg-gray-700"
                >
                    <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;