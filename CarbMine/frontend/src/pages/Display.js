import React from 'react';

// Updated constants
const EXCAVATION_FACTOR = 94.6; // kg CO2 per ton of coal mined
const TRANSPORTATION_FACTOR = 74.1; // kg CO2 per ton per km (for diesel-powered transportation)
const EQUIPMENT_FACTOR = 73.3; // kg CO2 per hour of equipment operation
const EV_CONSTANT = 0.20;
const GREEN_FUEL_CONSTANT = 0.50;
const SEQUESTRATION_RATE = 2.2;
const ELECTRICITY_REDUCTION_RATE = 0.3;

const CalculationsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Zerith Project Calculations
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Comprehensive methodology and formulas used in the Zerith carbon management platform, 
              detailing emission calculations, neutralization strategies, and carbon credit generation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

            {/* Section 1: Emission Calculations */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 px-8 py-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Emission Calculations</h2>
                  <p className="text-red-100 mt-1">Comprehensive emission analysis across all operational activities</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our platform calculates emissions across all mining activities including excavation, transportation, 
                fuel consumption, and equipment usage. Each calculation uses industry-standard emission factors 
                and follows IPCC guidelines for accuracy and compliance.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Excavation Emissions */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Excavation Emissions</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Formula</div>
                    <code className="text-lg font-mono bg-gray-100 px-3 py-2 rounded block">
                      E = A × {EXCAVATION_FACTOR}
                    </code>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">E:</span> Total excavation emissions (kg CO₂)
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">A:</span> Amount of excavation material (tons)
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Factor:</span> {EXCAVATION_FACTOR} kg CO₂ per ton
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800">
                      <strong>Methodology:</strong> Calculates emissions from material excavation using IPCC emission factors 
                      for mining operations, ensuring compliance with international standards.
                    </p>
                  </div>
                </div>

                {/* Transportation Emissions */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Transportation Emissions</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Formula</div>
                    <code className="text-lg font-mono bg-gray-100 px-3 py-2 rounded block">
                      T = C × D × F
                    </code>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">T:</span> Total transportation emissions (kg CO₂)
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">C:</span> Distance traveled (km)
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">D:</span> Emission factor ({TRANSPORTATION_FACTOR} kg CO₂/km)
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">F:</span> Fuel consumption factor
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800">
                      <strong>Methodology:</strong> Calculates emissions from vehicle transportation considering distance, 
                      fuel efficiency, and vehicle type using standardized emission factors.
                    </p>
                  </div>
                </div>

                {/* Fuel Consumption Emissions */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Fuel Consumption Emissions</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Formula</div>
                    <code className="text-lg font-mono bg-gray-100 px-3 py-2 rounded block">
                      F = E × {GREEN_FUEL_CONSTANT}
                    </code>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">F:</span> Total fuel emissions (kg CO₂)
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">E:</span> Fuel consumed (liters)
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Factor:</span> {GREEN_FUEL_CONSTANT} kg CO₂ per liter
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                    <p className="text-sm text-orange-800">
                      <strong>Methodology:</strong> Calculates emissions from fuel consumption using carbon content 
                      and combustion efficiency factors for different fuel types.
                    </p>
                  </div>
                </div>

                {/* Equipment Usage Emissions */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Equipment Usage Emissions</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Formula</div>
                    <code className="text-lg font-mono bg-gray-100 px-3 py-2 rounded block">
                      G = H × {EQUIPMENT_FACTOR}
                    </code>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">G:</span> Total equipment emissions (kg CO₂)
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">H:</span> Equipment operating hours
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Factor:</span> {EQUIPMENT_FACTOR} kg CO₂ per hour
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                    <p className="text-sm text-purple-800">
                      <strong>Methodology:</strong> Calculates emissions from heavy machinery and equipment operation 
                      based on usage hours and equipment-specific emission factors.
                    </p>
                  </div>
                </div>
              </div>
                </div>
              </div>
            </section>

            {/* Section 2: Total Emissions Calculation */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Total Emissions Calculation</h2>
                  <p className="text-green-100 mt-1">Aggregated carbon footprint across all operational activities</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                The total carbon footprint is calculated by aggregating emissions from all operational activities. 
                This comprehensive approach ensures accurate measurement of your mining operation's environmental impact.
              </p>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Total Emissions Formula</h3>
                </div>
                
                <div className="bg-white rounded-lg p-6 mb-6">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-3">Master Formula</div>
                    <code className="text-2xl font-mono bg-gray-100 px-6 py-4 rounded-lg block">
                      Total Emissions = E + T + F + G
                    </code>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">E</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">Excavation</div>
                    <div className="text-xs text-gray-600">Emissions</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">T</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">Transportation</div>
                    <div className="text-xs text-gray-600">Emissions</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">F</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">Fuel</div>
                    <div className="text-xs text-gray-600">Consumption</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">G</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">Equipment</div>
                    <div className="text-xs text-gray-600">Usage</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-800">
                    <strong>Methodology:</strong> This comprehensive formula consolidates all individual emission sources 
                    to provide a complete picture of your operation's carbon footprint, enabling accurate environmental 
                    impact assessment and reporting.
                  </p>
                </div>
              </div>
            </div>
              </div>
            </section>

            {/* Section 3: Neutralization Strategies */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Neutralization Strategies</h2>
                  <p className="text-blue-100 mt-1">Sustainable solutions to reduce and offset carbon emissions</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our platform provides comprehensive strategies to neutralize emissions through electric vehicles, 
                green fuels, afforestation, and renewable energy solutions.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* EV Reduction */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Electric Vehicle Reduction</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Formula</div>
                    <code className="text-lg font-mono bg-gray-100 px-3 py-2 rounded block">
                      EV Reduction = E × {EV_CONSTANT}
                    </code>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">EV Reduction:</span> Emissions reduction (kg CO₂)
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">E:</span> Total transportation emissions
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">EV Constant:</span> {EV_CONSTANT} reduction rate
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800">
                      <strong>Methodology:</strong> Calculates emissions reduction achieved by transitioning 
                      to electric vehicles, using industry-standard efficiency factors.
                    </p>
                  </div>
                </div>

                {/* Green Fuel Reduction */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Green Fuel Reduction</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Formula</div>
                    <code className="text-lg font-mono bg-gray-100 px-3 py-2 rounded block">
                      Green Fuel Reduction = F × {GREEN_FUEL_CONSTANT}
                    </code>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Green Fuel Reduction:</span> Emissions reduction (kg CO₂)
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">F:</span> Total fuel consumption emissions
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Green Fuel Constant:</span> {GREEN_FUEL_CONSTANT} reduction rate
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <p className="text-sm text-green-800">
                      <strong>Methodology:</strong> Measures emissions reduction achieved by using 
                      sustainable fuel alternatives and renewable energy sources.
                    </p>
                  </div>
                </div>

                {/* Afforestation */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Afforestation</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Formula</div>
                    <code className="text-lg font-mono bg-gray-100 px-3 py-2 rounded block">
                      Afforestation = E × {SEQUESTRATION_RATE}
                    </code>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Afforestation:</span> CO₂ absorbed (tons CO₂)
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">E:</span> Total emissions
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Sequestration Rate:</span> {SEQUESTRATION_RATE} tons CO₂ per ton
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-400">
                    <p className="text-sm text-emerald-800">
                      <strong>Methodology:</strong> Calculates CO₂ absorption through afforestation projects 
                      using verified carbon sequestration rates and land area calculations.
                    </p>
                  </div>
                </div>

                {/* Renewable Energy Reduction */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Renewable Energy Reduction</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Formula</div>
                    <code className="text-lg font-mono bg-gray-100 px-3 py-2 rounded block">
                      Renewable Energy Reduction = E × {ELECTRICITY_REDUCTION_RATE}
                    </code>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Renewable Energy Reduction:</span> Emissions reduction (kg CO₂)
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">E:</span> Total emissions
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Electricity Reduction Rate:</span> {ELECTRICITY_REDUCTION_RATE} reduction rate
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-sm text-yellow-800">
                      <strong>Methodology:</strong> Calculates emissions reduction achieved through 
                      renewable energy adoption and energy efficiency improvements.
                    </p>
                  </div>
                </div>
              </div>
                </div>
              </div>
            </section>

        {/* Section 4: Carbon Credits */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Carbon Credits</h2>
                  <p className="text-purple-100 mt-1">Monetization and valuation of carbon reduction efforts</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Carbon credits represent verified emission reductions that can be traded in carbon markets. 
                Our platform calculates the monetary value of your sustainability efforts.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Carbon Credits Calculation */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Carbon Credits</h3>
                </div>

                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Formula</div>
                    <code className="text-lg font-mono bg-gray-100 px-3 py-2 rounded block">
                      Carbon Credits = Baseline - Reduced
                    </code>
                </div>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Carbon Credits:</span> Earned credits (tons CO₂)
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Baseline:</span> Emissions without reduction measures
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Reduced:</span> Emissions after reduction measures
                      </div>
                    </div>
                </div>

                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                    <p className="text-sm text-purple-800">
                      <strong>Methodology:</strong> Calculates carbon credits by comparing baseline emissions 
                      with reduced emissions after implementing sustainability measures.
                    </p>
                  </div>
                </div>

                {/* Carbon Credit Worth */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Carbon Credit Worth</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Formula</div>
                    <code className="text-lg font-mono bg-gray-100 px-3 py-2 rounded block">
                      Worth = Carbon Credits × Cost per CC
                    </code>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Worth:</span> Monetary value of credits
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Carbon Credits:</span> Number of credits earned
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">Cost per CC:</span> Market price per credit
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <p className="text-sm text-green-800">
                      <strong>Methodology:</strong> Calculates the financial value of carbon credits 
                      based on current market prices and verified emission reductions.
                    </p>
                  </div>
                </div>
              </div>
                </div>
              </div>
            </section>

            {/* References Section */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">References & Sources</h2>
                  <p className="text-gray-200 mt-1">Scientific literature and industry standards</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our calculations are based on internationally recognized standards and scientific literature 
                to ensure accuracy, compliance, and credibility in carbon management.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reference 1 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">IPCC Guidelines 2006/2019</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        National Greenhouse Gas Inventories methodology for emission calculations.
                      </p>
                      <a href="https://www.ipcc-nggip.iges.or.jp/public/2006gl/" 
                         className="text-blue-600 hover:text-blue-800 text-sm font-medium" 
                      target="_blank"
                         rel="noopener noreferrer">
                        View Guidelines →
                      </a>
                    </div>
                  </div>
                </div>

                {/* Reference 2 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">IEA Global EV Outlook 2023</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Electric vehicle emission reduction factors and efficiency data.
                      </p>
                    <a href="https://www.iea.org/reports/global-ev-outlook-2023"
                         className="text-green-600 hover:text-green-800 text-sm font-medium" 
                      target="_blank"
                         rel="noopener noreferrer">
                        View Report →
                      </a>
                    </div>
                  </div>
                </div>

                {/* Reference 3 */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">EPA Vehicle Emissions</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Greenhouse gas emissions from passenger vehicles and fuel consumption.
                      </p>
                    <a href="https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle"
                         className="text-orange-600 hover:text-orange-800 text-sm font-medium" 
                      target="_blank"
                         rel="noopener noreferrer">
                        View Data →
                      </a>
                    </div>
                  </div>
                </div>

                {/* Reference 4 */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">IPCC Climate Change & Land</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Afforestation sequestration rates and carbon capture methodologies.
                      </p>
                    <a href="https://www.ipcc.ch/srccl/"
                         className="text-purple-600 hover:text-purple-800 text-sm font-medium" 
                      target="_blank"
                         rel="noopener noreferrer">
                        View Report →
                      </a>
                    </div>
                  </div>
                </div>
                </div>
                </div>
              </div>
            </section>
          </div>
        </div>
  );
};

export default CalculationsPage;