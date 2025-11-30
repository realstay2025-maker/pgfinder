import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom'; // <<< ADDED Outlet
import { useAuth } from '../../context/AuthContext';
import { 
    BuildingStorefrontIcon, 
    PlusCircleIcon, 
    UsersIcon, 
    WalletIcon, 
    UserCircleIcon, 
    ArrowLeftEndOnRectangleIcon, 
    HomeIcon, 
    Bars3Icon, 
    XMarkIcon,
    TicketIcon,
    CreditCardIcon,
    SpeakerWaveIcon,
    WrenchScrewdriverIcon,
    DocumentTextIcon,
    InboxIcon
} from '@heroicons/react/24/outline';

const OwnerLayout = () => { // <<< REMOVED { children } prop
    const { logout, user } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Check if the current path starts with the link path (for highlighting nested routes)
    const isActive = (path) => {
        if (path === '/owner') {
            // Special handling for the dashboard index route
            return location.pathname === '/owner';
        }
        return location.pathname.startsWith(path);
    }
    
    const navItems = [
        { name: 'Dashboard Home', path: '/owner', icon: HomeIcon },
        { name: 'Inbox', path: '/owner/inbox', icon: InboxIcon },
        { name: 'My Properties', path: '/owner/properties', icon: BuildingStorefrontIcon },
        { name: 'Tenants & Rooms', path: '/owner/tenants', icon: UsersIcon },
        { name: 'Complaints', path: '/owner/complaints', icon: TicketIcon },
        { name: 'Payments & Dues', path: '/owner/payments', icon: CreditCardIcon },
        { name: 'Notices', path: '/owner/notices', icon: SpeakerWaveIcon },
        { name: 'Maintenance', path: '/owner/maintenance', icon: WrenchScrewdriverIcon },
        { name: 'Invoices', path: '/owner/invoices', icon: DocumentTextIcon },
        { name: 'Owner Profile', path: '/owner/profile', icon: UserCircleIcon },
    ];
    
    const getLinkClass = (path) => 
        `flex items-center p-3 rounded-lg transition duration-150 text-white 
         ${isActive(path)
            ? 'bg-blue-600 shadow-inner' // Active style
            : 'hover:bg-blue-700/50' // Hover style
        }`;

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                // ... (Mobile overlay unchanged)
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 text-white">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <XMarkIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="px-4">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                                        <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">PG Owner</h2>
                                        <p className="text-xs text-blue-200">Portal</p>
                                    </div>
                                </div>
                                <nav className="space-y-2">
                                    {navItems.map(item => {
                                        const Icon = item.icon;
                                        return (
                                            <Link 
                                                key={item.name} 
                                                to={item.path} 
                                                className={getLinkClass(item.path)}
                                                onClick={() => setSidebarOpen(false)}
                                            >
                                                <Icon className="w-6 h-6 mr-3" />
                                                <span className="text-sm">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col border-t border-blue-700 p-4">
                            <div className="text-xs mb-2 text-gray-300">Logged in as: <strong>{user?.name}</strong></div>
                            <button 
                                onClick={logout} 
                                className="w-full flex items-center justify-center py-2 px-4 rounded-md bg-custom-red hover:bg-red-700 transition text-white"
                            >
                                <ArrowLeftEndOnRectangleIcon className="w-4 h-4 mr-2" /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Desktop Sidebar */}
            <div className="w-16 lg:w-72 bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 text-white flex flex-col hidden md:flex flex-shrink-0 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
                </div>
                
                {/* Header */}
                <div className="relative z-10 p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                                PG Owner
                            </h2>
                            <p className="text-xs text-blue-200">Management Portal</p>
                        </div>
                    </div>
                </div>
                
                {/* Navigation */}
                <nav className="flex-grow px-2 lg:px-4 relative z-10 overflow-y-auto">
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
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg transform scale-105' 
                                            : 'hover:bg-white/10 hover:translate-x-1'
                                    }`}
                                >
                                    {active && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-xl"></div>
                                    )}
                                    <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                                        active 
                                            ? 'bg-white/20 shadow-md' 
                                            : 'bg-white/10 group-hover:bg-white/20'
                                    }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={`font-medium text-sm relative z-10 hidden lg:block ${
                                        active ? 'text-white' : 'text-blue-100 group-hover:text-white'
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
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-blue-200">Property Owner</p>
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
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-dark"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">Owner Portal</h1>
                        <div className="w-8" /> {/* Spacer */}
                    </div>
                </div>
                
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {/* <<< CRITICAL FIX: The nested route component renders here */}
                    <Outlet /> 
                </main>
            </div>
        </div>
    );
};

export default OwnerLayout;