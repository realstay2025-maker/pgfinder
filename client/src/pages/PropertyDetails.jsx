// client/src/pages/PropertyDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPinIcon, CurrencyRupeeIcon, StarIcon, WifiIcon, HomeIcon, UserGroupIcon, PhoneIcon, ArrowLeftIcon, CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import axios from 'axios';

const PropertyDetails = () => {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showContactForm, setShowContactForm] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', roomType: '', moveInDate: '' });

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/properties/public/${id}`);
                setProperty(res.data);
            } catch (err) {
                console.error('Failed to fetch property:', err);
                setProperty(null);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProperty();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h2>
                    <Link to="/" className="text-primary-dark hover:underline">Back to listings</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Property Images */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden mb-8 border border-white/20">
                            <div className="h-64 md:h-96 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                                    <div className="absolute top-8 left-8 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
                                    <div className="absolute bottom-8 right-8 w-24 h-24 bg-white/10 rounded-full animate-pulse animation-delay-1000"></div>
                                </div>
                                <div className="text-center text-white z-10">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 border border-white/30">
                                        <HomeIcon className="w-20 h-20 mx-auto mb-4" />
                                        <p className="text-xl font-bold">{property.title}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Property Info */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">{property.title}</h1>
                                    <p className="flex items-center text-gray-600 text-lg">
                                        <MapPinIcon className="w-6 h-6 mr-3 text-red-500" />
                                        {property.address?.line1}, {property.address?.city}, {property.address?.state}
                                    </p>
                                </div>
                                <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
                                    <StarIcon className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                                    <span className="text-lg font-bold ml-2 text-yellow-600">4.2</span>
                                </div>
                            </div>
                            
                            <p className="text-gray-700 mb-8 text-lg leading-relaxed">{property.description}</p>

                            {/* Amenities */}
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="mr-3">✨</span> Amenities
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {property.amenities?.map((amenity, index) => (
                                        <div key={index} className="flex items-center bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-2xl border border-blue-100">
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                                            <span className="font-medium text-gray-700">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Room Types */}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="mr-3">🏠</span> Available Room Types
                                </h3>
                                <div className="space-y-4">
                                    {property.roomTypes?.map((room, index) => (
                                        <div key={index} className="bg-gradient-to-r from-white to-blue-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="text-xl font-bold text-gray-900 capitalize mb-2">{room.type} Sharing</h4>
                                                    <p className="text-gray-600 flex items-center">
                                                        <span className="mr-2">🛏️</span>
                                                        {room.availableCount} rooms available
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center">
                                                        <CurrencyRupeeIcon className="w-8 h-8 mr-2 text-green-600" />
                                                        {room.basePrice}
                                                        <span className="text-lg font-normal text-gray-500 ml-2">/month</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sticky top-8 border border-white/20">
                            <div className="text-center mb-8">
                                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center justify-center mb-2">
                                    <CurrencyRupeeIcon className="w-10 h-10 mr-2 text-green-600" />
                                    {property.basePrice}
                                    <span className="text-xl font-normal text-gray-500 ml-2">/month</span>
                                </p>
                                <p className="text-gray-600 text-lg">Starting from</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <button 
                                    onClick={() => setShowBookingForm(true)}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    🎯 Book Now
                                </button>
                                <button 
                                    onClick={() => setShowContactForm(true)}
                                    className="w-full border-2 border-blue-300 text-blue-600 py-4 px-6 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-200 flex items-center justify-center"
                                >
                                    <EnvelopeIcon className="w-6 h-6 mr-2" />
                                    Contact Owner
                                </button>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                                <h4 className="font-bold text-gray-900 mb-4 text-lg">📋 Quick Info</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Property Type:</span>
                                        <span className="font-bold text-gray-900">PG/Hostel</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Room Types:</span>
                                        <span className="font-bold text-gray-900">{property.roomTypes?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Amenities:</span>
                                        <span className="font-bold text-gray-900">{property.amenities?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form Modal */}
            {showContactForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl max-w-md w-full p-8 border border-white/20 shadow-2xl">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Contact Property Owner</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                await axios.post('http://localhost:5000/api/contact', {
                                    ...contactForm,
                                    propertyId: id,
                                    propertyTitle: property.title
                                });
                                alert('Message sent successfully!');
                                setShowContactForm(false);
                                setContactForm({ name: '', email: '', phone: '', message: '' });
                            } catch (err) {
                                alert('Failed to send message. Please try again.');
                            }
                        }}>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <input
                                    type="tel"
                                    placeholder="Your Phone"
                                    value={contactForm.phone}
                                    onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <textarea
                                    placeholder="Your Message"
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200">
                                    Send Message
                                </button>
                                <button type="button" onClick={() => setShowContactForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Booking Form Modal */}
            {showBookingForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl max-w-md w-full p-8 border border-white/20 shadow-2xl">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Book This Property</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                await axios.post('http://localhost:5000/api/bookings', {
                                    ...bookingForm,
                                    propertyId: id,
                                    propertyTitle: property.title
                                });
                                alert('Booking request submitted successfully! Owner will contact you soon.');
                                setShowBookingForm(false);
                                setBookingForm({ name: '', email: '', phone: '', roomType: '', moveInDate: '' });
                            } catch (err) {
                                alert('Failed to submit booking. Please try again.');
                            }
                        }}>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={bookingForm.name}
                                    onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    value={bookingForm.email}
                                    onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <input
                                    type="tel"
                                    placeholder="Your Phone"
                                    value={bookingForm.phone}
                                    onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <select
                                    value={bookingForm.roomType}
                                    onChange={(e) => setBookingForm({...bookingForm, roomType: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">Select Room Type</option>
                                    {property.roomTypes?.map((room, index) => (
                                        <option key={index} value={room.type}>
                                            {room.type} Sharing - ₹{room.basePrice}/month
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    value={bookingForm.moveInDate}
                                    onChange={(e) => setBookingForm({...bookingForm, moveInDate: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200">
                                    Submit Booking
                                </button>
                                <button type="button" onClick={() => setShowBookingForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyDetails;