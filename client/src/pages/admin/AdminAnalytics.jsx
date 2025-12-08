import { useState, useEffect } from 'react';
import { ChartBarIcon, BuildingOfficeIcon, UserGroupIcon, CurrencyRupeeIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../../config/api';
import usePageTitle from '../../hooks/usePageTitle';

const AdminAnalytics = () => {
  usePageTitle('System Analytics');
  
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly');

  useEffect(() => {
    fetchSystemAnalytics();
  }, [timeframe]);

  const fetchSystemAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/analytics?timeframe=${timeframe}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setSystemMetrics(data);
    } catch (error) {
      console.error('Failed to fetch system analytics:', error);
      // Set fallback data structure
      setSystemMetrics({
        overview: { totalProperties: 0, activeUsers: 0, totalRevenue: 0, systemHealth: 100 },
        userGrowth: [],
        revenueBreakdown: { subscriptions: 0, commission: 0, premiumFeatures: 0 },
        recentActivity: { newProperties: 0, newUsers: 0, resolvedComplaints: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Analytics
          </h1>
          <p className="text-gray-600 mt-2">Platform-wide performance metrics and insights</p>
        </div>
        
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* System Overview Cards */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-3xl font-bold text-blue-600">{systemMetrics.overview?.totalProperties?.toLocaleString() || '0'}</p>
              </div>
              <BuildingOfficeIcon className="w-12 h-12 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">Live Data</span>
              <span className="text-gray-500 ml-2">real-time</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600">{systemMetrics.overview?.activeUsers?.toLocaleString() || '0'}</p>
              </div>
              <UserGroupIcon className="w-12 h-12 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">Live Data</span>
              <span className="text-gray-500 ml-2">real-time</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
                <p className="text-3xl font-bold text-purple-600">₹{(systemMetrics.overview?.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <CurrencyRupeeIcon className="w-12 h-12 text-purple-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">Live Data</span>
              <span className="text-gray-500 ml-2">real-time</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-3xl font-bold text-green-600">{systemMetrics.overview?.systemHealth || '100'}%</p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600">Live Status</span>
              <span className="text-gray-500 ml-2">real-time</span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analytics */}
      {systemMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trends</h3>
            <div className="space-y-4">
              {systemMetrics.userGrowth?.map((userType) => {
                const total = systemMetrics.userGrowth.reduce((sum, u) => sum + u.count, 0);
                const percentage = total > 0 ? (userType.count / total) * 100 : 0;
                const roleNames = {
                  owner: 'Property Owners',
                  tenant: 'Tenants',
                  admin: 'Admins'
                };
                const colors = {
                  owner: 'bg-blue-600',
                  tenant: 'bg-green-600',
                  admin: 'bg-purple-600'
                };
                
                return (
                  <div key={userType._id} className="flex justify-between items-center">
                    <span className="text-gray-600">{roleNames[userType._id] || userType._id}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div className={`${colors[userType._id] || 'bg-gray-600'} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="text-sm font-semibold">{userType.count.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
              {(!systemMetrics.userGrowth || systemMetrics.userGrowth.length === 0) && (
                <div className="text-center text-gray-500 py-4">No user data available</div>
              )}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Sources</h3>
            <div className="space-y-4">
              {systemMetrics.revenueBreakdown && (() => {
                const { subscriptions, commission, premiumFeatures } = systemMetrics.revenueBreakdown;
                const total = subscriptions + commission + premiumFeatures;
                const revenueItems = [
                  { name: 'Subscription Fees', value: subscriptions, color: 'bg-blue-600' },
                  { name: 'Commission', value: commission, color: 'bg-green-600' },
                  { name: 'Premium Features', value: premiumFeatures, color: 'bg-purple-600' }
                ];
                
                return revenueItems.map((item) => {
                  const percentage = total > 0 ? (item.value / total) * 100 : 0;
                  return (
                    <div key={item.name} className="flex justify-between items-center">
                      <span className="text-gray-600">{item.name}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div className={`${item.color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold">₹{item.value.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Activity Summary */}
      {systemMetrics && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{systemMetrics.recentActivity?.newProperties || 0}</p>
              <p className="text-gray-600">New Properties This Week</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{systemMetrics.recentActivity?.newUsers || 0}</p>
              <p className="text-gray-600">New User Registrations</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{systemMetrics.recentActivity?.resolvedComplaints || 0}</p>
              <p className="text-gray-600">Support Tickets Resolved</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;