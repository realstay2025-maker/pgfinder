// client/src/pages/tenant/TenantProfileFormNew.jsx
import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../config/theme';
import axios from 'axios';
import { 
    UserIcon, 
    PhoneIcon, 
    MapPinIcon, 
    BriefcaseIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    CameraIcon,
    IdentificationIcon,
    HomeModernIcon,
    CheckIcon
} from '@heroicons/react/24/outline';

const TenantProfileForm = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        // Personal Details
        fullName: '',
        dateOfBirth: '',
        age: '',
        bloodGroup: '',
        aadhaarNumber: '',
        panNumber: '',
        phone: '',
        email: '',
        permanentAddress: '',
        pgName: '',
        
        // Academic / Employment Details
        institute: '',
        designation: '',
        collegeCompanyId: '',
        institutionAddress: '',
        
        // Emergency Contact Details
        emergencyContactName: '',
        relationship: '',
        emergencyMobile1: '',
        emergencyMobile2: '',
        
        // Medical Information
        medicalConditions: '',
        allergies: '',
        regularMedication: '',
        
        // Documents Submitted (checkboxes)
        aadhaarCardSubmitted: false,
        panCardSubmitted: false,
        collegeIdSubmitted: false,
        photographsSubmitted: false
    });

    const [files, setFiles] = useState({
        photo: null,
        aadhaarCard: null,
        panCard: null,
        collegeId: null,
        photographs: null
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [pgFetched, setPgFetched] = useState(false);
    const [acceptDeclaration, setAcceptDeclaration] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setError(null);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_ENDPOINTS.TENANT}/profile`, config);
            
            setProfile(prev => ({
                ...prev,
                pgName: res.data.pgName || user?.pgName || '',
                phone: res.data.phone || '',
                permanentAddress: res.data.permanentAddress || '',
                aadhaarNumber: res.data.aadhaarNumber || '',
                email: user.email || '',
                fullName: user.name || '',
                ...res.data
            }));
            setIsCompleted(res.data.profileCompleted);
            setPgFetched(true);
            
            if (res.data.pgName) {
                console.log('✓ PG Name loaded:', res.data.pgName);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError(err.response?.data?.error || 'Failed to load profile');
            setPgFetched(true);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile({
            ...profile,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles[0]) {
            const file = selectedFiles[0];
            
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setMessage('File size must be less than 5MB');
                return;
            }
            
            setFiles({ ...files, [name]: file });
            setMessage('');
        }
    };

    const validateForm = () => {
        const errors = [];
        
        // Personal Details
        if (!profile.fullName?.trim()) errors.push('Full name is required');
        if (!profile.dateOfBirth) errors.push('Date of birth is required');
        if (!profile.age || profile.age < 18) errors.push('Age must be at least 18');
        if (!profile.bloodGroup) errors.push('Blood group is required');
        if (!profile.aadhaarNumber || profile.aadhaarNumber.length !== 12) errors.push('Aadhaar number must be 12 digits');
        if (!profile.panNumber?.trim()) errors.push('PAN number is required');
        if (!profile.phone || !/^[6-9]\d{9}$/.test(profile.phone)) errors.push('Valid mobile number required');
        if (!profile.permanentAddress?.trim()) errors.push('Permanent address required');
        if (!files.photo) errors.push('Profile photo is required');
        
        // Academic / Employment
        if (!profile.institute?.trim()) errors.push('Institute/Company name required');
        if (!profile.designation?.trim()) errors.push('Course/Designation required');
        if (!profile.collegeCompanyId?.trim()) errors.push('College/Company ID required');
        if (!profile.institutionAddress?.trim()) errors.push('Institution address required');
        
        // Emergency Contact
        if (!profile.emergencyContactName?.trim()) errors.push('Emergency contact name required');
        if (!profile.relationship?.trim()) errors.push('Relationship required');
        if (!profile.emergencyMobile1 || !/^[6-9]\d{9}$/.test(profile.emergencyMobile1)) errors.push('Valid emergency mobile 1 required');
        
        // Medical Info
        if (!profile.medicalConditions?.trim()) errors.push('Medical conditions (or "None") required');
        if (!profile.allergies?.trim()) errors.push('Allergies (or "None") required');
        if (!profile.regularMedication?.trim()) errors.push('Regular medication (or "None") required');
        
        // Documents
        if (!acceptDeclaration) errors.push('You must accept the declaration');
        
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setMessage(validationErrors.join('. '));
            return;
        }
        
        setLoading(true);
        setMessage('');

        try {
            const formData = new FormData();
            
            // Append all profile data
            Object.keys(profile).forEach(key => {
                formData.append(key, profile[key]);
            });
            
            // Append files
            if (files.photo) formData.append('photo', files.photo);
            if (files.aadhaarCard) formData.append('aadhaarCard', files.aadhaarCard);
            if (files.panCard) formData.append('panCard', files.panCard);
            if (files.collegeId) formData.append('collegeId', files.collegeId);
            if (files.photographs) formData.append('photographs', files.photographs);

            const config = { 
                headers: { 
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                } 
            };
            const res = await axios.put(`${API_ENDPOINTS.TENANT}/profile`, formData, config);
            
            setMessage('Profile updated successfully!');
            setIsCompleted(res.data.profileCompleted);
            
            if (res.data.profileCompleted) {
                console.log('✓ Profile completion status:', res.data.profileCompleted);
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to update profile');
            console.error('Profile submission error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tenant Profile Form</h1>
                    <p className="text-gray-600">Please complete all sections carefully</p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
                        <div className="flex items-start gap-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-red-800 font-medium">Unable to Load Profile</p>
                                <p className="text-red-700 text-sm mt-1">{error}</p>
                                <button
                                    onClick={fetchProfile}
                                    type="button"
                                    className="mt-2 text-sm bg-red-200 hover:bg-red-300 text-red-800 px-3 py-1 rounded transition"
                                >
                                    Retry Loading
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isCompleted && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded">
                        <div className="flex items-start gap-3">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-green-800 font-semibold">✓ Profile Completed Successfully!</p>
                                <p className="text-green-700 text-sm mt-1">Your profile has been verified and is in the assignment queue.</p>
                            </div>
                        </div>
                    </div>
                )}

                {message && message.includes('updated successfully') && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded">
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            <p className="text-green-800 font-medium">{message}</p>
                        </div>
                    </div>
                )}

                {message && !message.includes('updated successfully') && !error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded text-red-800 text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* PG Assignment Status */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Assigned PG Property</label>
                                {profile.pgName && profile.pgName !== 'Not selected' && profile.pgName !== '' ? (
                                    <div className="flex items-center gap-2">
                                        <HomeModernIcon className="w-5 h-5 text-blue-600" />
                                        <span className="font-semibold text-lg text-blue-900">{profile.pgName}</span>
                                        <span className="inline-block bg-blue-600 text-white text-xs px-3 py-1 rounded-full">✓ Assigned</span>
                                    </div>
                                ) : (
                                    <div className="text-gray-600">Awaiting PG Assignment</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 1: PERSONAL DETAILS */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-emerald-600">1. Personal Details</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={profile.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={profile.dateOfBirth}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                />
                            </div>

                            {/* Age */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={profile.age}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Enter age"
                                    min="18"
                                    required
                                />
                            </div>

                            {/* Blood Group */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                                <select
                                    name="bloodGroup"
                                    value={profile.bloodGroup}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>

                            {/* Aadhaar Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar No.</label>
                                <input
                                    type="text"
                                    name="aadhaarNumber"
                                    value={profile.aadhaarNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 12) {
                                            setProfile({ ...profile, aadhaarNumber: value });
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="12-digit Aadhaar"
                                    maxLength="12"
                                    required
                                />
                            </div>

                            {/* PAN Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">PAN No.</label>
                                <input
                                    type="text"
                                    name="panNumber"
                                    value={profile.panNumber}
                                    onChange={(e) => setProfile({ ...profile, panNumber: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="PAN number"
                                    maxLength="10"
                                    required
                                />
                            </div>

                            {/* Mobile No */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile No.</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profile.phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 10) {
                                            setProfile({ ...profile, phone: value });
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="10-digit mobile number"
                                    maxLength="10"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email ID</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            {/* Permanent Address */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address</label>
                                <textarea
                                    name="permanentAddress"
                                    value={profile.permanentAddress}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Enter permanent address"
                                    required
                                />
                            </div>

                            {/* Photo Upload */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Applicant's Photo</label>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            name="photo"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            required
                                        />
                                        {files.photo && <p className="text-sm text-green-600 mt-1">✓ {files.photo.name}</p>}
                                    </div>
                                    <div className="w-32 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                        {files.photo ? (
                                            <img src={URL.createObjectURL(files.photo)} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <CameraIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-xs text-gray-500">Photo Preview</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: ACADEMIC / EMPLOYMENT DETAILS */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-emerald-600">2. Academic / Employment Details</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Institute / Company Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Institute / Company Name</label>
                                <input
                                    type="text"
                                    name="institute"
                                    value={profile.institute}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Enter name"
                                    required
                                />
                            </div>

                            {/* Course / Designation */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Course / Designation</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={profile.designation}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Enter course or designation"
                                    required
                                />
                            </div>

                            {/* College / Company ID No */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">College / Company ID No.</label>
                                <input
                                    type="text"
                                    name="collegeCompanyId"
                                    value={profile.collegeCompanyId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Enter ID number"
                                    required
                                />
                            </div>

                            {/* Institution / Office Address */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Institution / Office Address</label>
                                <textarea
                                    name="institutionAddress"
                                    value={profile.institutionAddress}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Enter address"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: EMERGENCY CONTACT DETAILS */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-emerald-600">3. Emergency Contact Details</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Emergency Contact Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    name="emergencyContactName"
                                    value={profile.emergencyContactName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Emergency contact name"
                                    required
                                />
                            </div>

                            {/* Relationship */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship with Applicant</label>
                                <input
                                    type="text"
                                    name="relationship"
                                    value={profile.relationship}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="e.g., Father, Mother, Brother"
                                    required
                                />
                            </div>

                            {/* Mobile 1 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number 1</label>
                                <input
                                    type="tel"
                                    name="emergencyMobile1"
                                    value={profile.emergencyMobile1}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 10) {
                                            setProfile({ ...profile, emergencyMobile1: value });
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="10-digit mobile"
                                    maxLength="10"
                                    required
                                />
                            </div>

                            {/* Mobile 2 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number 2 (Optional)</label>
                                <input
                                    type="tel"
                                    name="emergencyMobile2"
                                    value={profile.emergencyMobile2}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 10) {
                                            setProfile({ ...profile, emergencyMobile2: value });
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="10-digit mobile"
                                    maxLength="10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: MEDICAL INFORMATION */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-emerald-600">4. Medical Information</h2>
                        
                        <div className="grid grid-cols-1 gap-6">
                            {/* Medical Conditions */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Any Medical Conditions (if any)</label>
                                <textarea
                                    name="medicalConditions"
                                    value={profile.medicalConditions}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Enter medical conditions or 'None'"
                                    required
                                />
                            </div>

                            {/* Allergies */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Allergies (if any)</label>
                                <textarea
                                    name="allergies"
                                    value={profile.allergies}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Enter allergies or 'None'"
                                    required
                                />
                            </div>

                            {/* Regular Medication */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Regular Medication</label>
                                <textarea
                                    name="regularMedication"
                                    value={profile.regularMedication}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Enter regular medications or 'None'"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: DOCUMENTS SUBMITTED */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-emerald-600">5. Documents Submitted (✓)</h2>
                        
                        <div className="space-y-4">
                            {/* Aadhaar Card */}
                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    name="aadhaarCardSubmitted"
                                    checked={profile.aadhaarCardSubmitted}
                                    onChange={handleChange}
                                    id="aadhaarCheckbox"
                                    className="w-5 h-5 text-emerald-600 rounded"
                                />
                                <label htmlFor="aadhaarCheckbox" className="flex-1 font-medium text-gray-700">
                                    Aadhaar Card Copy
                                </label>
                                <input
                                    type="file"
                                    name="aadhaarCard"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                                {files.aadhaarCard && <CheckIcon className="w-5 h-5 text-green-600" />}
                            </div>

                            {/* PAN Card */}
                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    name="panCardSubmitted"
                                    checked={profile.panCardSubmitted}
                                    onChange={handleChange}
                                    id="panCheckbox"
                                    className="w-5 h-5 text-emerald-600 rounded"
                                />
                                <label htmlFor="panCheckbox" className="flex-1 font-medium text-gray-700">
                                    PAN Card Copy
                                </label>
                                <input
                                    type="file"
                                    name="panCard"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                                {files.panCard && <CheckIcon className="w-5 h-5 text-green-600" />}
                            </div>

                            {/* College/Company ID */}
                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    name="collegeIdSubmitted"
                                    checked={profile.collegeIdSubmitted}
                                    onChange={handleChange}
                                    id="collegeCheckbox"
                                    className="w-5 h-5 text-emerald-600 rounded"
                                />
                                <label htmlFor="collegeCheckbox" className="flex-1 font-medium text-gray-700">
                                    College/Company ID
                                </label>
                                <input
                                    type="file"
                                    name="collegeId"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                                {files.collegeId && <CheckIcon className="w-5 h-5 text-green-600" />}
                            </div>

                            {/* Photographs */}
                            {/* <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    name="photographsSubmitted"
                                    checked={profile.photographsSubmitted}
                                    onChange={handleChange}
                                    id="photoCheckbox"
                                    className="w-5 h-5 text-emerald-600 rounded"
                                />
                                <label htmlFor="photoCheckbox" className="flex-1 font-medium text-gray-700">
                                    Photographs (2 nos.)
                                </label>
                                <input
                                    type="file"
                                    name="photographs"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                                {files.photographs && <CheckIcon className="w-5 h-5 text-green-600" />}
                            </div> */}
                        </div>
                    </div>

                    {/* SECTION 6: DECLARATION */}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-yellow-400">Declaration by the Applicant</h2>
                        
                        <div className="space-y-4 text-sm text-gray-700 mb-6">
                            <p>
                                <span className="font-bold">1.</span> I have carefully read and understood all the rules and regulations of the Hostel. I will follow ALL the rules and regulations and subsequent changes / addition if any as laid down by the Hostel Management.
                            </p>
                            <p>
                                <span className="font-bold">2.</span> I understand that suitable action can be taken against me if I do not abide by the rules and regulations of the Hostel. If I leave the Hostel on my own without giving prior notice of 15 days, I will not be entitled to claim any refund of my deposit amount.
                            </p>
                            <p>
                                <span className="font-bold">3.</span> I hereby declare that all the information provided above is true to the best of my knowledge. I further declare that if anything happens to me or any kind of mishap occurs outside/inside of the Hostel due to my negligence/fault, the Hostel Authority will not be responsible for that.
                            </p>
                            <p>
                                <span className="font-bold">4.</span> I hereby declare that I will take due care of all my personal belongings and valuable non-electronic / electronic items (mobile phones / laptops / tablet etc.) at all times and keep it in the cupboard allotted to me when not in use or while I am away from the flat and understand that the Hostel Management will not be responsible for any loss, theft or damage to these items in the Room/Flat.
                            </p>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-white rounded border border-yellow-300">
                            <input
                                type="checkbox"
                                checked={acceptDeclaration}
                                onChange={(e) => setAcceptDeclaration(e.target.checked)}
                                id="declaration"
                                className="w-5 h-5 text-emerald-600 rounded mt-1 flex-shrink-0"
                            />
                            <label htmlFor="declaration" className="text-gray-700">
                                <span className="font-medium">I accept all the above terms and conditions</span> and hereby declare that the information provided is true and correct.
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading || !!error || !acceptDeclaration}
                            className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                        >
                            {loading ? 'Submitting...' : error ? 'Cannot Submit' : 'Submit Profile'}
                        </button>
                        <button
                            type="button"
                            onClick={() => window.scrollTo(0, 0)}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                        >
                            Scroll to Top
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TenantProfileForm;
