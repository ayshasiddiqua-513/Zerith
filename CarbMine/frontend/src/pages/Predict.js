import React, { useState } from 'react';
import api from '../api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Title);

const Predict = () => {
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState(currentYear);
  const [endYear, setEndYear] = useState(currentYear + 5);
  const [production, setProduction] = useState('');
  const [energy, setEnergy] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const start = Number(startYear);
      const end = Number(endYear);

      // Basic client-side validation to avoid 422s from backend
      if (Number.isNaN(start) || Number.isNaN(end)) {
        setError('Please enter valid numeric years.');
        setLoading(false);
        return;
      }
      if (start < 2000 || start > 2100 || end < 2000 || end > 2100) {
        setError('Years must be between 2000 and 2100.');
        setLoading(false);
        return;
      }
      if (end < start) {
        setError('End year must be greater than or equal to start year.');
        setLoading(false);
        return;
      }

      const payload = {
        start_year: start,
        end_year: end,
      };
      if (production) payload.coal_production_tons = Number(production);
      if (energy) payload.energy_consumption_mwh = Number(energy);
      const { data } = await api.post('/predict_emissions', payload);
      setPredictions(data.predictions || []);
    } catch (err) {
      const backendDetail = err?.response?.data?.detail;
      const message = backendDetail ? `Failed to fetch predictions: ${backendDetail}` : `Failed to fetch predictions: ${err.message}`;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: predictions.map((p) => p.year),
    datasets: [
      {
        label: 'Predicted Total Emissions (tCO2e)',
        data: predictions.map((p) => p.predicted_total_emissions_tco2e),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const computeStats = () => {
    if (!predictions || predictions.length < 1) return null;
    const values = predictions.map((p) => Number(p.predicted_total_emissions_tco2e) || 0);
    const years = predictions.map((p) => Number(p.year));
    const first = values[0];
    const last = values[values.length - 1];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const pctChange = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;
    let cagr = 0;
    const nYears = years.length > 1 ? years[years.length - 1] - years[0] : 0;
    if (first > 0 && last > 0 && nYears > 0) {
      cagr = (Math.pow(last / first, 1 / nYears) - 1) * 100;
    }
    return { min, max, avg, pctChange, cagr, firstYear: years[0], lastYear: years[years.length - 1], first, last };
  };

  const stats = computeStats();
  const pinForecast = () => {
    if (!predictions || predictions.length === 0) return;
    const STORAGE_KEY = 'pinnedForecasts';
    const existingRaw = localStorage.getItem(STORAGE_KEY);
    let existing = [];
    try { existing = existingRaw ? JSON.parse(existingRaw) : []; } catch { existing = []; }
    const item = {
      id: `${Date.now()}`,
      label: `Forecast ${new Date().toLocaleString()}`,
      createdAt: Date.now(),
      predictions,
      inputs: { startYear, endYear },
      productionOverride: production || null,
      energyOverride: energy || null,
    };
    const next = [item, ...existing].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    alert('Forecast pinned to Dashboard');
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Emission Forecast Trend',
        font: { size: 16, weight: 'bold' },
        color: '#374151'
      },
      legend: { 
        labels: { 
          color: '#374151',
          font: { size: 12, weight: '500' }
        } 
      },
      tooltip: { 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3B82F6',
        borderWidth: 1,
        callbacks: { 
          label: (ctx) => `${ctx.parsed.y.toLocaleString()} tCO₂e` 
        } 
      },
    },
    scales: {
      x: { 
        title: {
          display: true,
          text: 'Year',
          color: '#374151',
          font: { size: 12, weight: '500' }
        },
        ticks: { 
          color: '#6B7280',
          font: { size: 11 }
        }, 
        grid: { 
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        } 
      },
      y: { 
        title: {
          display: true,
          text: 'Emissions (tCO₂e)',
          color: '#374151',
          font: { size: 12, weight: '500' }
        },
        ticks: { 
          color: '#6B7280',
          font: { size: 11 },
          callback: function(value) {
            return value.toLocaleString();
          }
        }, 
        grid: { 
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        } 
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating Predictions</h3>
          <p className="text-gray-600">Analyzing your mining data and generating emission forecasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Emission Forecast</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              AI-powered predictions for future carbon emissions based on your mining operations and production parameters
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Prediction Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Forecast Parameters</h2>
          <form onSubmit={handlePredict} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Year
                </label>
                <input 
                  type="number" 
                  value={startYear} 
                  onChange={(e) => setStartYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="2000"
                  max="2100"
                />
          </div>
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Year
                </label>
                <input 
                  type="number" 
                  value={endYear} 
                  onChange={(e) => setEndYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="2000"
                  max="2100"
                />
          </div>
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coal Production (tons)
                  <span className="text-gray-500 text-xs ml-1">(optional)</span>
                </label>
                <input 
                  type="number" 
                  value={production} 
                  onChange={(e) => setProduction(e.target.value)}
                  placeholder="Enter production volume"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
          </div>
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Consumption (MWh)
                  <span className="text-gray-500 text-xs ml-1">(optional)</span>
                </label>
                <input 
                  type="number" 
                  value={energy} 
                  onChange={(e) => setEnergy(e.target.value)}
                  placeholder="Enter energy consumption"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-orange-700 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Generating Forecast...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Generate Forecast
          </div>
                )}
            </button>
          </div>
        </form>
        </div>

        {/* Chart Section */}
          {predictions.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Emission Forecast Chart</h2>
              <button 
                onClick={pinForecast}
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Pin to Dashboard
              </button>
              </div>
            <div className="h-96">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Forecast Available</h3>
            <p className="text-gray-600">Enter your parameters above and click "Generate Forecast" to see your emission predictions.</p>
          </div>
        )}

        {/* Statistics Cards */}
        {predictions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Input Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Input Parameters</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Forecast Period</span>
                  <span className="text-sm font-medium text-gray-900">{startYear} - {endYear}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Coal Production</span>
                  <span className="text-sm font-medium text-gray-900">
                    {production ? Number(production).toLocaleString() + ' tons' : 'Default model'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Energy Consumption</span>
                  <span className="text-sm font-medium text-gray-900">
                    {energy ? Number(energy).toLocaleString() + ' MWh' : 'Default model'}
                  </span>
                </div>
              </div>
            </div>

            {/* Forecast Highlights Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Forecast Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Average Annual</span>
                  <span className="text-sm font-medium text-gray-900">{stats ? Math.round(stats.avg).toLocaleString() : '-'} tCO₂e</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Peak Emissions</span>
                  <span className="text-sm font-medium text-gray-900">{stats ? Math.round(stats.max).toLocaleString() : '-'} tCO₂e</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Lowest Emissions</span>
                  <span className="text-sm font-medium text-gray-900">{stats ? Math.round(stats.min).toLocaleString() : '-'} tCO₂e</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Total Change</span>
                  <span className={`text-sm font-medium ${stats && stats.pctChange > 0 ? 'text-red-600' : stats && stats.pctChange < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {stats ? `${Math.round(stats.pctChange * 10) / 10}%` : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Growth Analysis Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Growth Analysis</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">CAGR</span>
                  <span className={`text-sm font-medium ${stats && stats.cagr > 0 ? 'text-red-600' : stats && stats.cagr < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {stats ? `${Math.round(stats.cagr * 10) / 10}%` : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Period</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats ? `${stats.lastYear - stats.firstYear + 1} years` : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">First Year</span>
                  <span className="text-sm font-medium text-gray-900">{stats ? stats.firstYear : '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Last Year</span>
                  <span className="text-sm font-medium text-gray-900">{stats ? stats.lastYear : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insight Section */}
        {predictions.length > 0 && stats && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-2">Forecast Insight</h3>
                <p className="text-orange-700 leading-relaxed">
                  {stats.pctChange > 0
                    ? `Based on current trends, emissions are projected to increase by approximately ${Math.round(stats.pctChange)}% from ${stats.firstYear} to ${stats.lastYear}, with an average annual emission of ${Math.round(stats.avg).toLocaleString()} tCO₂e. This represents a compound annual growth rate of ${Math.round(stats.cagr * 10) / 10}%.`
                    : stats.pctChange < 0
                      ? `Based on current trends, emissions are projected to decrease by approximately ${Math.abs(Math.round(stats.pctChange))}% from ${stats.firstYear} to ${stats.lastYear}, with an average annual emission of ${Math.round(stats.avg).toLocaleString()} tCO₂e. This represents a compound annual decline rate of ${Math.abs(Math.round(stats.cagr * 10) / 10)}%.`
                      : `Based on current trends, emissions are projected to remain relatively stable from ${stats.firstYear} to ${stats.lastYear}, with an average annual emission of ${Math.round(stats.avg).toLocaleString()} tCO₂e. This represents a compound annual growth rate of ${Math.round(stats.cagr * 10) / 10}%.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predict;
