// src/components/PieChart.js
import React from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './PieChart.css';

const PieChart = () => {
  const data = {
    labels: ['Education', 'Food'],
    datasets: [
      {
        data: [60, 40], // Example data
        backgroundColor: ['#4CAF50', '#2196F3'],
      },
    ],
  };

  return (
    <div className="pie-chart-box">
      <h3>Total Spending</h3>
      <Pie data={data} />
    </div>
  );
};

export default PieChart;
