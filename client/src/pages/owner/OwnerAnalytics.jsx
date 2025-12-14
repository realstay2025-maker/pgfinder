import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChartBarIcon, CurrencyRupeeIcon, HomeIcon, UserGroupIcon, ArrowDownTrayIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../../config/api';
import usePageTitle from '../../hooks/usePageTitle';

const OwnerAnalytics = () => {
  usePageTitle('Analytics & Reports');
  const { user } = useAuth();
  
  const [metrics, setMetrics] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [behaviorData, setBehaviorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${user.token}` };

      const [dashboardRes, revenueRes, occupancyRes, behaviorRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.ANALYTICS}/dashboard?startDate=${dateRange.start}&endDate=${dateRange.end}`, { headers }),
        fetch(`${API_ENDPOINTS.ANALYTICS}/revenue`, { headers }),
        fetch(`${API_ENDPOINTS.ANALYTICS}/occupancy`, { headers }),
        fetch(`${API_ENDPOINTS.ANALYTICS}/tenant-behavior`, { headers })
      ]);

      const [dashboard, revenue, occupancy, behavior] = await Promise.all([
        dashboardRes.json(),
        revenueRes.json(),
        occupancyRes.json(),
        behaviorRes.json()
      ]);

      setMetrics(dashboard.summary);
      setRevenueData(revenue);
      setOccupancyData(occupancy);
      setBehaviorData(behavior);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type, format = 'csv') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.ANALYTICS}/export?type=${type}&format=${format}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_report.csv`;
        a.click();
      } else {
        const data = await response.json();
        console.log('Export data:', data);
      }
    } catch (error) {
      console.error('Export failed:', error);
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
            Analytics & Reports
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive business insights and reporting</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
            { id: 'revenue', name: 'Revenue', icon: CurrencyRupeeIcon },
            { id: 'occupancy', name: 'Occupancy', icon: HomeIcon },
            { id: 'behavior', name: 'Tenant Behavior', icon: UserGroupIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && metrics && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">₹{metrics.revenue.total.toLocaleString()}</p>
                </div>
                <CurrencyRupeeIcon className="w-12 h-12 text-green-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600">+12.5%</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                  <p className="text-3xl font-bold text-blue-600">{metrics.occupancy.occupancyRate.toFixed(1)}%</p>
                </div>
                <HomeIcon className="w-12 h-12 text-blue-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-blue-600">+5.2%</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Tenants</p>
                  <p className="text-3xl font-bold text-purple-600">{metrics.tenantBehavior.newTenants}</p>
                </div>
                <UserGroupIcon className="w-12 h-12 text-purple-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-purple-600">+8.1%</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-3xl font-bold text-orange-600">₹{metrics.revenue.pending.toLocaleString()}</p>
                </div>
                <ChartBarIcon className="w-12 h-12 text-orange-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-orange-600">-3.2%</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => exportReport('revenue')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Export Revenue Report
              </button>
              <button
                onClick={() => exportReport('occupancy')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Export Occupancy Report
              </button>
              <button
                onClick={() => exportReport('tenant_behavior')}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Export Behavior Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revenueData.map((month) => (
                    <tr key={month.month}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month.monthName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₹{month.paid.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">₹{month.pending.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">₹{month.overdue.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{month.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Occupancy Tab */}
      {activeTab === 'occupancy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {occupancyData.map((property) => (
              <div key={property.propertyId} className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{property.propertyName}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Rooms:</span>
                    <span className="font-semibold">{property.totalRooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupied:</span>
                    <span className="font-semibold text-green-600">{property.occupiedRooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vacant:</span>
                    <span className="font-semibold text-red-600">{property.vacantRooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupancy Rate:</span>
                    <span className="font-semibold text-blue-600">{property.occupancyRate}%</span>
                  </div>
                </div>
                <div className="mt-4 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${property.occupancyRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tenant Behavior Tab */}
      {activeTab === 'behavior' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tenant Activity Trends</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Tenants</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaints</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notices</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {behaviorData.map((month) => (
                    <tr key={month.month}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{month.newTenants}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">{month.complaints}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{month.notices}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerAnalytics;