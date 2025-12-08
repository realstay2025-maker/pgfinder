const AuditLog = require('../models/AuditLog');

const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      const status = res.statusCode >= 400 ? 'failure' : 'success';
      
      // Log the action
      AuditLog.create({
        userId: req.user?.id,
        action,
        resource,
        resourceId: req.params.id || req.body.id,
        details: {
          method: req.method,
          url: req.originalUrl,
          body: req.method !== 'GET' ? req.body : undefined,
          query: req.query,
          statusCode: res.statusCode
        },
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status
      }).catch(err => console.error('Audit log error:', err));
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = auditLogger;