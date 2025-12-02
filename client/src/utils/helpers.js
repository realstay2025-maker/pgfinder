export const formatCurrency = (amount) => `₹${new Intl.NumberFormat('en-IN').format(amount)}`;

export const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

export const getStatusColor = (status, type = 'default') => {
  const statusColors = {
    pending: 'text-yellow-600 bg-yellow-100',
    approved: 'text-green-600 bg-green-100',
    rejected: 'text-red-600 bg-red-100',
    revoked: 'text-gray-600 bg-gray-100',
    paid: 'text-green-600 bg-green-100',
    overdue: 'text-red-600 bg-red-100',
    partial: 'text-orange-600 bg-orange-100',
    active: 'text-green-600 bg-green-100',
    notice: 'text-orange-600 bg-orange-100'
  };
  
  return statusColors[status] || 'text-gray-600 bg-gray-100';
};

export const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const generateBedId = (roomNumber, bedNumber) => `${roomNumber}-B${bedNumber}`;

export const calculateDaysDiff = (date1, date2) => {
  return Math.ceil((new Date(date1) - new Date(date2)) / (1000 * 60 * 60 * 24));
};