// client/src/pages/admin/AdminDashboardHome.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, UsersIcon, BuildingStorefrontIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import usePageTitle from '../../hooks/usePageTitle';

const AdminDashboardHome = () => {
    usePageTitle('Admin Dashboard');
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            if (!user?.token) {
                console.error('No authentication token available');
                return;
            }
            
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_ENDPOINTS.ADMIN}/stats`, config);
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            setStats({
                totalUsers: 0,
                totalProperties: 0,
                pendingProperties: 0,
                totalTenants: 0,
                usersByRole: []
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                                <div className="h-16 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <ChartBarIcon className="w-8 h-8 mr-2 text-indigo-600" />
                    Admin Dashboard
                </h1>
                <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-indigo-100">
                            <UsersIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-violet-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-violet-100">
                            <BuildingStorefrontIcon className="w-6 h-6 text-violet-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Properties</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.totalProperties || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-cyan-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-cyan-100">
                            <ClockIcon className="w-6 h-6 text-cyan-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.pendingProperties || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-rose-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-rose-100">
                            <CheckCircleIcon className="w-6 h-6 text-rose-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Tenants</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.totalTenants || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
                    <div className="space-y-3">
                        {stats?.usersByRole?.map((roleData) => {
                            const roleColors = {
                                admin: 'bg-indigo-100 text-indigo-800',
                                super_admin: 'bg-violet-100 text-violet-800',
                                pg_owner: 'bg-cyan-100 text-cyan-800',
                                tenant: 'bg-rose-100 text-rose-800'
                            };
                            return (
                                <div key={roleData._id} className="flex justify-between items-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[roleData._id] || 'bg-gray-100 text-gray-800'}`}>
                                        {roleData._id.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <span className="font-semibold text-gray-900">{roleData.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link to="/admin/properties" className="block p-3 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200">
                            <div className="flex items-center">
                                <BuildingStorefrontIcon className="w-5 h-5 text-indigo-600 mr-3" />
                                <span className="font-medium">Review Property Approvals</span>
                            </div>
                        </Link>
                        <Link to="/admin/users" className="block p-3 rounded-lg border border-gray-200 hover:bg-violet-50 hover:border-violet-300 transition-all duration-200">
                            <div className="flex items-center">
                                <UsersIcon className="w-5 h-5 text-violet-600 mr-3" />
                                <span className="font-medium">Manage Users</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardHome;