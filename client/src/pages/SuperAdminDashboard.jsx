// client/src/pages/SuperAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import MetricCard from '../components/Admin/MatricCard';
import ChartContainer from '../components/Admin/ChartContainer';

// Placeholder/Mock API fetch function
const fetchAdminData = async () => {
  // In a real app, replace with: await fetch('/api/admin/dashboard-data').then(res => res.json());
  return {
    metrics: [
      { title: 'Total PGs', value: 125, change: '+12%', type: 'success' },
      { title: 'Active Owners', value: 78, change: '+5%', type: 'info' },
      { title: 'Site Occupancy', value: 85, change: '-1%', type: 'warning' },
      { title: 'Open Complaints', value: 14, change: '2 New', type: 'danger' },
    ],
    pgGrowth: {
      labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      data: [15, 20, 35, 40, 45, 55],
    },
    occupancyByLocation: {
      labels: ['Koregaon Park', 'Hinjewadi', 'Viman Nagar', 'Magarpatta'],
      data: [75, 92, 88, 70],
    },
    pendingListings: [
      { id: 'PL001', name: 'Sunrise Heights PG', owner: 'Ravi Sharma', date: '2025-11-20', status: 'Pending' },
      { id: 'PL002', name: 'Green Valley Hostel', owner: 'Priya Verma', date: '2025-11-21', status: 'Pending' },
      { id: 'PL003', name: 'City Center Flats', owner: 'Amit Singh', date: '2025-11-22', status: 'Pending' },
    ]
  };
};

const SuperAdminDashboard = () => {
  const [data, setData] = useState({ metrics: [], pgGrowth: {}, occupancyByLocation: {}, pendingListings: [] });

  useEffect(() => {
    fetchAdminData().then(setData);
  }, []);

  // Tailwind classes for table headers
  const tableHeaderClasses = "px-3 md:px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase";
  const tableRowClasses = "px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4 md:mb-6">Super Admin Dashboard</h1>

      {/* 1. KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {data.metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* PG Listing Growth Chart */}
        <ChartContainer
          title="Monthly PG Listing Approvals"
          data={data.pgGrowth}
          type="Line"
        />
        {/* Occupancy By Location Chart */}
        <ChartContainer
          title="Occupancy Rate by Location"
          data={data.occupancyByLocation}
          type="Doughnut"
        />
      </div>

      {/* 3. Pending Listings Table */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3 md:mb-4 border-b pb-2">Pending PG Listings for Approval</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className={`${tableHeaderClasses} hidden sm:table-cell`}>Listing ID</th>
                <th scope="col" className={tableHeaderClasses}>PG Name</th>
                <th scope="col" className={`${tableHeaderClasses} hidden md:table-cell`}>Owner</th>
                <th scope="col" className={`${tableHeaderClasses} hidden lg:table-cell`}>Date Submitted</th>
                <th scope="col" className={tableHeaderClasses}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.pendingListings.map((item) => (
                <tr key={item.id}>
                  <td className={`${tableRowClasses} hidden sm:table-cell`}>{item.id}</td>
                  <td className={tableRowClasses}>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 md:hidden">{item.owner}</div>
                      <div className="text-xs text-gray-500 lg:hidden">{item.date}</div>
                    </div>
                  </td>
                  <td className={`${tableRowClasses} hidden md:table-cell`}>{item.owner}</td>
                  <td className={`${tableRowClasses} hidden lg:table-cell`}>{item.date}</td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                      <button className="text-accent-green hover:text-green-700 py-1 px-2 rounded transition-colors">Approve</button>
                      <button className="text-custom-red hover:text-red-700 py-1 px-2 rounded transition-colors">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 md:mt-4 text-xs md:text-sm text-gray-500">
          Total pending: {data.pendingListings.length}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;