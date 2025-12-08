import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import usePageTitle from '../hooks/usePageTitle';

const FAQ = () => {
    usePageTitle('FAQ');
    const [openFAQ, setOpenFAQ] = useState(null);

    const faqs = [
        {
            category: 'General',
            questions: [
                {
                    q: 'What is PGFinder?',
                    a: 'PGFinder is a comprehensive platform that connects students and working professionals with verified PG accommodations. We help you find safe, affordable, and convenient housing options.'
                },
                {
                    q: 'Is PGFinder free to use?',
                    a: 'Yes, browsing and searching for PGs on our platform is completely free for tenants. Property owners pay a small fee for listing their properties.'
                },
                {
                    q: 'How do I search for PGs?',
                    a: 'You can search for PGs using our advanced filters including location, budget, room type, amenities, and more. Simply enter your preferences on our homepage.'
                }
            ]
        },
        {
            category: 'For Tenants',
            questions: [
                {
                    q: 'How do I book a PG?',
                    a: 'Browse properties, view details, and click "Book Now" on your preferred PG. Fill out the booking form and the owner will contact you directly.'
                },
                {
                    q: 'Are all properties verified?',
                    a: 'Yes, all properties listed on PGFinder go through our verification process including property inspection, owner background checks, and legal document verification.'
                },
                {
                    q: 'What if I have issues with my PG?',
                    a: 'You can raise complaints through your tenant dashboard. Our support team works with property owners to resolve issues quickly.'
                }
            ]
        },
        {
            category: 'For Property Owners',
            questions: [
                {
                    q: 'How do I list my property?',
                    a: 'Register as a property owner, complete your profile, and submit your property details. Our team will verify and approve your listing within 24-48 hours.'
                },
                {
                    q: 'What are the listing fees?',
                    a: 'We charge a small monthly fee for active listings. Contact our sales team for detailed pricing information.'
                },
                {
                    q: 'How do I manage bookings?',
                    a: 'Use your owner dashboard to view booking requests, manage tenants, track payments, and handle maintenance requests.'
                }
            ]
        },
        {
            category: 'Payments',
            questions: [
                {
                    q: 'What payment methods are accepted?',
                    a: 'We accept all major payment methods including UPI, net banking, credit/debit cards, and digital wallets.'
                },
                {
                    q: 'Is my payment information secure?',
                    a: 'Yes, we use industry-standard encryption and secure payment gateways to protect your financial information.'
                },
                {
                    q: 'Can I get a refund?',
                    a: 'Refund policies vary by property owner. Please check the specific terms and conditions before booking.'
                }
            ]
        }
    ];

    const toggleFAQ = (categoryIndex, questionIndex) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setOpenFAQ(openFAQ === key ? null : key);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
                    <p className="text-xl text-gray-600">Find answers to common questions about PGFinder</p>
                </div>

                <div className="space-y-8">
                    {faqs.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="bg-primary-dark text-white px-6 py-4">
                                <h2 className="text-xl font-bold">{category.category}</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {category.questions.map((faq, questionIndex) => {
                                    const isOpen = openFAQ === `${categoryIndex}-${questionIndex}`;
                                    return (
                                        <div key={questionIndex}>
                                            <button
                                                onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                                                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                                            >
                                                <span className="font-medium text-gray-900">{faq.q}</span>
                                                {isOpen ? (
                                                    <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                                                ) : (
                                                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                                )}
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-4">
                                                    <p className="text-gray-700">{faq.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="bg-gradient-to-r from-primary-dark to-blue-600 rounded-2xl text-white p-8 text-center mt-12">
                    <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
                    <p className="mb-6">Our support team is here to help you 24/7</p>
                    <Link to="/contact" className="bg-white text-primary-dark px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                        Contact Support
                    </Link>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default FAQ;