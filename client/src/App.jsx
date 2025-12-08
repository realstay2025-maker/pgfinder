import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// --- SHARED COMPONENTS & PAGES ---
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicListings from './pages/PublicListings';
import PropertyDetails from './pages/PropertyDetails';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Services from './pages/Services';
import FAQ from './pages/FAQ';
import SearchPage from './pages/SearchPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
// Note: ProtectedRoute is assumed to be an obsolete wrapper if AdminProtectedRoute is used
// import ProtectedRoute from './components/ProtectedRoute'; 

// --- OWNER IMPORTS ---
import OwnerLayout from './components/Owner/OwnerLayout'; 
import OwnerProtectedRoute from './components/Owner/OwnerProtectedRoute';
import OwnerDashboardHome from './pages/owner/OwnerDashboardHome';
import OwnerProperties from './pages/owner/OwnerProperties'; 
import AddPropertyPage from './pages/AddPropertyPage'; 
import RoomManagement from './pages/owner/RoomManagement';
import BankSetupPage from './pages/owner/BankSetupPage';
import OwnerPaymentsDashboard from './pages/owner/OwnerPaymentDashboard';
import OwnerTenantsList from './pages/owner/OwnerTenantsList';
import OwnerComplaintsDashboard from './pages/owner/OwnerComplaintsDashboard';
import EditPropertyPage from './pages/owner/EditPropertyPage';
import OwnerNotices from './pages/owner/OwnerNotices';
import OwnerMaintenance from './pages/owner/OwnerMaintenance';
import OwnerInvoices from './pages/owner/OwnerInvoices';
import OwnerInbox from './pages/owner/OwnerInbox';
import OwnerProfile from './pages/owner/OwnerProfile';
import OwnerAnalytics from './pages/owner/OwnerAnalytics';

// --- TENANT IMPORTS ---
import TenantLayout from './components/Tenant/TenantLayout';
import TenantProtectedRoute from './components/Tenant/TenantProtectedRoute';
import TenantDashboardHome from './pages/tenant/TenantDashboardHome';
import TenantProfile from './pages/tenant/TenantProfile';
import TenantSubmitComplaint from './pages/tenant/TenantSubmitComplaint';
import TenantPaymentsDashboard from './pages/tenant/TenantPaymentsDashboard';
import TenantDocumentsDashboard from './pages/tenant/TenantDocumentDashboard';
import TenantGiveNotice from './pages/tenant/TenantGiveNotice';

// --- ADMIN IMPORTS ---
import AdminLayout from './components/Admin/AdminLayout'; // The simple layout wrapper
import AdminProtectedRoute from './components/Admin/AdminProtectedRoute'; // Super Admin check
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import AdminPropertyApprovals from './pages/admin/AdminPropertyApprovals';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function App() {
  return (
    <Router>
      <AuthProvider> {/* WRAP ENTIRE APP IN AUTH CONTEXT */}
        <Routes>
          {/* --------------------------------------------------- */}
          {/* 1. PUBLIC ROUTES */}
          {/* --------------------------------------------------- */}
          <Route path="/" element={<PublicListings />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* --------------------------------------------------- */}
          {/* 2. PROTECTED ADMIN ROUTES */}
          {/* Uses AdminProtectedRoute to ensure 'super_admin' role */}
          {/* --------------------------------------------------- */}
          <Route path="/admin" element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboardHome />} /> {/* /admin */}
              <Route path="properties" element={<AdminPropertyApprovals />} /> {/* /admin/properties */}
              <Route path="users" element={<AdminUserManagement />} /> {/* /admin/users */}
              <Route path="subscriptions" element={<AdminSubscriptions />} /> {/* /admin/subscriptions */}
              <Route path="analytics" element={<AdminAnalytics />} /> {/* /admin/analytics */}
              <Route path="settings" element={<AdminSettings />} /> {/* /admin/settings */}
            </Route>
          </Route>

          {/* --------------------------------------------------- */}
          {/* 3. PROTECTED TENANT ROUTES */}
          {/* Uses TenantProtectedRoute to ensure 'tenant' role */}
          {/* --------------------------------------------------- */}
          <Route path="/tenant" element={<TenantProtectedRoute />}>
            <Route element={<TenantLayout />}> 
              {/* index route for /tenant */}
              <Route index element={<TenantDashboardHome />} /> 
              <Route path="profile" element={<TenantProfile />} />
              <Route path="payments" element={<TenantPaymentsDashboard />} />
              <Route path="submit-complaint" element={<TenantSubmitComplaint />} /> 
              <Route path="documents" element={<TenantDocumentsDashboard />} />
              <Route path="give-notice" element={<TenantGiveNotice />} />
            </Route>
          </Route>

          {/* --------------------------------------------------- */}
          {/* 4. PROTECTED OWNER ROUTES */}
          {/* Uses OwnerProtectedRoute to ensure 'pg_owner' role */}
          {/* --------------------------------------------------- */}
          <Route path="/owner" element={<OwnerProtectedRoute />}>
            <Route element={<OwnerLayout />}>
                <Route index element={<OwnerDashboardHome />} /> {/* /owner */}
                <Route path="inbox" element={<OwnerInbox />} /> {/* /owner/inbox */}
                <Route path="properties" element={<OwnerProperties />} /> {/* /owner/properties */}
                <Route path="add-property" element={<AddPropertyPage />} /> {/* /owner/add-property */}
                <Route path="bank-setup" element={<BankSetupPage />} /> {/* /owner/bank-setup */}
                <Route path="payments" element={<OwnerPaymentsDashboard />} /> {/* /owner/payments */}
                <Route path="tenants" element={<OwnerTenantsList />} /> {/* /owner/tenants */}
                <Route path="complaints" element={<OwnerComplaintsDashboard />} /> {/* /owner/complaints */}
                <Route path="notices" element={<OwnerNotices />} /> {/* /owner/notices */}
                <Route path="maintenance" element={<OwnerMaintenance />} /> {/* /owner/maintenance */}
                <Route path="invoices" element={<OwnerInvoices />} /> {/* /owner/invoices */}
                <Route path="analytics" element={<OwnerAnalytics />} /> {/* /owner/analytics */}
                <Route path="profile" element={<OwnerProfile />} /> {/* /owner/profile */}
                <Route path="edit-property/:id" element={<EditPropertyPage />} /> {/* /owner/edit-property/:id */}
                <Route path="rooms/:propertyId" element={<RoomManagement />} /> {/* /owner/rooms/:propertyId */}
            </Route>
          </Route>
          
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;