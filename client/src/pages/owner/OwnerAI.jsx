import { useState, useEffect } from 'react';
import { CpuChipIcon, ChartBarIcon, CurrencyRupeeIcon, UserGroupIcon, WrenchScrewdriverIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../../config/api';
import usePageTitle from '../../hooks/usePageTitle';

const OwnerAI = () => {
  usePageTitle('AI & Automation');
  
  const [activeTab, setActiveTab] = useState('pricing');
  const [loading, setLoading] = useState(false);
  const [pricingData, setPricingData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [screeningData, setScreeningData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.OWNER}/properties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setProperties(data.properties || []);
      if (data.properties?.length > 0) {
        setSelectedProperty(data.properties[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

  const fetchPricingRecommendation = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.AI}/pricing/${selectedProperty}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPricingData(data.recommendation);
    } catch (error) {
      console.error('Failed to fetch pricing recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (type) => {
    if (!selectedProperty) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.AI}/forecast/${type}/${selectedProperty}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setForecastData(data.forecast);
    } catch (error) {
      console.error(`Failed to fetch ${type} forecast:`, error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenancePrediction = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.AI}/maintenance/${selectedProperty}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMaintenanceData(data.predictions);
    } catch (error) {
      console.error('Failed to fetch maintenance prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const screenTenant = async () => {
    const sampleTenantData = {
      name: 'John Doe',
      age: 25,
      monthlyIncome: 50000,
      expectedRent: 15000,
      employmentType: 'permanent',
      references: ['Reference 1', 'Reference 2']
    };

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.AI}/screen-tenant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(sampleTenantData)
      });
      const data = await response.json();
      setScreeningData(data.screening);
    } catch (error) {
      console.error('Failed to screen tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'pricing', name: 'Smart Pricing', icon: CurrencyRupeeIcon },
    { id: 'forecast', name: 'Predictive Analytics', icon: ChartBarIcon },
    { id: 'maintenance', name: 'Smart Maintenance', icon: WrenchScrewdriverIcon },
    { id: 'screening', name: 'Tenant Screening', icon: UserGroupIcon }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI & Automation
          </h1>
          <p className="text-gray-600 mt-2">Intelligent insights and automated solutions for your properties</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Property</option>
            {properties.map((property) => (
              <option key={property._id} value={property._id}>
                {property.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Smart Pricing Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Pricing Recommendations</h3>
              <button
                onClick={fetchPricingRecommendation}
                disabled={loading || !selectedProperty}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Analyzing...' : 'Get Recommendation'}
              </button>
            </div>

            {pricingData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Current vs Recommended Price</h4>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Current Price</p>
                        <p className="text-2xl font-bold text-gray-900">₹{pricingData.currentPrice?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Recommended Price</p>
                        <p className="text-2xl font-bold text-green-600">₹{pricingData.recommendedPrice?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Market Factors</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Demand:</span>
                      <span className="font-semibold capitalize">{pricingData.factors?.marketDemand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupancy Rate:</span>
                      <span className="font-semibold">{(pricingData.factors?.occupancyRate * 100)?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Seasonal Factor:</span>
                      <span className="font-semibold">{pricingData.factors?.seasonalFactor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-semibold">{(pricingData.confidence * 100)?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Predictive Analytics Tab */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Occupancy Forecast</h3>
                <button
                  onClick={() => fetchForecast('occupancy')}
                  disabled={loading || !selectedProperty}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Generate
                </button>
              </div>
              
              {forecastData && (
                <div className="space-y-3">
                  {forecastData.predictions?.slice(0, 6).map((prediction, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{prediction.period}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{(prediction.value * 100).toFixed(1)}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${prediction.value * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Forecast</h3>
                <button
                  onClick={() => fetchForecast('revenue')}
                  disabled={loading || !selectedProperty}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Generate
                </button>
              </div>
              
              {forecastData && (
                <div className="space-y-3">
                  {forecastData.predictions?.slice(0, 6).map((prediction, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{prediction.period}</span>
                      <span className="font-semibold text-green-600">₹{prediction.value?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Smart Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Predictive Maintenance Alerts</h3>
              <button
                onClick={fetchMaintenancePrediction}
                disabled={loading || !selectedProperty}
                className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Analyzing...' : 'Predict Maintenance'}
              </button>
            </div>

            {maintenanceData && (
              <div className="space-y-4">
                {maintenanceData.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.item}</h4>
                        <p className="text-sm text-gray-600">Expected in {item.timeframe}</p>
                        <p className="text-sm text-gray-600">Estimated Cost: ₹{item.estimatedCost?.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.priority === 'High' ? 'bg-red-100 text-red-800' :
                          item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.priority} Priority
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{(item.probability * 100).toFixed(0)}% probability</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tenant Screening Tab */}
      {activeTab === 'screening' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">AI Tenant Screening</h3>
              <button
                onClick={screenTenant}
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Screening...' : 'Screen Sample Tenant'}
              </button>
            </div>

            {screeningData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Screening Results</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tenant Score:</span>
                        <span className="font-bold text-2xl text-purple-600">{screeningData.score}/200</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Risk Level:</span>
                        <span className={`font-semibold ${
                          screeningData.riskLevel === 'Low' ? 'text-green-600' :
                          screeningData.riskLevel === 'Medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {screeningData.riskLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-semibold">{(screeningData.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Recommendation</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {screeningData.recommendation}
                  </p>
                  
                  {screeningData.riskFactors?.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Risk Factors:</h5>
                      <ul className="text-sm text-red-600 space-y-1">
                        {screeningData.riskFactors.map((factor, index) => (
                          <li key={index}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerAI;