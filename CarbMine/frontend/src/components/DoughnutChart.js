// DoughnutChart.js
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register required components and plugins
ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

const DoughnutChart = ({ data }) => {
  const createChartData = (labels,values,backgroundColors) =>({
    labels: labels,
    datasets: [
      {
        data:values,
        backgroundColor:backgroundColors,
        hoverBackgroundColor: backgroundColors,
      },
    ],
  });

  // Check if this is Indian Coal Mining data
  const isIndianData = data.coalProduction !== undefined;
  
  let totalEmissionsData;
  
  if (isIndianData) {
    // Indian Coal Mining Analysis data
    totalEmissionsData = createChartData(
      ['Coal Production', 'Energy Consumption', 'Methane Emissions', 'Other GHG'],
      [data.coalProduction, data.energyConsumption, data.methaneEmissions, data.otherGHG],
      ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40']
    );
  } else {
    // Legacy data
    totalEmissionsData = createChartData(
      ['Excavation', 'Transportation', 'Equipment'],
      [data.excavationEmissions, data.transportationEmissions, data.equipmentEmissions],
      ['#FF6384', '#36A2EB', '#FFCE56']
    );
  }

  // const perCapitaEmissionsData = createChartData(
  //   ['Excavation', 'Transportation', 'Equipment'],
  //   [data.excavationPerCapita, data.transportationPerCapita, data.equipmentPerCapita],
  //   ['#FF0000', '#FFFF00', '#0000FF']
  // );

  // const perOutputEmissionsData = createChartData(
  //   ['Excavation', 'Transportation', 'Equipment'],
  //   [data.excavationPerOutput, data.transportationPerOutput, data.equipmentPerOutput],
  //  ['#008000', '#800080', '#FFA500']
  // );

  const totalEmissions=createChartData(
    ['Excavation', 'Transportation', 'Equipment'],
    [data.totalEmissions,data.perCapitaEmissions,data.perOutputEmissions],
       ['#008000', '#800080', '#FFA500']
 
  )


  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        color: '#fff',
        display: true,
        formatter: (value) => `${Number(value).toFixed(2)} ${isIndianData ? 'tCO₂e' : 'kg CO2'}`,
        font: {
          weight: 'bold',
          size: 12,
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
              label += ': ' + Number(context.parsed).toFixed(2);
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <div className="w-full h-full">
        <Pie data={totalEmissionsData} options={options} />
      </div>
    </div>
  );
};

export default DoughnutChart;
