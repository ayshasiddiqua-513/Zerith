import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useFirebase } from '../context/Firebase';
import api from '../api';
import { Link } from 'react-router-dom';
import DoughnutChart from '../components/DoughnutChart';
import Footer from '../components/Footer';
import NeutralizationChart from '../components/NeutralizationChart';
import DecarbonizationBrief from '../components/DecarbonizationBrief';

function Analysis() {
  // Base parameters for estimation
  const [formData, setFormData] = useState({
    excavation: '',
    transportation: '',
    fuel: '',
    equipment: '',
    workers: '',
    output: '',
    annualcoal: '',
    fuelType: '',
    reduction: ''
  });
  const [mineName, setMineName] = useState('');
  const [baselineYear, setBaselineYear] = useState('');
  const [energyMix, setEnergyMix] = useState('Coal, grid electricity, diesel');
  const [opScale, setOpScale] = useState('Medium');
  const [targetNeutrality, setTargetNeutrality] = useState(50);

  // Indian-specific state
  const [indianRegion, setIndianRegion] = useState('jharkhand');
  const [useIndianCalculation, setUseIndianCalculation] = useState(false);
  const [indianFormData, setIndianFormData] = useState({
    year: new Date().getFullYear(),
    coal_production_tons: '',
    energy_consumption_mwh: '',
    methane_emissions_tons: '',
    other_ghg_emissions_tons: ''
  });

  const [results, setResults] = useState(null);
  const [indianResults, setIndianResults] = useState(null);
  const formRef = useRef();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIndianFormChange = (e) => {
    setIndianFormData({ ...indianFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (useIndianCalculation) {
      // Validate required fields
      if (!indianFormData.coal_production_tons || !indianFormData.energy_consumption_mwh) {
        alert('Please fill in Coal Production and Energy Consumption fields');
        return;
      }
      
      // Convert empty strings to 0 for numeric fields
      const processedData = {
        year: parseInt(indianFormData.year) || new Date().getFullYear(),
        coal_production_tons: parseFloat(indianFormData.coal_production_tons) || 0,
        energy_consumption_mwh: parseFloat(indianFormData.energy_consumption_mwh) || 0,
        methane_emissions_tons: parseFloat(indianFormData.methane_emissions_tons) || 0,
        other_ghg_emissions_tons: parseFloat(indianFormData.other_ghg_emissions_tons) || 0,
        region: indianRegion
      };
      
      try {
        const { data } = await api.post('/estimate_indian', processedData);
        setIndianResults(data);
      } catch (error) {
        console.error('Error submitting Indian calculation:', error);
        console.error('Error details:', error.response?.data);
        console.error('Processed data:', processedData);
        alert(`Error calculating emissions: ${error.response?.data?.detail || error.message}. Please check your input values.`);
      }
    } else {
      try {
    const { data } = await api.post('/calculate', formData);
    setResults(data);
      } catch (error) {
        console.error('Error submitting legacy calculation:', error);
        alert('Error calculating emissions. Please check your input values.');
      }
    }
  };

  // Neutralisation Pathways states
  const [neutralisationResults, setNeutralisationResults] = useState(null);
  const [evConversionPercentage, setEvConversionPercentage] = useState(100);
  const [neutralizePercentage, setNeutralizePercentage] = useState(100);
  const [greenFuelPercentage, setGreenFuelPercentage] = useState(100);

  // Fetch function for Neutralisation Pathways 
  const handleNeutralise = async () => {
    if (!results) {
      return;
    }
    const { data } = await api.post('/neutralise', {
      green_fuel_percentage: greenFuelPercentage,
      neutralise_percentage: neutralizePercentage,
      ev_transportation_percentage: evConversionPercentage,
      emissions: results?.totalEmissions || 0,
      transportation: formData.transportation,
      fuel: formData.fuel,
    });
    setNeutralisationResults(data);
  };

  // Handles change in slider values
  useEffect(() => {
    if (results) {
      console.log("Results: ", results);
      handleNeutralise();
    }
  }, [evConversionPercentage, neutralizePercentage, greenFuelPercentage, results]);

  // PDF upload handling section
  const { uploadPDFToFirebase } = useFirebase();

  const handleGenerateAndStorePDF = async () => {
    if (!formRef.current) {
      alert("No content available to export as PDF.");
      return;
    }
  
    // Hide PDF/button overlays so they don't appear in screenshot
    const buttons = document.querySelectorAll('button');
    const prevDisplay = [];
    buttons.forEach((b, i) => { prevDisplay[i] = b.style.display; b.style.display = 'none'; });
  
    try {
      // Ensure fonts are loaded (prevents blank text)
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
  
      // If charts are Chart.js canvases, grab their dataURLs and add to PDF separately
      const chartCanvases = formRef.current.querySelectorAll('canvas');
      const canvasImages = [];
      chartCanvases.forEach((c) => {
        try {
          canvasImages.push(c.toDataURL('image/png'));
        } catch (err) {
          console.warn('Could not read chart canvas toDataURL:', err);
        }
      });
  
      // Capture with html2canvas (safe options)
      const canvas = await html2canvas(formRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: true,
      });
  
      console.log('Captured canvas size:', canvas.width, canvas.height);
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
  
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
  
      // Convert px -> mm using ratio from jsPDF internals
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      let positionY = 0;
      let remainingHeight = imgHeight;
  
      // Add first/primary image, split across pages if needed
      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'JPEG', 0, positionY, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
        if (remainingHeight > 0) {
          pdf.addPage();
          positionY -= pageHeight;
        } else {
          positionY = 0;
        }
      }
  
      // Optional: If chart canvases were extracted separately
      for (const dataUrl of canvasImages) {
        pdf.addPage();
        const img = new Image();
        img.src = dataUrl;
        await new Promise((res) => (img.onload = res));
        const w = pageWidth;
        const h = (img.height * w) / img.width;
        if (h > pageHeight) {
          const scale = pageHeight / h;
          pdf.addImage(dataUrl, 'PNG', 0, 0, w * scale, h * scale);
        } else {
          pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
        }
      }
  
      // Save locally first to confirm generation works
      pdf.save('estimate_debug.pdf');
  
      // Convert to blob and upload
      const pdfBlob = pdf.output('blob');
  
      if (typeof uploadPDFToFirebase !== 'function') {
        console.error('uploadPDFToFirebase not defined or not a function');
      } else {
        const downloadURL = await uploadPDFToFirebase(pdfBlob);
        alert(`PDF generated and stored successfully! View it here: ${downloadURL}`);
      }
  
    } catch (error) {
      console.error('Error generating or storing PDF:', error);
      alert(`There was an error generating the PDF. ${error?.message || ''}`);
    } finally {
      // Restore buttons
      buttons.forEach((b, i) => { b.style.display = prevDisplay[i] || ''; });
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
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Carbon Emission Estimator
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Comprehensive analysis and neutralization pathways for your mining operations.
              Calculate emissions, explore reduction strategies, and achieve carbon neutrality.
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
                  <h2 className="text-2xl font-bold text-white">Emission Calculation Form</h2>
                  <p className="text-green-100 mt-1">Enter your mining operation details to calculate carbon emissions</p>
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
                          onChange={(e) => setIndianRegion(e.target.value)}
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

                {/* Basic Information Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mine Name / Region</label>
                      <input
                        type="text"
                        value={mineName}
                        onChange={(e) => setMineName(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="Enter mine name or region"
                      />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Baseline Year</label>
                      <input
                        type="number"
                        value={baselineYear}
                        onChange={(e) => setBaselineYear(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="2024"
                      />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Operational Scale</label>
                      <select
                        value={opScale}
                        onChange={(e) => setOpScale(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      >
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                  </select>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Neutrality (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={targetNeutrality}
                        onChange={(e) => setTargetNeutrality(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="50"
                      />
                </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Energy & Resource Mix</label>
                      <input
                        type="text"
                        value={energyMix}
                        onChange={(e) => setEnergyMix(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="Coal, grid electricity, diesel"
                      />
                </div>
              </div>
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
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">🇮🇳 Indian Calculation Features:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Regional emission factors: {indianRegion.charAt(0).toUpperCase() + indianRegion.slice(1)} ({indianRegion === 'jharkhand' ? '2000' : indianRegion === 'chhattisgarh' ? '1950' : indianRegion === 'odisha' ? '2100' : '2050'} kg CO₂/ton)</li>
                        <li>• India's grid emission factor: 0.82 tCO₂/MWh</li>
                        <li>• Indian emission scales: High (&gt;500K tCO₂e), Medium (50K-500K tCO₂e), Low (&lt;50K tCO₂e)</li>
                        <li>• Aligned with India's NDC targets and renewable energy goals</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Legacy Form Fields (shown when not using Indian calculation) */}
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
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 px-8 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                Calculate Emissions
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
                      {/* Total Emissions */}
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
                            <span className={`font-bold px-2 py-1 rounded text-xs ${indianResults.emission_level === 'high' ? 'bg-red-100 text-red-800' :
                                indianResults.emission_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                              }`}>
                              {indianResults.emission_level?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Regional Factor */}
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

                      {/* Grid Factor */}
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

                      {/* Indian Policy Alignment */}
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

                    {/* Indian Policy Framework Info */}
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="text-2xl mr-2">🇮🇳</span>
                        India's Decarbonization Framework
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Nationally Determined Contributions (NDCs)</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Net Zero Emissions by 2070</li>
                            <li>• 45% reduction in emission intensity by 2030</li>
                            <li>• 500 GW renewable energy capacity by 2030</li>
                            <li>• 50% electric power from non-fossil sources by 2030</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Regulatory Framework</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Environmental Clearance (EC) requirements</li>
                            <li>• Forest Clearance (FC) compliance</li>
                            <li>• Coal Mines (Special Provisions) Act, 2015</li>
                            <li>• Mines and Minerals (Development and Regulation) Act</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Indian-Specific Neutrality Analysis */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        🇮🇳 Indian Coal Mining Neutrality Analysis
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-gray-800 mb-2">Current Status</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Total Emissions:</span>
                              <span className="font-bold text-gray-900">{(indianResults.total_emissions_tco2e ?? 0).toFixed(2)} tCO₂e</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Emission Level:</span>
                              <span className={`font-bold px-2 py-1 rounded text-xs ${indianResults.emission_level === 'high' ? 'bg-red-100 text-red-800' :
                                  indianResults.emission_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                {indianResults.emission_level?.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">NDC Alignment:</span>
                              <span className="font-bold text-green-600">On Track</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-gray-800 mb-2">Neutrality Targets</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">2030 Target:</span>
                              <span className="font-bold text-blue-600">45% Reduction</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">2070 Target:</span>
                              <span className="font-bold text-green-600">Net Zero</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Renewable Goal:</span>
                              <span className="font-bold text-purple-600">500 GW</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-gray-800 mb-2">Progress Metrics</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Efficiency Score:</span>
                              <span className="font-bold text-green-600">85%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Tech Adoption:</span>
                              <span className="font-bold text-blue-600">72%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Compliance:</span>
                              <span className="font-bold text-green-600">98%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI-Powered Solutions & Recommendations */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                         AI-Powered Solutions & Recommendations
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Smart Mining Technologies */}
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            Smart Mining Technologies
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-800">AI-Powered Excavation</p>
                                <p className="text-sm text-gray-600">Implement autonomous mining equipment with ML algorithms for optimal extraction patterns</p>
                                <span className="text-xs text-green-600 font-semibold">Potential Reduction: 15-25%</span>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-800">Predictive Maintenance</p>
                                <p className="text-sm text-gray-600">IoT sensors and AI models to predict equipment failures and optimize maintenance schedules</p>
                                <span className="text-xs text-green-600 font-semibold">Potential Reduction: 8-12%</span>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-800">Digital Twin Technology</p>
                                <p className="text-sm text-gray-600">Real-time mine simulation for optimizing operations and reducing energy consumption</p>
                                <span className="text-xs text-green-600 font-semibold">Potential Reduction: 10-18%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Advanced Materials & Equipment */}
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            Advanced Materials & Equipment
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-800">High-Efficiency Drills</p>
                                <p className="text-sm text-gray-600">Electric and hybrid drilling equipment with advanced cutting technologies</p>
                                <span className="text-xs text-green-600 font-semibold">Potential Reduction: 20-30%</span>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-800">Lightweight Materials</p>
                                <p className="text-sm text-gray-600">Carbon fiber and composite materials for mining equipment to reduce energy consumption</p>
                                <span className="text-xs text-green-600 font-semibold">Potential Reduction: 12-20%</span>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-800">Smart Conveyor Systems</p>
                                <p className="text-sm text-gray-600">AI-controlled conveyor belts with variable speed and load optimization</p>
                                <span className="text-xs text-green-600 font-semibold">Potential Reduction: 15-25%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Green Transportation Solutions */}
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Green Transportation Solutions
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-800">Electric Haul Trucks</p>
                                <p className="text-sm text-gray-600">Battery-powered heavy-duty trucks for coal transportation within mines</p>
                                <span className="text-xs text-green-600 font-semibold">Potential Reduction: 40-60%</span>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-800">Hydrogen Fuel Cells</p>
                                <p className="text-sm text-gray-600">Clean hydrogen-powered vehicles for zero-emission transportation</p>
                                <span className="text-xs text-green-600 font-semibold">Potential Reduction: 80-95%</span>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-800">Rail Electrification</p>
                                <p className="text-sm text-gray-600">Electric rail systems for long-distance coal transport</p>
                                <span className="text-xs text-green-600 font-semibold">Potential Reduction: 25-35%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Renewable Energy Integration */}
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Renewable Energy Integration
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-800">Solar Mining Operations</p>
                                <p className="text-sm text-gray-600">On-site solar panels to power mining equipment and facilities</p>
                                <span className="text-xs text-green-600 font-semibold">Potential Reduction: 30-50%</span>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-800">Wind Energy Systems</p>
                                <p className="text-sm text-gray-600">Wind turbines for supplementary power generation at mine sites</p>
                                <span className="text-xs text-green-600 font-semibold">Potential Reduction: 15-25%</span>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-800">Energy Storage Systems</p>
                                <p className="text-sm text-gray-600">Battery storage for renewable energy to ensure consistent power supply</p>
                                <span className="text-xs text-green-600 font-semibold">Potential Reduction: 20-30%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Implementation Roadmap */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                         Implementation Roadmap & Timeline
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-gray-800 mb-3 text-blue-600">Phase 1 (0-6 months)</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Energy audit and baseline assessment</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Install IoT sensors and monitoring systems</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Begin renewable energy feasibility study</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Staff training on new technologies</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-gray-800 mb-3 text-green-600">Phase 2 (6-18 months)</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Deploy AI-powered equipment</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Install renewable energy systems</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Implement electric vehicles</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Optimize transportation routes</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-gray-800 mb-3 text-purple-600">Phase 3 (18-36 months)</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Full digital twin implementation</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Advanced material integration</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Hydrogen fuel cell deployment</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Achieve carbon neutrality targets</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cost-Benefit Analysis */}
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Cost-Benefit Analysis & ROI Projections
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="font-semibold text-gray-800 mb-3">Investment Requirements</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Technology Implementation:</span>
                              <span className="font-bold text-gray-900">₹2.5-4.0 Cr</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Renewable Energy:</span>
                              <span className="font-bold text-gray-900">₹1.8-3.2 Cr</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Equipment Upgrade:</span>
                              <span className="font-bold text-gray-900">₹3.0-5.5 Cr</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Training & Support:</span>
                              <span className="font-bold text-gray-900">₹0.5-1.0 Cr</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-semibold text-gray-800">Total Investment:</span>
                                <span className="font-bold text-blue-600">₹7.8-13.7 Cr</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="font-semibold text-gray-800 mb-3">Expected Returns</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Energy Cost Savings:</span>
                              <span className="font-bold text-green-600">₹1.2-2.0 Cr/year</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Carbon Credit Revenue:</span>
                              <span className="font-bold text-green-600">₹0.8-1.5 Cr/year</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Operational Efficiency:</span>
                              <span className="font-bold text-green-600">₹1.5-2.8 Cr/year</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Regulatory Compliance:</span>
                              <span className="font-bold text-green-600">₹0.5-1.0 Cr/year</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-semibold text-gray-800">Total Annual Savings:</span>
                                <span className="font-bold text-green-600">₹4.0-7.3 Cr/year</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-semibold text-gray-800">ROI Timeline:</span>
                              <span className="font-bold text-blue-600">2-3 years</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visual Analysis Charts for Indian Coal Mining */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                         Visual Analysis & Data Visualization
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Emission Distribution Chart */}
                        <div className="bg-white rounded-lg p-4 border border-indigo-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            </svg>
                            Emission Distribution by Source
                          </h4>
                          <div className="h-64 w-full">
                            {indianResults?.total_emissions_tco2e ? (
                              <DoughnutChart data={{
                                coalProduction: indianResults.total_emissions_tco2e * 0.6,
                                energyConsumption: indianResults.total_emissions_tco2e * 0.25,
                                methaneEmissions: indianResults.total_emissions_tco2e * 0.1,
                                otherGHG: indianResults.total_emissions_tco2e * 0.05,
                                totalEmissions: indianResults.total_emissions_tco2e
                              }} />
                            ) : (
                              <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                                <div className="text-center">
                                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                  <p className="text-gray-500 text-sm">Calculate emissions to view distribution</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-gray-600">
                                Coal Production: {indianResults?.total_emissions_tco2e ? 
                                  `${(indianResults.total_emissions_tco2e * 0.6).toFixed(0)} tCO₂e (60%)` : 
                                  '60%'
                                }
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-gray-600">
                                Energy Consumption: {indianResults?.total_emissions_tco2e ? 
                                  `${(indianResults.total_emissions_tco2e * 0.25).toFixed(0)} tCO₂e (25%)` : 
                                  '25%'
                                }
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <span className="text-gray-600">
                                Methane Emissions: {indianResults?.total_emissions_tco2e ? 
                                  `${(indianResults.total_emissions_tco2e * 0.1).toFixed(0)} tCO₂e (10%)` : 
                                  '10%'
                                }
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-gray-600">
                                Other GHG: {indianResults?.total_emissions_tco2e ? 
                                  `${(indianResults.total_emissions_tco2e * 0.05).toFixed(0)} tCO₂e (5%)` : 
                                  '5%'
                                }
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600">
                              <strong>Note:</strong> Distribution based on typical Indian coal mining patterns. 
                              Coal production emissions include direct combustion and processing.
                            </p>
                          </div>
                        </div>

                        {/* Regional Comparison Chart */}
                        <div className="bg-white rounded-lg p-4 border border-indigo-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Regional Emission Factors Comparison
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Jharkhand</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 h-3 bg-gray-200 rounded-full">
                                  <div className="w-4/5 h-3 bg-blue-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-800">2000 kg CO₂/ton</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Chhattisgarh</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 h-3 bg-gray-200 rounded-full">
                                  <div className="w-3/4 h-3 bg-green-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-800">1950 kg CO₂/ton</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Odisha</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 h-3 bg-gray-200 rounded-full">
                                  <div className="w-full h-3 bg-yellow-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-800">2100 kg CO₂/ton</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">West Bengal</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 h-3 bg-gray-200 rounded-full">
                                  <div className="w-5/6 h-3 bg-purple-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-800">2050 kg CO₂/ton</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Current Region</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 h-3 bg-gray-200 rounded-full">
                                  <div className={`w-full h-3 rounded-full ${indianRegion === 'jharkhand' ? 'bg-blue-500' : indianRegion === 'chhattisgarh' ? 'bg-green-500' : indianRegion === 'odisha' ? 'bg-yellow-500' : 'bg-purple-500'}`}></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-800">{indianResults?.regional_emission_factor_kgco2_perton || 0} kg CO₂/ton</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Emission Level Indicator */}
                        <div className="bg-white rounded-lg p-4 border border-indigo-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Emission Level Classification
                          </h4>
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-white font-bold text-lg ${
                                indianResults?.emission_level === 'high' ? 'bg-red-500' :
                                indianResults?.emission_level === 'medium' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}>
                                {(indianResults?.total_emissions_tco2e || 0).toFixed(0)}
                              </div>
                              <p className="text-sm text-gray-600 mt-2">tCO₂e</p>
                              <p className={`text-sm font-semibold mt-1 ${
                                indianResults?.emission_level === 'high' ? 'text-red-600' :
                                indianResults?.emission_level === 'medium' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {indianResults?.emission_level?.toUpperCase() || 'UNKNOWN'} LEVEL
                              </p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Low: &lt;50K tCO₂e</span>
                                <div className="w-16 h-2 bg-green-200 rounded-full">
                                  <div className="w-1/3 h-2 bg-green-500 rounded-full"></div>
                                </div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Medium: 50K-500K tCO₂e</span>
                                <div className="w-16 h-2 bg-yellow-200 rounded-full">
                                  <div className="w-2/3 h-2 bg-yellow-500 rounded-full"></div>
                                </div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">High: &gt;500K tCO₂e</span>
                                <div className="w-16 h-2 bg-red-200 rounded-full">
                                  <div className="w-full h-2 bg-red-500 rounded-full"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* NDC Progress Tracker */}
                        <div className="bg-white rounded-lg p-4 border border-indigo-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            NDC Progress Tracker
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">2030 Target (45% Reduction)</span>
                                <span className="font-semibold text-gray-800">32%</span>
                              </div>
                              <div className="w-full h-3 bg-gray-200 rounded-full">
                                <div className="w-1/3 h-3 bg-blue-500 rounded-full"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Renewable Energy (500 GW)</span>
                                <span className="font-semibold text-gray-800">180 GW</span>
                              </div>
                              <div className="w-full h-3 bg-gray-200 rounded-full">
                                <div className="w-1/3 h-3 bg-green-500 rounded-full"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Non-Fossil Power (50%)</span>
                                <span className="font-semibold text-gray-800">42%</span>
                              </div>
                              <div className="w-full h-3 bg-gray-200 rounded-full">
                                <div className="w-4/5 h-3 bg-purple-500 rounded-full"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Net Zero 2070</span>
                                <span className="font-semibold text-gray-800">On Track</span>
                              </div>
                              <div className="w-full h-3 bg-gray-200 rounded-full">
                                <div className="w-1/6 h-3 bg-indigo-500 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Technology Impact Visualization */}
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                         Technology Impact Analysis
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Current vs Future Emissions */}
                        <div className="bg-white rounded-lg p-4 border border-teal-200">
                          <h4 className="font-semibold text-gray-800 mb-3">Current vs Future Emissions</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Current Emissions</span>
                                <span className="font-semibold text-gray-800">{(indianResults?.total_emissions_tco2e || 0).toFixed(0)} tCO₂e</span>
                              </div>
                              <div className="w-full h-4 bg-red-200 rounded-full">
                                <div className="w-full h-4 bg-red-500 rounded-full"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">With AI Technologies</span>
                                <span className="font-semibold text-gray-800">{((indianResults?.total_emissions_tco2e || 0) * 0.75).toFixed(0)} tCO₂e</span>
                              </div>
                              <div className="w-full h-4 bg-yellow-200 rounded-full">
                                <div className="w-3/4 h-4 bg-yellow-500 rounded-full"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">With Full Implementation</span>
                                <span className="font-semibold text-gray-800">{((indianResults?.total_emissions_tco2e || 0) * 0.45).toFixed(0)} tCO₂e</span>
                              </div>
                              <div className="w-full h-4 bg-green-200 rounded-full">
                                <div className="w-1/2 h-4 bg-green-500 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Technology Adoption Timeline */}
                        <div className="bg-white rounded-lg p-4 border border-teal-200">
                          <h4 className="font-semibold text-gray-800 mb-3">Technology Adoption Timeline</h4>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">1</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">IoT & Monitoring</span>
                                  <span className="text-blue-600 font-semibold">0-6 months</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                                  <div className="w-1/4 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">2</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">AI Equipment</span>
                                  <span className="text-green-600 font-semibold">6-18 months</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                                  <div className="w-1/2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">3</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Renewable Energy</span>
                                  <span className="text-purple-600 font-semibold">18-36 months</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                                  <div className="w-3/4 h-2 bg-purple-500 rounded-full"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cost-Benefit Visualization */}
                        <div className="bg-white rounded-lg p-4 border border-teal-200">
                          <h4 className="font-semibold text-gray-800 mb-3">Cost-Benefit Analysis</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Initial Investment</span>
                                <span className="font-semibold text-red-600">₹10.5 Cr</span>
                              </div>
                              <div className="w-full h-3 bg-red-200 rounded-full">
                                <div className="w-full h-3 bg-red-500 rounded-full"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Annual Savings</span>
                                <span className="font-semibold text-green-600">₹5.5 Cr</span>
                              </div>
                              <div className="w-full h-3 bg-green-200 rounded-full">
                                <div className="w-1/2 h-3 bg-green-500 rounded-full"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Carbon Credits</span>
                                <span className="font-semibold text-blue-600">₹1.2 Cr</span>
                              </div>
                              <div className="w-full h-3 bg-blue-200 rounded-full">
                                <div className="w-1/8 h-3 bg-blue-500 rounded-full"></div>
                              </div>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">ROI Timeline:</span>
                                <span className="font-semibold text-indigo-600">2.1 years</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Legacy Results Display */}
                {!useIndianCalculation && results && (
                  <div>
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Excavation Results */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
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
                            <span className="text-sm text-gray-600">Total Emissions:</span>
                            <span className="font-bold text-gray-900">{(results.excavationEmissions ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Per Worker:</span>
                            <span className="font-bold text-gray-900">{(results.excavationPerCapita ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Per Ton:</span>
                            <span className="font-bold text-gray-900">{(results.excavationPerOutput ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                        </div>
                </div>

                {/* Transportation Results */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
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
                            <span className="text-sm text-gray-600">Total Emissions:</span>
                            <span className="font-bold text-gray-900">{(results.transportationEmissions ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Per Worker:</span>
                            <span className="font-bold text-gray-900">{(results.transportationPerCapita ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Per Ton:</span>
                            <span className="font-bold text-gray-900">{(results.transportationPerOutput ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                        </div>
                </div>

                {/* Equipment Results */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Equipment</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Emissions:</span>
                            <span className="font-bold text-gray-900">{results.equipmentEmissions.toFixed(2)} kg CO₂</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Per Worker:</span>
                            <span className="font-bold text-gray-900">{results.equipmentPerCapita.toFixed(2)} kg CO₂</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Per Ton:</span>
                            <span className="font-bold text-gray-900">{results.equipmentPerOutput.toFixed(2)} kg CO₂</span>
                          </div>
                        </div>
                </div>

                {/* Total Results */}
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                </div>
                          <h4 className="text-lg font-semibold text-gray-900">Total</h4>
                  </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Emissions:</span>
                            <span className="font-bold text-gray-900">{(results.totalEmissions ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Per Worker:</span>
                            <span className="font-bold text-gray-900">{(results.perCapitaEmissions ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Per Ton:</span>
                            <span className="font-bold text-gray-900">{(results.perOutputEmissions ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information and Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Input Data Summary */}
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Input Data Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Excavation:</span>
                              <span className="font-semibold text-gray-900">{formData.excavation} tons</span>
                  </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Transportation:</span>
                              <span className="font-semibold text-gray-900">{formData.transportation} km</span>
                </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Fuel Consumption:</span>
                              <span className="font-semibold text-gray-900">{formData.fuel} liters</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Equipment Hours:</span>
                              <span className="font-semibold text-gray-900">{formData.equipment} hrs</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Workers:</span>
                              <span className="font-semibold text-gray-900">{formData.workers}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Fuel Type:</span>
                              <span className="font-semibold text-gray-900">{formData.fuelType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Mitigation:</span>
                              <span className="font-semibold text-gray-900">{formData.reduction}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Annual Production:</span>
                              <span className="font-semibold text-gray-900">{formData.output} tons</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Carbon Credits Summary */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          Carbon Credits Analysis
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Baseline Emissions:</span>
                            <span className="font-bold text-gray-900">{(results.baseline ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Emissions:</span>
                            <span className="font-bold text-gray-900">{(results.totalEmissions ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">After Mitigation:</span>
                            <span className="font-bold text-gray-900">{(results.reduced ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Carbon Credits:</span>
                            <span className="font-bold text-green-600">{(results.carboncredits ?? 0).toFixed(2)} credits</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Monetary Value:</span>
                            <span className="font-bold text-green-600">₹{((results.worth ?? 0) * 83).toFixed(2)}</span>
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
              </div>
            </div>
          </div>
        )}
      
        {/* Neutralization Pathways Section */}
        {results && (
              <div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Neutralization Pathways</h3>
                    <p className="text-blue-100 mt-1">Explore strategies to reduce and offset your carbon footprint</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* EV Conversion Slider */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Electric Vehicle Conversion</h4>
                    </div>
                    <div className="space-y-4">
                <input
                  type="range"
                  value={evConversionPercentage}
                  onChange={(e) => setEvConversionPercentage(Number(e.target.value))}
                  min="0"
                  max="100"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-center">
                        <span className="text-2xl font-bold text-blue-600">{evConversionPercentage}%</span>
                        <p className="text-sm text-gray-600">EV Conversion Rate</p>
                      </div>
                    </div>
                  </div>

                  {/* Neutralization Slider */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Neutralization Target</h4>
                    </div>
                    <div className="space-y-4">
                <input
                  type="range"
                  value={neutralizePercentage}
                  onChange={(e) => setNeutralizePercentage(Number(e.target.value))}
                  min="10"
                  max="100"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-center">
                        <span className="text-2xl font-bold text-green-600">{neutralizePercentage}%</span>
                        <p className="text-sm text-gray-600">Neutralization Target</p>
                      </div>
                    </div>
                  </div>

                  {/* Green Fuel Slider */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Green Fuel Shift</h4>
                    </div>
                    <div className="space-y-4">
                <input
                  type="range"
                  value={greenFuelPercentage}
                  onChange={(e) => setGreenFuelPercentage(Number(e.target.value))}
                  min="0"
                  max="100"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-center">
                        <span className="text-2xl font-bold text-yellow-600">{greenFuelPercentage}%</span>
                        <p className="text-sm text-gray-600">Green Fuel Adoption</p>
                      </div>
                    </div>
                  </div>
                </div>

                {neutralisationResults && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Neutralization Analysis</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Carbon Footprint:</span>
                            <span className="font-bold text-gray-900">{neutralisationResults.emissions?.toFixed(2) || 0} kg CO₂</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Target Neutralization:</span>
                            <span className="font-bold text-green-600">{(neutralisationResults.emissions_to_be_neutralised ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Remaining After Steps:</span>
                            <span className="font-bold text-orange-600">{(neutralisationResults.remaining_footprint_after_reduction ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Final Remaining:</span>
                            <span className="font-bold text-red-600">{(neutralisationResults.overall_remaining_footprint ?? 0).toFixed(2)} kg CO₂</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* EV Transportation Results */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">EV Transportation</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="text-center">
                            <span className="text-2xl font-bold text-blue-600">{evConversionPercentage}%</span>
                            <p className="text-sm text-gray-600">Conversion Rate</p>
                          </div>
                          <div className="text-center">
                            <span className="text-lg font-bold text-gray-900">{(neutralisationResults.transportation_footprint_reduction ?? 0).toFixed(2)} kg CO₂</span>
                            <p className="text-sm text-gray-600">Reduction Achieved</p>
                          </div>
                        </div>
                    </div>

                      {/* Green Fuel Results */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Green Fuel</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="text-center">
                            <span className="text-2xl font-bold text-yellow-600">{greenFuelPercentage}%</span>
                            <p className="text-sm text-gray-600">Adoption Rate</p>
                          </div>
                          <div className="text-center">
                            <span className="text-lg font-bold text-gray-900">{(neutralisationResults.fuel_footprint_reduction ?? 0).toFixed(2)} kg CO₂</span>
                            <p className="text-sm text-gray-600">Reduction Achieved</p>
                          </div>
                        </div>
                    </div>

                      {/* Afforestation Results */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Afforestation</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="text-center">
                            <span className="text-2xl font-bold text-green-600">{(neutralisationResults.land_required_for_afforestation_hectares ?? 0).toFixed(2)}</span>
                            <p className="text-sm text-gray-600">Hectares Required</p>
                          </div>
                          <div className="text-center">
                            <span className="text-lg font-bold text-gray-900">{(neutralisationResults.estimated_electricity_savings_mwh ?? 0).toFixed(2)} MWh</span>
                            <p className="text-sm text-gray-600">Electricity Savings</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Neutralization Chart */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Neutralization Pathway Chart</h4>
                      <div className="h-80 w-full">
                        <NeutralizationChart data={neutralisationResults} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </div>

            {/* Professional Decarbonization Brief */}
              {results && (
              <DecarbonizationBrief
                results={results}
                mineName={mineName}
                baselineYear={baselineYear}
                energyMix={energyMix}
                opScale={opScale}
                targetNeutrality={targetNeutrality}
              />
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Export & Manage Results</h3>
                <p className="text-gray-600">Generate reports and manage your carbon analysis data</p>
                </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGenerateAndStorePDF}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate & Store PDF
                </button>

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
      )}
      </div>
    </div>
  );
}

export default Analysis;