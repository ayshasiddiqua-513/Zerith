import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, Tooltip, Legend, Title, LinearScale, CategoryScale } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(LinearScale, CategoryScale, BarElement, Tooltip, Legend, Title, ChartDataLabels);

const NeutralizationChart = ({ data }) => {
    const createChartData = (labels, values, backgroundColors) => ({
        labels: labels,
        datasets: [
            {
                label: 'C02 Reduction(kg CO2)',
                data: values,
                backgroundColor: backgroundColors,
                hoverBackgroundColor: backgroundColors,
            },
        ],
    });
    const neutralizationData = createChartData(
        ['EV Transportation', 'Green Fuel', 'Remaining Emissions', 'Afforestation(Land)'],
        [data.transportation_footprint_reduction,
        data.fuel_footprint_reduction,
        data.remaining_footprint_after_reduction,
        data.land_required_for_afforestation_hectares,
        data.estimated_electricity_savings_mwh
        ],
        ['#36A2EB', '#FFCE56', '#FF6384', '#4BC0C0', '#9966FF']
    );
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                color: '#fff',
                display: true,
                formatter: (value) => `${Number(value).toFixed(2)} kg CO2`,
                font: {
                    weight: 'bold',
                    size: 11,
                },
                anchor: 'end',
                align: 'start',
            },
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: {
                        size: 12,
                        weight: '500'
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let label = context.label || '';
                        if (context.parsed !== null) {
                            label += ': ' + Number(context.parsed).toFixed(2) + ' kg CO2';
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'CO2 Reduction (kg CO2)',
                    font: {
                        size: 12,
                        weight: '500'
                    }
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 11
                    }
                }
            }
        },
    };
    return (
        <div className="w-full h-full">
            <Bar data={neutralizationData} options={options} />
        </div>
    );
};
export default NeutralizationChart;