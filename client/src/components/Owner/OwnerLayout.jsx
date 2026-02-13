// client/src/components/Owner/OwnerLayout.jsx
// UPDATED: Unified Blue Professional Theme
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Chatbot from '../Chatbot';
import { 
    BuildingStorefrontIcon, 
    HomeIcon,
    InboxIcon,
    UsersIcon,
    TicketIcon,
    CreditCardIcon,
    SpeakerWaveIcon,
    ChartBarIcon,
    CpuChipIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import DashboardNavigation from '../DashboardNavigation';
import { THEME } from '../../config/theme';

const OwnerLayout = () => {
    const { logout } = useAuth();
    
    const navItems = [
        { name: 'Dashboard Home', path: '/owner', icon: HomeIcon },
        { name: 'Inbox', path: '/owner/inbox', icon: InboxIcon },
        { name: 'My Properties', path: '/owner/properties', icon: BuildingStorefrontIcon },
        { name: 'Tenants & Rooms', path: '/owner/tenants', icon: UsersIcon },
        { name: 'Complaints', path: '/owner/complaints', icon: TicketIcon },
        { name: 'Payments & Dues', path: '/owner/payments', icon: CreditCardIcon },
        { name: 'Notices', path: '/owner/notices', icon: SpeakerWaveIcon },
        { name: 'Analytics', path: '/owner/analytics', icon: ChartBarIcon },
        { name: 'AI & Automation', path: '/owner/ai', icon: CpuChipIcon },
        { name: 'Owner Profile', path: '/owner/profile', icon: UserCircleIcon },
    ];


    return (
        <div className="flex h-screen bg-gray-100">
            {/* Navigation Component - Handles sidebar, topbar, and layout */}
            <DashboardNavigation 
                roleDisplayName="PG Owner Portal"
                logoIcon={BuildingStorefrontIcon}
                navItems={navItems}
                onLogout={logout}
                changePasswordPath="/owner/change-password"
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
            
            {/* <Chatbot /> */}
        </div>
    );
};

export default OwnerLayout;