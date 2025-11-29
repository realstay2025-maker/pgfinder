import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
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

// API URL for dashboard metrics
// NOTE: Ensure your backend has a GET route defined at this path: /api/owner/dashboard/metrics
const API_OWNER_DASHBOARD = 'http://localhost:5000/api/owner/dashboard-metrics';

// --- Reusable Metric Card Component ---
const MetricCard = ({ title, value, icon: Icon, colorClass, link, isLoading }) => (
    <div className={`bg-white rounded-xl shadow-lg p-5 flex flex-col justify-between transition-all duration-300 transform hover:scale-[1.02] ${colorClass}`}>
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
            <div className={`p-3 rounded-full bg-opacity-20 ${colorClass.replace('border-', 'bg-').replace('text-gray-900', '')}`}>
                <Icon className={`w-8 h-8 ${colorClass.replace('border-', 'text-').replace('text-gray-900', 'text-blue-800')}`} />
            </div>
        </div>
        {link && (
            <Link to={link} className="mt-4 text-xs font-semibold flex items-center text-blue-600 hover:text-blue-800 transition">
                View Details <ArrowTrendingUpIcon className='w-4 h-4 ml-1' />
            </Link>
        )}
    </div>
);


const OwnerDashboardHome = () => {
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
                axios.get('http://localhost:5000/api/owner/contact-requests', config),
                axios.get('http://localhost:5000/api/owner/booking-requests', config)
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
            <div className="p-6 text-custom-red border-l-4 border-custom-red bg-red-100/50 rounded-md shadow-lg">
                <p className="font-semibold">Error Loading Dashboard:</p>
                <p>{error}</p>
                <button onClick={fetchDashboardMetrics} className="mt-3 text-sm text-blue-800 hover:underline">Try Refreshing</button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                Welcome back, <span className="text-blue-700">{user?.name || 'PG Owner'}!</span>
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
                    colorClass="text-blue-800 border-blue-100"
                    link="/owner/properties"
                    isLoading={loading}
                />
                <MetricCard 
                    title="Active Tenants"
                    value={metrics.activeTenants || 0}
                    icon={UsersIcon}
                    colorClass="text-green-700 border-green-100"
                    link="/owner/tenants"
                    isLoading={loading}
                />
                <MetricCard 
                    title="Pending Complaints"
                    value={metrics.pendingComplaints || 0}
                    icon={TicketIcon}
                    colorClass="text-yellow-700 border-yellow-100"
                    link="/owner/complaints"
                    isLoading={loading}
                />
                <MetricCard 
                    title="Monthly Dues (Total)"
                    value={metrics.totalMonthlyDues || '₹ 0'} 
                    icon={WalletIcon}
                    colorClass="text-indigo-700 border-indigo-100"
                    link="/owner/payments"
                    isLoading={loading}
                />
            </div>

            {/* --- Quick Actions / CTA Section --- */}
            <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-blue-700">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <Link
                        to="/owner/add-property"
                        className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition duration-200 text-blue-700 font-medium shadow-sm"
                    >
                        <PlusCircleIcon className="w-6 h-6 mr-2" />
                        Add New Property
                    </Link>

                    <Link
                        to="/owner/tenants"
                        className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition duration-200 text-green-700 font-medium shadow-sm"
                    >
                        <UsersIcon className="w-6 h-6 mr-2" />
                        Manage Tenants
                    </Link>

                    <Link
                        to="/owner/inbox"
                        className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition duration-200 text-purple-700 font-medium shadow-sm relative"
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
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-gray-500 italic">
                    <p>No recent activity updates to display. (Requires real-time backend feed.)</p>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboardHome;