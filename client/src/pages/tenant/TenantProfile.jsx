// client/src/pages/tenant/TenantProfile.jsx
import React from 'react';
import TenantProfileForm from './TenantProfileForm';
import usePageTitle from '../../hooks/usePageTitle';

const TenantProfile = () => {
    usePageTitle('My Profile');
    return <TenantProfileForm />;
};

export default TenantProfile;