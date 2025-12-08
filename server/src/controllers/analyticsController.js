const Analytics = require('../models/Analytics');
const Payment = require('../models/Payment');
const Room = require('../models/Room');
const Tenant = require('../models/Tenant');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const Property = require('../models/Property');

const getDashboardMetrics = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { period = 'monthly', startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter.date = { $gte: start, $lte: now };
    }

    const analytics = await Analytics.find({
      ownerId,
      period,
      ...dateFilter
    }).sort({ date: -1 });

    const summary = {
      revenue: { total: 0, collected: 0, pending: 0, overdue: 0 },
      occupancy: { totalRooms: 0, occupiedRooms: 0, vacantRooms: 0, occupancyRate: 0 },
      tenantBehavior: { newTenants: 0, exitedTenants: 0, complaints: 0, notices: 0 },
      propertyPerformance: { bookingRequests: 0, viewCount: 0, conversionRate: 0, rating: 0 }
    };

    analytics.forEach(record => {
      Object.keys(summary).forEach(key => {
        if (record.metrics[key]) {
          Object.keys(summary[key]).forEach(metric => {
            summary[key][metric] += record.metrics[key][metric] || 0;
          });
        }
      });
    });

    if (summary.occupancy.totalRooms > 0) {
      summary.occupancy.occupancyRate = (summary.occupancy.occupiedRooms / summary.occupancy.totalRooms) * 100;
    }

    res.json({ summary, timeline: analytics });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;

    const payments = await Payment.aggregate([
      {
        $lookup: {
          from: 'tenants',
          localField: 'tenantId',
          foreignField: '_id',
          as: 'tenant'
        }
      },
      {
        $lookup: {
          from: 'properties',
          localField: 'tenant.propertyId',
          foreignField: '_id',
          as: 'property'
        }
      },
      {
        $match: {
          'property.ownerId': mongoose.Types.ObjectId(ownerId),
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            status: '$status'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(0, i).toLocaleString('default', { month: 'long' }),
      paid: 0,
      pending: 0,
      overdue: 0,
      total: 0
    }));

    payments.forEach(payment => {
      const monthIndex = payment._id.month - 1;
      monthlyData[monthIndex][payment._id.status] = payment.amount;
      monthlyData[monthIndex].total += payment.amount;
    });

    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getOccupancyReport = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    const properties = await Property.find({ ownerId });
    const propertyIds = properties.map(p => p._id);

    const rooms = await Room.aggregate([
      { $match: { propertyId: { $in: propertyIds } } },
      {
        $group: {
          _id: '$propertyId',
          totalRooms: { $sum: 1 },
          occupiedRooms: {
            $sum: { $cond: [{ $ne: ['$currentTenant', null] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'properties',
          localField: '_id',
          foreignField: '_id',
          as: 'property'
        }
      }
    ]);

    const occupancyData = rooms.map(room => ({
      propertyId: room._id,
      propertyName: room.property[0]?.title || 'Unknown',
      totalRooms: room.totalRooms,
      occupiedRooms: room.occupiedRooms,
      vacantRooms: room.totalRooms - room.occupiedRooms,
      occupancyRate: ((room.occupiedRooms / room.totalRooms) * 100).toFixed(2)
    }));

    res.json(occupancyData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTenantBehaviorReport = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { period = '6months' } = req.query;

    const months = period === '6months' ? 6 : 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const properties = await Property.find({ ownerId });
    const propertyIds = properties.map(p => p._id);

    const [tenants, complaints, notices] = await Promise.all([
      Tenant.aggregate([
        { $match: { propertyId: { $in: propertyIds }, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            newTenants: { $sum: 1 }
          }
        }
      ]),
      Complaint.aggregate([
        { $match: { propertyId: { $in: propertyIds }, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            complaints: { $sum: 1 }
          }
        }
      ]),
      Notice.aggregate([
        { $match: { propertyId: { $in: propertyIds }, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            notices: { $sum: 1 }
          }
        }
      ])
    ]);

    const behaviorData = {};
    
    [tenants, complaints, notices].forEach((data, index) => {
      const key = ['newTenants', 'complaints', 'notices'][index];
      data.forEach(item => {
        if (!behaviorData[item._id]) {
          behaviorData[item._id] = { month: item._id, newTenants: 0, complaints: 0, notices: 0 };
        }
        behaviorData[item._id][key] = item[key];
      });
    });

    res.json(Object.values(behaviorData).sort((a, b) => a.month.localeCompare(b.month)));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const exportReport = async (req, res) => {
  try {
    const { type, format = 'json', ...filters } = req.query;
    
    let data;
    switch (type) {
      case 'revenue':
        data = await getRevenueData(req.user.id, filters);
        break;
      case 'occupancy':
        data = await getOccupancyData(req.user.id, filters);
        break;
      case 'tenant_behavior':
        data = await getTenantBehaviorData(req.user.id, filters);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    if (format === 'csv') {
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_report.csv`);
      return res.send(csv);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCustomReport = async (req, res) => {
  try {
    const { metrics, dateRange, groupBy, filters } = req.body;
    const ownerId = req.user.id;

    // Build dynamic aggregation pipeline based on custom requirements
    const pipeline = [
      { $match: { ownerId: mongoose.Types.ObjectId(ownerId) } }
    ];

    if (dateRange) {
      pipeline[0].$match.createdAt = {
        $gte: new Date(dateRange.start),
        $lte: new Date(dateRange.end)
      };
    }

    if (filters) {
      Object.keys(filters).forEach(key => {
        pipeline[0].$match[key] = filters[key];
      });
    }

    const result = await Analytics.aggregate(pipeline);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper functions
const convertToCSV = (data) => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  return [headers, ...rows].join('\n');
};

module.exports = {
  getDashboardMetrics,
  getRevenueReport,
  getOccupancyReport,
  getTenantBehaviorReport,
  exportReport,
  getCustomReport
};