// client/src/components/TenantLayout.jsx
import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Chatbot from '../Chatbot';
import { 
    UserIcon, 
    HomeIcon, 
    CurrencyRupeeIcon, 
    ExclamationCircleIcon, 
    DocumentTextIcon,
    ArrowLeftEndOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const TenantLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const isActive = (path) => {
        if (path === '/tenant') {
            return location.pathname === '/tenant';
        }
        return location.pathname.startsWith(path);
    }
    
    const navItems = [
        { name: 'Dashboard', path: '/tenant', icon: HomeIcon },
        { name: 'Profile', path: '/tenant/profile', icon: UserIcon },
        { name: 'Rent & Payments', path: '/tenant/payments', icon: CurrencyRupeeIcon },
        { name: 'Raise an Issue', path: '/tenant/submit-complaint', icon: ExclamationCircleIcon },
        { name: 'Lease & Documents', path: '/tenant/documents', icon: DocumentTextIcon },
        { name: 'Give Notice', path: '/tenant/give-notice', icon: ExclamationTriangleIcon },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-emerald-900 via-teal-900 to-cyan-900 text-white">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <XMarkIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="px-4">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Tenant</h2>
                                        <p className="text-xs text-emerald-200">Portal</p>
                                    </div>
                                </div>
                                <nav className="space-y-1">
                                    {navItems.map(item => {
                                        const Icon = item.icon;
                                        const active = isActive(item.path);
                                        return (
                                            <Link 
                                                key={item.name} 
                                                to={item.path} 
                                                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                                                    active 
                                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg' 
                                                        : 'hover:bg-white/10'
                                                }`}
                                                onClick={() => setSidebarOpen(false)}
                                            >
                                                <div className={`p-1 rounded mr-3 ${
                                                    active ? 'bg-white/20' : 'bg-white/10'
                                                }`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>
                        <div className="flex-shrink-0 p-4 border-t border-white/10">
                            <div className="bg-white/10 rounded-lg p-3 mb-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                        {user?.name?.charAt(0) || 'T'}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-white">{user?.name || 'Tenant'}</p>
                                        <p className="text-xs text-emerald-200">Resident</p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={logout} 
                                className="w-full flex items-center justify-center py-2 px-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg"
                            >
                                <ArrowLeftEndOnRectangleIcon className="w-4 h-4 mr-2" /> 
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Desktop Sidebar */}
            <div className="w-72 bg-gradient-to-b from-emerald-900 via-teal-900 to-cyan-900 text-white flex flex-col hidden md:flex flex-shrink-0 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
                </div>
                
                {/* Header */}
                <div className="relative z-10 p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                            <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                                Tenant Portal
                            </h2>
                            <p className="text-xs text-emerald-200">Resident Dashboard</p>
                        </div>
                    </div>
                </div>
                
                {/* Navigation */}
                <nav className="flex-grow px-4 relative z-10">
                    <div className="space-y-1">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link 
                                    key={item.name} 
                                    to={item.path} 
                                    className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                                        active 
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg transform scale-105' 
                                            : 'hover:bg-white/10 hover:translate-x-1'
                                    }`}
                                >
                                    {active && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 rounded-xl"></div>
                                    )}
                                    <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                                        active 
                                            ? 'bg-white/20 shadow-md' 
                                            : 'bg-white/10 group-hover:bg-white/20'
                                    }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={`font-medium text-sm relative z-10 ${
                                        active ? 'text-white' : 'text-emerald-100 group-hover:text-white'
                                    }`}>
                                        {item.name}
                                    </span>
                                    {active && (
                                        <div className="ml-auto w-2 h-2 bg-white rounded-full shadow-lg"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
                
                {/* User Profile & Logout */}
                <div className="relative z-10 p-4 border-t border-white/10">
                    {/* User Info Card */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {user?.name?.charAt(0) || 'T'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'Tenant'}</p>
                                <p className="text-xs text-emerald-200">Resident</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Logout Button */}
                    <button 
                        onClick={logout} 
                        className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 group"
                    >
                        <ArrowLeftEndOnRectangleIcon className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" /> 
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header */}
                <div className="md:hidden bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">Tenant Portal</h1>
                        <div className="w-8" />
                    </div>
                </div>
                
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
            <Chatbot />
        </div>
    );
};

export default TenantLayout;