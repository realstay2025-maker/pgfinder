// client/src/components/TenantSidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    HomeIcon, 
    CurrencyRupeeIcon, 
    ExclamationCircleIcon, 
    DocumentTextIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { name: 'Dashboard', path: '/tenant', icon: HomeIcon },
    { name: 'Rent & Payments', path: '/tenant/payments', icon: CurrencyRupeeIcon },
    { name: 'Raise an Issue', path: '/tenant/submit-complaint', icon: ExclamationCircleIcon },
    { name: 'Lease & Documents', path: '/tenant/documents', icon: DocumentTextIcon },
];

const TenantSidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    return (
        <>
            {/* Mobile menu button */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-dark"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <h1 className="text-lg font-semibold text-primary-dark">Tenant Portal</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>
            
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <XMarkIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="px-4 border-b border-gray-200 pb-4">
                                <h2 className="text-xl font-bold text-primary-dark">Tenant Portal</h2>
                            </div>
                            <nav className="mt-5 px-4">
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
                                                        ? 'bg-blue-50 text-primary-dark font-semibold' 
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                                    onClick={() => setSidebarOpen(false)}
                                                >
                                                    <Icon className="w-6 h-6 mr-3" />
                                                    {item.name}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                        </div>
                        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                            <button
                                onClick={logout}
                                className="w-full flex items-center p-2 rounded-lg text-red-500 hover:bg-red-50"
                            >
                                <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Desktop sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full fixed shadow-lg hidden md:flex">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-primary-dark">Tenant Portal</h2>
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
                                            ? 'bg-blue-50 text-primary-dark font-semibold' 
                                            : 'text-gray-600 hover:bg-gray-100'
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
                
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={logout}
                        className="w-full flex items-center p-2 rounded-lg text-red-500 hover:bg-red-50"
                    >
                        <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3" />
                        Sign Out
                    </button>
                </div>
            </div>
            
            {/* Mobile content spacer */}
            <div className="md:hidden h-16" />
        </>
    );
};

export default TenantSidebar;