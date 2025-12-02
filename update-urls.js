const fs = require('fs');
const path = require('path');

const files = [
  'pages/AddPropertyPage.jsx',
  'pages/admin/AdminPropertyApprovals.jsx', 
  'pages/ContactUs.jsx',
  'pages/owner/ComplaintResolutionModal.jsx',
  'pages/owner/EditPropertyPage.jsx',
  'pages/owner/OnboardTenantModal.jsx',
  'pages/owner/OwnerComplaintsDashboard.jsx',
  'pages/owner/OwnerInvoices.jsx',
  'pages/owner/OwnerMaintenance.jsx',
  'pages/owner/OwnerTenantRoaster.jsx',
  'pages/owner/RoomManagement.jsx',
  'pages/RegisterPage.jsx',
  'pages/tenant/TenantDashboardHome.jsx',
  'pages/tenant/TenantDocumentDashboard.jsx',
  'pages/tenant/TenantPaymentsDashboard.jsx',
  'pages/tenant/TenantProfileForm.jsx',
  'pages/tenant/TenantSubmitComplaint.jsx',
  'pages/TenantDashboard.jsx'
];

files.forEach(file => {
  const filePath = path.join('g:/project/client/src', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import if not exists
    if (!content.includes("import { API_ENDPOINTS }")) {
      content = content.replace(
        /import.*from.*['"]react['"];?\n/,
        "$&import { API_ENDPOINTS } from '../config/api';\n"
      );
    }
    
    // Replace hardcoded URLs
    content = content.replace(/http:\/\/localhost:5000\/api\/([^'"`\s]+)/g, 'API_ENDPOINTS.$1');
    content = content.replace(/const API_[A-Z_]+ = 'http:\/\/localhost:5000\/api\/[^']+';?\n/g, '');
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${file}`);
  }
});

console.log('URL update complete!');