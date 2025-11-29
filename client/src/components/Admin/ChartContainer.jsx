// client/src/components/Admin/ChartContainer.jsx
import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register all necessary Chart.js elements
ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
);

const ChartContainer = ({ title, data, type }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      },
      title: { 
        display: true, 
        text: title, 
        font: { 
          size: window.innerWidth < 768 ? 14 : 16 
        },
        padding: {
          bottom: 20
        }
      },
    },
    scales: type === 'Bar' ? { 
      x: { 
        grid: { display: false },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      }, 
      y: { 
        beginAtZero: true,
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      } 
    } : {},
  };

  const chartData = {
    labels: data.labels,
    datasets: [{
      label: type === 'Doughnut' ? 'Occupancy Rate' : 'New Listings',
      data: data.data,
      backgroundColor: type === 'Doughnut' 
        ? ['#1e3a8a', '#9ca3af', '#60a5fa', '#34d399'] 
        : '#10b981',
      borderColor: 'transparent',
      hoverOffset: 4,
    }],
  };

  const ChartComponent = type === 'Bar' ? Bar : type === 'Doughnut' ? Doughnut : Line;

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg h-64 md:h-80 lg:h-96">
      <ChartComponent data={chartData} options={options} />
    </div>
  );
};

export default ChartContainer;