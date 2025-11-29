
import React from 'react';

const colorMap = {
  success: 'text-accent-green bg-green-100',
  info: 'text-blue-500 bg-blue-100',
  warning: 'text-yellow-500 bg-yellow-100',
  danger: 'text-custom-red bg-red-100',
};

const MetricCard = ({ title, value, change, type }) => {
  const colorClasses = colorMap[type] || 'text-gray-600 bg-gray-100';

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg transition duration-300 hover:shadow-2xl">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm md:text-lg font-semibold text-gray-500 leading-tight">{title}</h3>
        <span className={`text-xs md:text-sm font-medium px-2 md:px-3 py-1 rounded-full ${colorClasses} flex-shrink-0`}>
          {change}
        </span>
      </div>
      <div className="mt-3 md:mt-4">
        <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{value}</p>
      </div>
      <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-400">Since last month</p>
    </div>
  );
};

export default MetricCard;