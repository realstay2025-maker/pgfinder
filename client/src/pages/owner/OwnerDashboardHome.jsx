import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { THEME } from '../../config/theme';
import { 
    BuildingStorefrontIcon, 
    UsersIcon, 
    TicketIcon, 
    WalletIcon, 
    ArrowPathIcon,
    ArrowTrendingUpIcon,
    PlusCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import usePageTitle from '../../hooks/usePageTitle';

// API URL for dashboard metrics
// NOTE: Ensure your backend has a GET route defined at this path: /api/owner/dashboard/metrics
import { API_ENDPOINTS } from '../../config/api';

const API_OWNER_DASHBOARD = `${API_ENDPOINTS.OWNER}/dashboard-metrics`;

// --- Reusable Metric Card Component ---
const MetricCard = ({ title, value, icon: Icon, bgColor, iconColor, link, isLoading }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1" style={{borderLeft: `4px solid ${iconColor}`}}>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className="mt-1 text-3xl font-bold text-gray-900">
                    {isLoading ? (
                        <ArrowPathIcon className="w-6 h-6 animate-spin text-gray-400" />
                    ) : (
                        value
                    )}
                </div>
            </div>
            <div className="p-3 rounded-full" style={{backgroundColor: `${iconColor}20`}}>
                <Icon className="w-8 h-8" style={{color: iconColor}} />
            </div>
        </div>
        {link && (
            <Link to={link} className="mt-4 text-xs font-semibold flex items-center transition hover:opacity-80" style={{color: iconColor}}>
                View Details <ArrowTrendingUpIcon className='w-4 h-4 ml-1' />
            </Link>
        )}
    </div>
);


const OwnerDashboardHome = () => {
    usePageTitle('Owner Dashboard');
    const { user } = useAuth();
    const [metrics, setMetrics] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial state for metrics is an empty object
    // const mockMetrics = { ... }; // REMOVED MOCK DATA

    const fetchDashboardMetrics = async () => {
        // Only fetch if user is logged in and is an owner
        if (!user || user.role !== 'pg_owner') {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // --- ACTUAL BACKEND API CALL ---
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_OWNER_DASHBOARD, config);
            
            // Fetch inbox counts
            const [contactRes, bookingRes] = await Promise.all([
                axios.get(`${API_ENDPOINTS.OWNER}/contact-requests`, config),
                axios.get(`${API_ENDPOINTS.OWNER}/booking-requests`, config)
            ]);
            
            const pendingContacts = contactRes.data.filter(r => r.status === 'pending').length;
            const pendingBookings = bookingRes.data.filter(r => r.status === 'pending').length;
            
            // Transform backend response to match frontend expectations
            const transformedMetrics = {
                totalProperties: res.data.stats?.totalProperties || 0,
                activeTenants: res.data.stats?.totalOccupancy || 0,
                pendingComplaints: 0, // TODO: Add complaints count to backend
                totalMonthlyDues: `₹ ${res.data.stats?.totalDues || 0}`,
                pendingRequests: pendingContacts + pendingBookings
            };
            
            setMetrics(transformedMetrics);
            
        } catch (err) {
            console.error("Fetch Dashboard Metrics Error:", err.response?.data?.error || err.message);
            // Provide specific error message if the route is not defined on the backend
            const backendError = err.response?.status === 404 
                ? "404 Error: Dashboard metrics API route missing on backend. (GET /api/owner/dashboard-metrics)"
                : (err.response?.data?.error || "Failed to load dashboard metrics.");
            setError(backendError);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardMetrics();
    }, [user]);

    if (error) {
        return (
            <div className="p-6 border-l-4 rounded-lg shadow-lg" style={{borderColor: '#ef4444', backgroundColor: '#ef444415', color: '#991b1b'}}>
                <p className="font-semibold">Error Loading Dashboard:</p>
                <p>{error}</p>
                <button onClick={fetchDashboardMetrics} className="mt-3 text-sm hover:underline" style={{color: THEME.primary.base}}>Try Refreshing</button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                Welcome back, <span style={{color: THEME.primary.base}}>{user?.name || 'PG Owner'}!</span>
            </h1>
            <p className="text-lg text-gray-500 mb-8">
                Here's a quick overview of your PG management portal.
            </p>

            {/* --- Key Metrics Grid --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <MetricCard 
                    title="Total Properties"
                    value={metrics.totalProperties || 0}
                    icon={BuildingStorefrontIcon}
                    iconColor={THEME.primary.base}
                    link="/owner/properties"
                    isLoading={loading}
                />
                <MetricCard 
                    title="Active Tenants"
                    value={metrics.activeTenants || 0}
                    icon={UsersIcon}
                    iconColor={THEME.secondary.base}
                    link="/owner/tenants"
                    isLoading={loading}
                />
                <MetricCard 
                    title="Pending Complaints"
                    value={metrics.pendingComplaints || 0}
                    icon={TicketIcon}
                    iconColor="#06b6d4"
                    link="/owner/complaints"
                    isLoading={loading}
                />
                <MetricCard 
                    title="Monthly Dues (Total)"
                    value={metrics.totalMonthlyDues || '₹ 0'} 
                    icon={WalletIcon}
                    iconColor="#0f766e"
                    link="/owner/payments"
                    isLoading={loading}
                />
            </div>

            {/* --- Quick Actions / CTA Section --- */}
            <div className="bg-white p-6 rounded-2xl shadow-xl" style={{borderTop: `4px solid ${THEME.primary.base}`}}>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <Link
                        to="/owner/add-property"
                        className="flex items-center justify-center p-4 rounded-lg transition duration-200 font-medium shadow-sm border-2 hover:shadow-lg hover:-translate-y-1"
                        style={{backgroundColor: `${THEME.primary.base}15`, borderColor: THEME.primary.base, color: THEME.primary.base}}
                    >
                        <PlusCircleIcon className="w-6 h-6 mr-2" />
                        Add New Property
                    </Link>

                    <Link
                        to="/owner/tenants"
                        className="flex items-center justify-center p-4 rounded-lg transition duration-200 font-medium shadow-sm border-2 hover:shadow-lg hover:-translate-y-1"
                        style={{backgroundColor: `${THEME.secondary.base}15`, borderColor: THEME.secondary.base, color: THEME.secondary.base}}
                    >
                        <UsersIcon className="w-6 h-6 mr-2" />
                        Manage Tenants
                    </Link>

                    <Link
                        to="/owner/inbox"
                        className="flex items-center justify-center p-4 rounded-lg transition duration-200 font-medium shadow-sm border-2 hover:shadow-lg hover:-translate-y-1 relative"
                        style={{backgroundColor: `${'#06b6d4'}15`, borderColor: '#06b6d4', color: '#06b6d4'}}
                    >
                        <TicketIcon className="w-6 h-6 mr-2" />
                        Inbox
                        {metrics.pendingRequests > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                                {metrics.pendingRequests}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Optional: Placeholder for Recent Activity Feed */}
            <div className="mt-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4\">Recent Activity</h2>
                <div className="p-6 rounded-2xl border border-gray-200 text-gray-500 italic" style={{backgroundColor: '#f8fafc'}}>
                    <p>No recent activity updates to display. (Requires real-time backend feed.)</p>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboardHome;