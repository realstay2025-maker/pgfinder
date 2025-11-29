// client/src/pages/admin/AdminUserManagement.jsx
import React, { useState, useEffect } from 'react';
import { UsersIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const AdminUserManagement = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, roleFilter]);

    const fetchUsers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get('http://localhost:5000/api/admin/users', config);
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;
        
        if (searchTerm) {
            filtered = filtered.filter(u => 
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }
        
        setFilteredUsers(filtered);
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, config);
            setUsers(users.filter(u => u._id !== userId));
        } catch (err) {
            console.error('Failed to delete user:', err);
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
            super_admin: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
            pg_owner: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
            tenant: 'bg-gradient-to-r from-green-500 to-green-600 text-white'
        };
        return colors[role] || 'bg-gray-500 text-white';
    };

    const getRoleIcon = (role) => {
        const icons = {
            admin: '👑',
            super_admin: '🔥',
            pg_owner: '🏠',
            tenant: '👤'
        };
        return icons[role] || '👤';
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="space-y-4">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className="h-16 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center">
                    <UsersIcon className="w-10 h-10 mr-3 text-purple-600" />
                    User Management
                </h1>
                <p className="text-gray-600 text-lg">Manage all users across your platform</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Users', count: users.length, color: 'purple', icon: '👥' },
                    { label: 'Admins', count: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length, color: 'red', icon: '👑' },
                    { label: 'PG Owners', count: users.filter(u => u.role === 'pg_owner').length, color: 'blue', icon: '🏠' },
                    { label: 'Tenants', count: users.filter(u => u.role === 'tenant').length, color: 'green', icon: '👤' }
                ].map((stat, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
                            </div>
                            <div className="text-3xl">{stat.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filter */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20 shadow-lg">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div className="relative">
                        <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                            <option value="pg_owner">PG Owner</option>
                            <option value="tenant">Tenant</option>
                        </select>
                    </div>
                    {(searchTerm || roleFilter !== 'all') && (
                        <button
                            onClick={() => { setSearchTerm(''); setRoleFilter('all'); }}
                            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors flex items-center"
                        >
                            <XMarkIcon className="w-5 h-5 mr-2" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((userData) => (
                    <div key={userData._id} className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                    {userData.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{userData.name}</h3>
                                    <p className="text-gray-600 text-sm">{userData.email}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getRoleBadge(userData.role)} flex items-center`}>
                                <span className="mr-1">{getRoleIcon(userData.role)}</span>
                                {userData.role.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Status:</span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Joined:</span>
                                <span className="font-medium">{new Date(userData.createdAt).toLocaleDateString()}</span>
                            </div>
                            {userData.role === 'tenant' && userData.tenantProfile && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">PG:</span>
                                    <span className="font-medium">{userData.tenantProfile.pgName || 'Not assigned'}</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => { setSelectedUser(userData); setShowModal(true); }}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
                            >
                                <EyeIcon className="w-4 h-4 mr-2" />
                                View
                            </button>
                            <button 
                                onClick={() => deleteUser(userData._id)}
                                className="bg-red-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-12">
                    <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
            )}

            {/* User Details Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl w-full max-w-2xl border border-white/20 shadow-2xl">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">User Details</h3>
                                <button 
                                    onClick={() => setShowModal(false)} 
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6 text-gray-600" />
                                </button>
                            </div>
                            
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-6">
                                    {selectedUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h4>
                                    <p className="text-gray-600 text-lg">{selectedUser.email}</p>
                                    <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${getRoleBadge(selectedUser.role)} mt-2`}>
                                        {getRoleIcon(selectedUser.role)} {selectedUser.role.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                        <span className="mr-2">📋</span> Basic Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">User ID:</span>
                                            <span className="font-medium text-gray-900">{selectedUser._id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Joined:</span>
                                            <span className="font-medium text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {selectedUser.role === 'tenant' && selectedUser.tenantProfile && (
                                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
                                        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                            <span className="mr-2">🏠</span> Tenant Profile
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">PG:</span>
                                                <span className="font-medium text-gray-900">{selectedUser.tenantProfile.pgName || 'Not selected'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Phone:</span>
                                                <span className="font-medium text-gray-900">{selectedUser.tenantProfile.phone || 'Not provided'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Assigned:</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    selectedUser.tenantProfile.isAssigned 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {selectedUser.tenantProfile.isAssigned ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end mt-8">
                                <button 
                                    onClick={() => setShowModal(false)} 
                                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;