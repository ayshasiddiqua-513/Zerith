import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DoughnutChart from '../components/DoughnutChart';
import DecarbonizationBrief from '../components/DecarbonizationBrief';

const Analysis = () => {
  const [formData, setFormData] = useState({
    excavation: '',
    transportation: '',
    fuel: '',
    equipment: '',
    workers: '',
    fuelType: '',
    reduction: '',
    output: ''
  });

  const [indianFormData, setIndianFormData] = useState({
    coal_production_tons: '',
    energy_consumption_mwh: '',
    methane_emissions_tons: '',
    other_ghg_emissions_tons: ''
  });

  const [results, setResults] = useState(null);
  const [indianResults, setIndianResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useIndianCalculation, setUseIndianCalculation] = useState(false);
  const [indianRegion, setIndianRegion] = useState('jharkhand');
  const formRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleIndianFormChange = (e) => {
    setIndianFormData({
      ...indianFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (useIndianCalculation) {
        const response = await axios.post('http://127.0.0.1:8000/estimate_indian', {
          year: 2024,
          coal_production_tons: parseFloat(indianFormData.coal_production_tons),
          energy_consumption_mwh: parseFloat(indianFormData.energy_consumption_mwh),
          methane_emissions_tons: parseFloat(indianFormData.methane_emissions_tons) || 0,
          other_ghg_emissions_tons: parseFloat(indianFormData.other_ghg_emissions_tons) || 0,
          region: indianRegion
        });
        setIndianResults(response.data);
      } else {
        const response = await axios.post('http://127.0.0.1:8000/calculate', {
          year: 2024,
          excavation: parseFloat(formData.excavation),
          transportation: parseFloat(formData.transportation),
          fuel: parseFloat(formData.fuel),
          equipment: parseFloat(formData.equipment),
          workers: parseFloat(formData.workers),
          fuelType: formData.fuelType,
          reduction: parseFloat(formData.reduction),
          output: parseFloat(formData.output)
        });
        setResults(response.data);
      }
    } catch (error) {
      console.error('Error calculating emissions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Carbon Emission Analysis</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive analysis of your mining operation's carbon footprint with Indian-specific calculations
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!results && !indianResults ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Emission Estimation</h2>
                  <p className="text-green-100 mt-1">Enter your mining operation parameters to calculate carbon emissions</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Indian-Specific Toggle */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    🇮🇳 Indian Coal Mining Mode
                  </h3>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={useIndianCalculation}
                        onChange={(e) => setUseIndianCalculation(e.target.checked)}
                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Use Indian-specific calculation (IPCC guidelines + regional factors)
                      </span>
                    </label>
                  </div>
                  {useIndianCalculation && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Indian Coal Mining Region</label>
                        <select 
                          value={indianRegion} 
                          onChange={(e)=>setIndianRegion(e.target.value)} 
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        >
                          <option value="jharkhand">Jharkhand (2000 kg CO₂/ton)</option>
                          <option value="chhattisgarh">Chhattisgarh (1950 kg CO₂/ton)</option>
                          <option value="odisha">Odisha (2100 kg CO₂/ton)</option>
                          <option value="west_bengal">West Bengal (2050 kg CO₂/ton)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Grid Emission Factor</label>
                        <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                          0.82 tCO₂/MWh (India's current grid factor)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Indian-Specific Form Fields */}
                {useIndianCalculation && (
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      🇮🇳 Indian Coal Mining Parameters (IPCC Guidelines)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Coal Production (tons)</label>
                        <input
                          type="number"
                          name="coal_production_tons"
                          value={indianFormData.coal_production_tons}
                          onChange={handleIndianFormChange}
                          required
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          placeholder="Enter coal production in tons"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Energy Consumption (MWh)</label>
                        <input
                          type="number"
                          name="energy_consumption_mwh"
                          value={indianFormData.energy_consumption_mwh}
                          onChange={handleIndianFormChange}
                          required
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          placeholder="Enter energy consumption in MWh"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Methane Emissions (tons)</label>
                        <input
                          type="number"
                          name="methane_emissions_tons"
                          value={indianFormData.methane_emissions_tons}
                          onChange={handleIndianFormChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          placeholder="Enter methane emissions (optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Other GHG Emissions (tons)</label>
                        <input
                          type="number"
                          name="other_ghg_emissions_tons"
                          value={indianFormData.other_ghg_emissions_tons}
                          onChange={handleIndianFormChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          placeholder="Enter other GHG emissions (optional)"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Legacy Form Fields */}
                {!useIndianCalculation && (
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Legacy Operational Parameters
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Excavation (tons)</label>
                        <input
                          type="number"
                          name="excavation"
                          value={formData.excavation}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          placeholder="Enter excavation amount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transportation (km)</label>
                        <input
                          type="number"
                          name="transportation"
                          value={formData.transportation}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          placeholder="Enter transportation distance"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Consumption (liters)</label>
                        <input
                          type="number"
                          name="fuel"
                          value={formData.fuel}
                          required
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          placeholder="Enter fuel consumption"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Usage (hours)</label>
                        <input
                          type="number"
                          name="equipment"
                          value={formData.equipment}
                          required
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          placeholder="Enter equipment hours"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Workers</label>
                        <input
                          type="number"
                          name="workers"
                          value={formData.workers}
                          required
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          placeholder="Enter worker count"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                        <select
                          name="fuelType"
                          value={formData.fuelType}
                          required
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        >
                          <option value="">Select Fuel Type</option>
                          <option value="coal">Coal</option>
                          <option value="oil">Oil</option>
                          <option value="naturalGas">Natural Gas</option>
                          <option value="biomass">Biomass</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Emissions after Mitigation</label>
                        <input
                          type="number"
                          name="reduction"
                          value={formData.reduction}
                          required
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          placeholder="Enter reduced emissions"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Annual Coal Production (tons)</label>
                        <input
                          type="number"
                          name="output"
                          value={formData.output}
                          required
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          placeholder="Enter annual production"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 px-8 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {loading ? 'Calculating...' : 'Calculate Emissions'}
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div ref={formRef} className="space-y-8">
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Emission Estimation Results</h2>
                    <p className="text-green-100 mt-1">Comprehensive analysis of your mining operation's carbon footprint</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Indian-Specific Results */}
                {useIndianCalculation && indianResults && (
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4 rounded-xl mb-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-xl">🇮🇳</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Indian Coal Mining Analysis</h3>
                          <p className="text-red-100 text-sm">IPCC Guidelines Implementation for {indianRegion.charAt(0).toUpperCase() + indianRegion.slice(1)} Region</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Total Emissions</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">CO₂ Equivalent:</span>
                            <span className="font-bold text-gray-900">{(indianResults.total_emissions_tco2e ?? 0).toFixed(2)} tCO₂e</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Emission Level:</span>
                            <span className={`font-bold px-2 py-1 rounded text-xs ${
                              indianResults.emission_level === 'high' ? 'bg-red-100 text-red-800' :
                              indianResults.emission_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {indianResults.emission_level?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Regional Factor</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Region:</span>
                            <span className="font-bold text-gray-900">{indianResults.region?.charAt(0).toUpperCase() + indianResults.region?.slice(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Emission Factor:</span>
                            <span className="font-bold text-gray-900">{(indianResults.regional_emission_factor_kgco2_perton ?? 0).toFixed(0)} kg CO₂/ton</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Grid Factor</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Indian Grid:</span>
                            <span className="font-bold text-gray-900">{(indianResults.indian_grid_factor_tco2_per_mwh ?? 0).toFixed(2)} tCO₂/MWh</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Year:</span>
                            <span className="font-bold text-gray-900">{indianResults.year}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Policy Alignment</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">NDC Target:</span>
                            <span className="font-bold text-gray-900">Net Zero 2070</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Renewable:</span>
                            <span className="font-bold text-gray-900">500 GW by 2030</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Emission Distribution Chart</h4>
                      <div className="h-80 w-full">
                        <DoughnutChart data={indianResults} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Legacy Results */}
                {!useIndianCalculation && results && (
                  <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Excavation</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Amount:</span>
                            <span className="font-bold text-gray-900">{results.excavation?.toFixed(2)} tons</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Emissions:</span>
                            <span className="font-bold text-gray-900">{results.excavation_emissions?.toFixed(2)} tCO₂e</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Transportation</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Distance:</span>
                            <span className="font-bold text-gray-900">{results.transportation?.toFixed(2)} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Emissions:</span>
                            <span className="font-bold text-gray-900">{results.transportation_emissions?.toFixed(2)} tCO₂e</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Fuel Consumption</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Amount:</span>
                            <span className="font-bold text-gray-900">{results.fuel?.toFixed(2)} liters</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Emissions:</span>
                            <span className="font-bold text-gray-900">{results.fuel_emissions?.toFixed(2)} tCO₂e</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Total Emissions</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">CO₂ Equivalent:</span>
                            <span className="font-bold text-gray-900">{results.total_emissions?.toFixed(2)} tCO₂e</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">After Mitigation:</span>
                            <span className="font-bold text-gray-900">{results.reduction?.toFixed(2)} tCO₂e</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Emission Distribution Chart</h4>
                      <div className="h-80 w-full">
                        <DoughnutChart data={results} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Next Steps</h3>
                    <p className="text-gray-600">Explore recommendations and view detailed reports</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/recommendations">
                      <button className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        View Recommendations
                      </button>
                    </Link>
                    <Link to="/view">
                      <button className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View All Reports
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
