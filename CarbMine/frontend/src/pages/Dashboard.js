import React, { useMemo, useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Title);

const STORAGE_KEY = 'pinnedForecasts';

const loadPinned = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
};

const savePinned = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const fmt = (n) => Math.round(Number(n || 0)).toLocaleString();

const Dashboard = () => {
  const [pinned, setPinned] = useState(loadPinned());
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('6m');

  useEffect(() => {
    setPinned(loadPinned());
  }, []);

  const removePin = (id) => {
    const next = pinned.filter((p) => p.id !== id);
    setPinned(next);
    savePinned(next);
  };

  // Mock data for demonstration
  const mockStats = {
    totalEmissions: 125000,
    reductionTarget: 30,
    currentReduction: 18,
    reportsGenerated: 24,
    recommendations: 156,
    activeProjects: 8,
    carbonCredits: 4500,
    efficiency: 87
  };

  const mockRecentActivity = [
    { id: 1, type: 'analysis', title: 'Coal Mine Analysis Completed', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'prediction', title: 'Emission Forecast Generated', time: '5 hours ago', status: 'completed' },
    { id: 3, type: 'report', title: 'Monthly Carbon Report', time: '1 day ago', status: 'pending' },
    { id: 4, type: 'recommendation', title: 'New Efficiency Strategy', time: '2 days ago', status: 'new' },
  ];

  const mockTopRecommendations = [
    { id: 1, title: 'Solar Panel Installation', impact: 'High', reduction: '25%', cost: '$50K' },
    { id: 2, title: 'Energy Efficiency Upgrade', impact: 'Medium', reduction: '15%', cost: '$25K' },
    { id: 3, title: 'Carbon Capture System', impact: 'High', reduction: '40%', cost: '$200K' },
  ];

  const datasets = useMemo(() => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];
    return pinned.map((p, idx) => ({
      label: p.label || `Forecast ${idx + 1}`,
      data: (p.predictions || []).map((pt) => pt.predicted_total_emissions_tco2e),
      borderColor: colors[idx % colors.length],
      backgroundColor: `${colors[idx % colors.length]}20`,
      tension: 0.4,
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6,
    }));
  }, [pinned]);

  const labels = useMemo(() => {
    if (!pinned.length) return [];
    const first = pinned[0].predictions || [];
    return first.map((pt) => pt.year);
  }, [pinned]);

  const chartData = { labels, datasets };

  const emissionBreakdownData = {
    labels: ['Mining Operations', 'Transportation', 'Energy Consumption', 'Equipment', 'Other'],
    datasets: [{
      data: [35, 25, 20, 15, 5],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      borderWidth: 0,
    }]
  };

  const monthlyTrendData = useMemo(() => {
    const dataByTimeRange = {
      '6m': {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [12000, 11500, 11000, 10800, 10500, 10200]
      },
      '1y': {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [12000, 11500, 11000, 10800, 10500, 10200, 10000, 9800, 9600, 9400, 9200, 9000]
      },
      '2y': {
        labels: ['2022', '2023'],
        data: [150000, 125000]
      }
    };

    const selectedData = dataByTimeRange[timeRange] || dataByTimeRange['6m'];
    
    return {
      labels: selectedData.labels,
      datasets: [{
        label: 'Emissions (tCO₂e)',
        data: selectedData.data,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        fill: true,
      }]
    };
  }, [timeRange]);

  const chartOptions = {
              responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#6B7280',
          font: { size: 12, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3B82F6',
        borderWidth: 1,
      }
    },
              scales: {
      x: {
        ticks: { color: '#6B7280' },
        grid: { color: 'rgba(107, 114, 128, 0.1)', drawBorder: false }
      },
      y: {
        ticks: { color: '#6B7280' },
        grid: { color: 'rgba(107, 114, 128, 0.1)', drawBorder: false }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-lg text-gray-600 mt-1">Welcome back! Here's your carbon management overview.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">{new Date().toLocaleTimeString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Emissions</p>
                <p className="text-2xl font-bold text-gray-900">{fmt(mockStats.totalEmissions)} tCO₂e</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Reduction Progress</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.currentReduction}% / {mockStats.reductionTarget}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Reports Generated</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.reportsGenerated}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.activeProjects}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/estimate" className="group">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 text-center hover:from-blue-100 hover:to-indigo-100 transition-colors">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">New Analysis</p>
              </div>
            </Link>

            <Link to="/predict" className="group">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 text-center hover:from-orange-100 hover:to-amber-100 transition-colors">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">Predict Emissions</p>
              </div>
            </Link>

            <Link to="/recommendations" className="group">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 text-center hover:from-green-100 hover:to-emerald-100 transition-colors">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">View Strategies</p>
              </div>
            </Link>

            <Link to="/view" className="group">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 text-center hover:from-purple-100 hover:to-indigo-100 transition-colors">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">View Reports</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Forecast Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Emission Forecasts</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('detailed')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${activeTab === 'detailed' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Detailed
                </button>
              </div>
            </div>
            <div className="h-80">
          {pinned.length > 0 ? (
                <Line 
                  data={chartData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        display: true,
                        text: activeTab === 'overview' ? 'Emission Forecast Overview' : 'Detailed Emission Forecast Analysis',
                        font: { size: 14, weight: 'bold' },
                        color: '#374151'
                      }
                    }
                  }} 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-2">No pinned forecasts yet</p>
                    <p className="text-sm text-gray-400">Pin forecasts from the Predict page to compare them here</p>
                    <div className="mt-4">
                      <Link to="/predict" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Forecast
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Emission Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Emission Breakdown</h2>
            <div className="h-80">
              <Doughnut data={emissionBreakdownData} options={{
              responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#6B7280',
                      font: { size: 12, weight: '500' },
                      padding: 20
                    }
                  }
                }
              }} />
            </div>
          </div>
        </div>

        {/* Recent Activity & Top Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Top Recommendations</h2>
              <Link to="/recommendations" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {mockTopRecommendations.map((rec) => (
                <div key={rec.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{rec.title}</p>
                    <p className="text-xs text-gray-500">{rec.reduction} reduction • {rec.cost}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.impact === 'High' ? 'bg-red-100 text-red-700' :
                    rec.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {rec.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics & Progress Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Carbon Reduction Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Carbon Reduction Progress</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Target: 30% Reduction</span>
                  <span className="text-sm font-bold text-gray-900">18% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{width: '60%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">12% remaining to reach target</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">22,500</div>
                  <div className="text-xs text-green-700">tCO₂e Reduced</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">37,500</div>
                  <div className="text-xs text-blue-700">tCO₂e Remaining</div>
                </div>
              </div>
            </div>
          </div>

          {/* Efficiency Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Efficiency Metrics</h2>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">87%</div>
                <div className="text-sm text-gray-600">Overall Efficiency</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '87%'}}></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Energy Efficiency</span>
                  <span className="text-sm font-medium text-gray-900">92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Process Optimization</span>
                  <span className="text-sm font-medium text-gray-900">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Resource Utilization</span>
                  <span className="text-sm font-medium text-gray-900">78%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Carbon Credits */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Carbon Credits</h2>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">4,500</div>
                <div className="text-sm text-gray-600">Credits Earned</div>
                <div className="text-xs text-gray-500 mt-1">Worth $22,500</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-700">This Month</span>
                  <span className="text-sm font-bold text-green-600">+150</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-700">Last Month</span>
                  <span className="text-sm font-bold text-blue-600">+120</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-700">Total Value</span>
                  <span className="text-sm font-bold text-purple-600">$22,500</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Alerts & Notifications</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Mark All Read
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-red-800">High Emission Alert</p>
                  <span className="text-xs text-red-600">2 hours ago</span>
                </div>
                <p className="text-sm text-red-700 mt-1">Emission levels exceeded threshold by 15% in Mining Operations sector</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-yellow-800">Maintenance Due</p>
                  <span className="text-xs text-yellow-600">1 day ago</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">Equipment efficiency check scheduled for next week</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-green-800">Target Achieved</p>
                  <span className="text-xs text-green-600">3 days ago</span>
                </div>
                <p className="text-sm text-green-700 mt-1">Monthly reduction target exceeded by 5%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Monthly Emission Trend</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setTimeRange('6m')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${timeRange === '6m' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                6 Months
              </button>
              <button 
                onClick={() => setTimeRange('1y')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${timeRange === '1y' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                1 Year
              </button>
              <button 
                onClick={() => setTimeRange('2y')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${timeRange === '2y' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                2 Years
              </button>
            </div>
          </div>
          <div className="h-80">
            <Bar data={monthlyTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Pinned Forecasts */}
        {pinned.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pinned Forecasts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pinned.map((p) => {
              const values = (p.predictions || []).map((pt) => Number(pt.predicted_total_emissions_tco2e) || 0);
              const years = (p.predictions || []).map((pt) => Number(pt.year));
              const avg = values.length ? values.reduce((a,b)=>a+b,0) / values.length : 0;
              const min = values.length ? Math.min(...values) : 0;
              const max = values.length ? Math.max(...values) : 0;
              const first = values[0] || 0;
              const last = values[values.length - 1] || 0;
              const pct = first ? ((last - first) / Math.abs(first)) * 100 : 0;
              return (
                  <div key={p.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{p.label}</h3>
                        <p className="text-xs text-gray-500">{(p.createdAt && new Date(p.createdAt).toLocaleString()) || ''}</p>
                      </div>
                      <button 
                        onClick={()=>removePin(p.id)} 
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Years:</span>
                        <span className="font-medium">{years[0]}–{years[years.length - 1]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average:</span>
                        <span className="font-medium">{fmt(avg)} tCO₂e/yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Range:</span>
                        <span className="font-medium">{fmt(min)} - {fmt(max)} tCO₂e</span>
                    </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Change:</span>
                        <span className={`font-medium ${pct >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {Math.round(pct)}%
                        </span>
                  </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;


