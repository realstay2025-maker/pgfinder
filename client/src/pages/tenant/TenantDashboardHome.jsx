// client/src/pages/tenant/TenantDashboardHome.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../config/theme';
import { 
    CurrencyRupeeIcon, 
    HomeModernIcon, 
    ExclamationCircleIcon, 
    CalendarDaysIcon,
    ArrowPathIcon,
    UserIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';


import { API_ENDPOINTS } from '../../config/api';
const formatCurrency = (amount) => `₹${new Intl.NumberFormat('en-IN').format(amount)}`;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

const TenantDashboardHome = () => {
    usePageTitle('Tenant Dashboard');
    const { user } = useAuth();
    const [data, setData] = useState({ payments: null, lease: null, complaints: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notAssigned, setNotAssigned] = useState(false);
    const fetchData = async () => {
        setLoading(true);
        setNotAssigned(false);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            // Fetch real payment data
            const paymentRes = await axios.get(`${API_ENDPOINTS.PAYMENTS}/tenant/my-payments`, config);
            
            // Fetch tenant profile
            let leaseRes;
            try {
                leaseRes = await axios.get(`${API_ENDPOINTS.TENANT}/profile`, config);
            } catch (profileErr) {
                if (profileErr.response?.status === 404 || profileErr.response?.data?.error?.includes('not found')) {
                    setNotAssigned(true);
                    leaseRes = { data: { propertyName: 'Not Assigned Yet', roomNumber: 'N/A' } };
                } else {
                    throw profileErr;
                }
            }
            
            // Fetch complaints count
            const complaintsRes = await axios.get(`${API_ENDPOINTS.COMPLAINTS}/tenant/my-complaints`, config);
            
            setData({ 
                payments: paymentRes.data, 
                lease: leaseRes.data,
                complaints: complaintsRes.data
            });

        } catch (err) {
            console.error("Dashboard Fetch Error:", err.response?.data?.error || err.message);
            setError(err.response?.data?.error || 'Failed to load dashboard');
            console.error("Dashboard Fetch Error:", err.response?.data?.error || err.message);
            // Set fallback data even on error
            setData({ 
                payments: { summary: { totalDues: 0, nextDueDate: null, nextDueAmount: 0 } }, 
                lease: { propertyName: 'Not Available', roomNumber: 'N/A' },
                complaints: []
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    if (loading) {
        return <div className="p-10 text-xl text-center">Loading your personalized dashboard...</div>;
    }





    const { payments, lease, complaints } = data;
    const paymentSummary = payments?.summary || {};
    const hasDues = paymentSummary.totalDues > 0;
    
    // Get real complaints count
    const openComplaintsCount = complaints?.filter(c => c.status === 'pending' || c.status === 'in_progress')?.length || 0; 

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">👋 Welcome back, {user?.name || 'Tenant'}!</h1>
                <button 
                    onClick={fetchData}
                    className="flex items-center py-2 px-4 rounded-lg font-medium transition text-sm shadow-sm border-2 hover:shadow-md"
                    style={{backgroundColor: `${THEME.primary.base}15`, borderColor: THEME.primary.base, color: THEME.primary.base}}
                >
                    <ArrowPathIcon className="w-4 h-4 mr-2" /> Refresh
                </button>
            </div>

            {notAssigned && (
                <div className="p-4 mb-8 rounded-lg shadow-sm border-l-4 bg-blue-50" style={{borderColor: '#3b82f6'}}>
                    <div className="flex items-start">
                        <InformationCircleIcon className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-blue-900 mb-1">Welcome to PG Finder!</p>
                            <p className="text-blue-800 text-sm mb-2">
                                Your profile is not yet linked to any PG. You'll have full access to your dashboard once a PG owner assigns you to a room.
                            </p>
                            <p className="text-blue-800 text-sm">
                                In the meantime, you can explore available properties and connect with PG owners.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {error && !notAssigned && (
                <div className="p-4 mb-8 rounded-lg shadow-sm border-l-4 bg-red-50" style={{borderColor: '#ef4444'}}>
                    <div className="flex items-start">
                        <ExclamationCircleIcon className="w-5 h-5 mr-3 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-red-900 mb-1">Error Loading Dashboard</p>
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* ALERT BOX for Dues */}
            {hasDues && (
                <div className="p-4 mb-8 rounded-lg shadow-sm border-l-4" style={{backgroundColor: '#ef444415', borderColor: '#ef4444'}}>
                    <p className="font-semibold flex items-center" style={{color: '#ef4444'}}>
                        <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                        Action Required: You have **{formatCurrency(paymentSummary.totalDues)}** in outstanding dues.
                        <Link to="/tenant/payments" className="ml-4 underline hover:opacity-80" style={{color: THEME.primary.base}}>View Payments</Link>
                    </p>
                </div>
            )}

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Lease Info Card */}
                <div className="p-6 rounded-2xl shadow-lg bg-white hover:shadow-xl transition-shadow" style={{borderLeft: `4px solid ${THEME.primary.base}`}}>
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                        <HomeModernIcon className="w-5 h-5 mr-2" style={{color: THEME.primary.base}} /> Current Residence
                    </p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900 truncate">
                        {lease?.propertyName || 'Lease Pending'}
                    </h3>
                    <p className="text-md text-gray-500">Room: **{lease?.roomNumber || 'N/A'}**</p>
                    <Link to="/tenant/documents" className="mt-3 inline-block text-sm font-semibold transition hover:opacity-80" style={{color: THEME.primary.base}}>
                        View Lease Documents
                    </Link>
                </div>

                {/* Next Payment Card */}
                <div className="p-6 rounded-2xl shadow-lg bg-white hover:shadow-xl transition-shadow" style={{borderLeft: `4px solid ${THEME.secondary.base}`}}>
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                        <CalendarDaysIcon className="w-5 h-5 mr-2" style={{color: THEME.secondary.base}} /> Next Payment Due
                    </p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">
                        {paymentSummary.nextDueDate ? formatDate(paymentSummary.nextDueDate) : 'N/A'}
                    </h3>
                    <p className="text-md text-gray-500">Amount: **{formatCurrency(paymentSummary.nextDueAmount)}**</p>
                    <Link to="/tenant/payments" className="mt-3 inline-block text-sm font-semibold transition hover:opacity-80" style={{color: THEME.secondary.base}}>
                        Make a Payment
                    </Link>
                </div>

                {/* Open Complaints Card */}
                <div className="p-6 rounded-2xl shadow-lg bg-white hover:shadow-xl transition-shadow" style={{borderLeft: `4px solid #06b6d4`}}>
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                        <ExclamationCircleIcon className="w-5 h-5 mr-2" style={{color: '#06b6d4'}} /> Open Issues
                    </p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">
                        {openComplaintsCount}
                    </h3>
                    <p className="text-md text-gray-500">Awaiting Manager Action</p>
                    <Link to="/tenant/submit-complaint" className="mt-3 inline-block text-sm font-semibold transition hover:opacity-80" style={{color: '#06b6d4'}}>
                        Raise a New Issue
                    </Link>
                </div>

            </div>
            {/* Future sections like Notices/Announcements go here */}
        </div>
    );
};

export default TenantDashboardHome;