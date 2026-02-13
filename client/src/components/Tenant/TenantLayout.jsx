// client/src/components/Tenant/TenantLayout.jsx
// UPDATED: Unified Blue Professional Theme with Onboarding Gate
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Chatbot from '../Chatbot';
import { 
    UserIcon, 
    HomeIcon, 
    CurrencyRupeeIcon, 
    DocumentTextIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import DashboardNavigation from '../DashboardNavigation';
import { THEME } from '../../config/theme';
import { API_ENDPOINTS } from '../../config/api';

const TenantLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [isProfileCompleted, setIsProfileCompleted] = useState(null);
    const [checkingProfile, setCheckingProfile] = useState(true);
    const [hasPgAssignment, setHasPgAssignment] = useState(false);
    
    // Check if profile is completed
    useEffect(() => {
        checkProfileStatus();
    }, []);

    const checkProfileStatus = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_ENDPOINTS.TENANT}/profile`, config);
            
            const completed = res.data.profileCompleted;
            const pgName = res.data.pgName;
            
            setIsProfileCompleted(completed);
            setHasPgAssignment(!!pgName);
            
            console.log('Profile Status:', { completed, pgName });
        } catch (err) {
            console.error('Failed to check profile:', err);
            // If tenant not found, they need to complete profile
            setIsProfileCompleted(false);
            setHasPgAssignment(false);
        } finally {
            setCheckingProfile(false);
        }
    };
    
    const navItems = [
        { name: 'Dashboard', path: '/tenant', icon: HomeIcon },
        { name: 'Profile', path: '/tenant/profile', icon: UserIcon },
        { name: 'Rent & Payments', path: '/tenant/payments', icon: CurrencyRupeeIcon },
        { name: 'Lease & Documents', path: '/tenant/documents', icon: DocumentTextIcon },
        { name: 'Give Notice', path: '/tenant/give-notice', icon: ExclamationTriangleIcon },
    ];

    // Show loading state
    if (checkingProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    // Gate: If profile NOT completed, only show profile page
    if (!isProfileCompleted) {
        // Redirect to profile if they try to go elsewhere
        if (!location.pathname.includes('/profile')) {
            return <Navigate to="/tenant/profile" replace />;
        }

        return (
            <div className="flex h-screen bg-gray-100">
                {/* Show limited navigation */}
                <div className="hidden md:flex md:flex-col w-72 bg-gradient-to-b from-indigo-900 via-indigo-800 to-violet-900 text-white fixed left-0 top-0 h-full" style={{ paddingTop: '64px' }}>
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="font-bold">Onboarding</div>
                                <div className="text-xs text-indigo-200">Complete Setup</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 p-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20">
                                <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span className="text-sm font-medium">Complete Profile</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl opacity-50">
                                <LockClosedIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <span className="text-sm font-medium">Dashboard</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl opacity-50">
                                <LockClosedIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <span className="text-sm font-medium">Payments</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/10">
                        <button onClick={logout} className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Main Content - Only Profile Form */}
                <div className="flex-1 flex flex-col overflow-hidden pt-16 md:pl-72">
                    {/* Top Header */}
                    <div className="bg-white shadow-sm px-4 sm:px-6 lg:px-8 py-3 md:hidden flex items-center justify-between">
                        <h1 className="text-lg font-bold text-gray-900">Onboarding</h1>
                        <button onClick={logout} className="text-red-600 hover:text-red-700 font-medium text-sm">
                            Logout
                        </button>
                    </div>

                    {/* Onboarding Banner */}
                    <div className="bg-blue-50 border-b border-blue-200 px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-start gap-3">
                            <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-blue-900">Welcome to PG Finder!</h3>
                                <p className="text-sm text-blue-800 mt-1">
                                    Please complete your profile to get started. Once done, you'll be taken to room assignment where the PG owner will verify your details.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto bg-gray-50">
                        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                            <Outlet />
                        </div>
                    </main>
                </div>

                <Chatbot />
            </div>
        );
    }

    // Normal layout when profile IS completed
    return (
        <div className="flex h-screen bg-gray-100">
            <DashboardNavigation 
                roleDisplayName="Tenant Portal"
                logoIcon={UserIcon}
                navItems={navItems}
                onLogout={logout}
                changePasswordPath="/tenant/change-password"
            />

            <div className="flex-1 flex flex-col overflow-hidden pt-16 md:pl-72">
                {/* Profile Completion Banner */}
                {hasPgAssignment && (
                    <div className="bg-green-50 border-b border-green-200 px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <p className="text-sm text-green-800 font-medium">
                                ✓ Your profile is complete and verified. Pending room assignment from owner.
                            </p>
                        </div>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            <Chatbot />
        </div>
    );
};

export default TenantLayout;