import React from 'react';

const DecarbonizationBrief = ({ results, mineName, baselineYear, energyMix, opScale, targetNeutrality }) => {
  if (!results) return null;

  return (
    <div className="mt-12 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 p-6 md:p-8 shadow-lg">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Zerith Decarbonization Brief
        </h2>
        <p className="text-base md:text-lg text-gray-600 font-medium">
          {mineName || 'Indian Coal Mine'} • {baselineYear || 'N/A'}
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Target: {targetNeutrality}% Carbon Neutrality
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Emissions</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {((results.totalEmissions || 0) / 1000).toFixed(2)} tCO₂e
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Operational Scale</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{opScale}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">Energy Mix</p>
              <p className="text-sm md:text-base font-semibold text-gray-900 truncate">{energyMix}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center ml-2">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8">
        {/* Current Emission Overview */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-orange-600 font-bold text-sm">1</span>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-800">Current Emission Overview</h3>
          </div>
          <div className="pl-11">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-gray-700">
                  Estimated CO₂ emissions: <span className="font-semibold text-orange-600">
                    {((results.totalEmissions || 0) / 1000).toFixed(2)} tCO₂e
                  </span> (baseline year {baselineYear || 'N/A'}).
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-gray-700">
                  Key sources: Excavation, transportation, equipment energy, fuel use; energy/resource mix reported as: <span className="font-semibold text-orange-600">{energyMix}</span>.
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-gray-700">
                  Operational scale: <span className="font-semibold text-orange-600">{opScale}</span>; target neutrality: <span className="font-semibold text-orange-600">{targetNeutrality}%</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Solutions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold text-sm">2</span>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-800">Recommended Decarbonization Solutions</h3>
          </div>
          <div className="pl-11">
            <div className="space-y-4">
              {targetNeutrality <= 25 && (
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <h4 className="font-semibold text-blue-800 mb-2">Focus on energy efficiency and process optimisation:</h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Variable Frequency Drives (VFDs) on conveyors, pumps and fans (5–12% savings).
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      High-efficiency motors (IE3/IE4) and preventive maintenance analytics (2–5%).
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Optimised haulage scheduling and tyre pressure management for diesel fleets (3–8%).
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Compressed-air leakage reduction and pressure optimisation (5–10%).
                    </li>
                  </ul>
                </div>
              )}
              
              {targetNeutrality > 25 && targetNeutrality <= 50 && (
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                  <h4 className="font-semibold text-green-800 mb-2">Efficiency + Renewable integration:</h4>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      On-site solar PV (ground/rooftop) with hybrid inverters; 15–30% grid displacement.
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      PPA/utility-scale solar/wind mix for 25–50% renewable share.
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Battery energy storage for peak shaving and diesel offset in remote ops.
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Waste heat recovery on compressors and ventilation systems (2–5%).
                    </li>
                  </ul>
                </div>
              )}
              
              {targetNeutrality > 50 && targetNeutrality <= 75 && (
                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
                  <h4 className="font-semibold text-purple-800 mb-2">Clean technology transitions:</h4>
                  <ul className="space-y-2 text-sm text-purple-700">
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Electric or hybrid mining fleets (LD/HMD), trolley-assist where feasible (10–25%).
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Methane drainage/capture and flaring/usage for power; VAM oxidation.
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Bulk material handling electrification; high-efficiency ventilation on demand.
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Green diesel/HVO pilots for critical ICE applications.
                    </li>
                  </ul>
                </div>
              )}
              
              {targetNeutrality > 75 && (
                <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-400">
                  <h4 className="font-semibold text-indigo-800 mb-2">Deep decarbonisation + offsets:</h4>
                  <ul className="space-y-2 text-sm text-indigo-700">
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Post-combustion carbon capture for boilers/compressors; CO₂ utilisation where viable.
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Afforestation/reforestation programs on reclaimed land; biodiversity corridors.
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      High-quality offsets (Verra/Gold Standard) for residual emissions.
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Mine closure methane management and long-term MRV.
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Implementation Roadmap */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-indigo-600 font-bold text-sm">3</span>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-800">Implementation Roadmap</h3>
          </div>
          <div className="pl-11">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-gray-800">Year 1</p>
                  <p className="text-gray-600 text-sm">Detailed energy audit, MRV setup, quick-win efficiency (VFDs, leaks), RE siting.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-gray-800">Years 2–3</p>
                  <p className="text-gray-600 text-sm">Commission 25–50% RE via on-site/PPA; pilot fleet electrification; methane capture.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-gray-800">Years 3–5</p>
                  <p className="text-gray-600 text-sm">Scale clean fleets, ventilation-on-demand; introduce storage; expand CBM/VAM usage.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-gray-800">Years 5+</p>
                  <p className="text-gray-600 text-sm">CCUS for residual point sources; afforestation and verified offsets for remainder.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Outcomes */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold text-sm">4</span>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-800">Expected Carbon Reduction Outcome</h3>
          </div>
          <div className="pl-11">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Target Reduction</p>
                <p className="text-2xl font-bold text-green-600">
                  {((Number(results.totalEmissions || 0) / 1000) * (targetNeutrality / 100)).toFixed(2)} tCO₂e/year
                </p>
                <p className="text-sm text-gray-500">to meet {targetNeutrality}% neutrality</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Coverage Strategy</p>
                <p className="text-lg font-semibold text-blue-600">
                  {Math.min(75, targetNeutrality)}% in-operations
                </p>
                <p className="text-sm text-gray-500">balance via CCUS/offsets</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generated by Zerith AI • {new Date().toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-4">
            <span>IPCC Guidelines</span>
            <span>•</span>
            <span>GHG Protocol</span>
            <span>•</span>
            <span>India NDCs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecarbonizationBrief;
