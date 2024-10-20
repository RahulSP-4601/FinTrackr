import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

const FinancialStats = () => {
  const [labels] = useState(['Balance', 'Expenses', 'Income']);
  const [dataPoints, setDataPoints] = useState([0, 0, 0]); // Default values
  const [loading, setLoading] = useState(true); // State for loading
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const fetchFinancialStats = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/v1/financial-stats');
        const { balance, expenses, income } = response.data;
    
        // Set data points; expenses are displayed as negative
        setDataPoints([balance, -expenses, income]);
        setError(null); // Clear error state on successful fetch
      } catch (error) {
        console.error("Error fetching financial stats:", error);
        setError("Failed to fetch financial statistics. Please try again later.");
      } finally {
        setLoading(false); // Set loading to false regardless of success or error
      }
    };
    
    

    fetchFinancialStats();
  }, []);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Financial Data',
        data: dataPoints,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
        fill: false,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <h3>Financial Statistics</h3>
      {loading ? (
        <p>Loading...</p> // Show loading text while data is being fetched
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p> // Display error message if there's an error
      ) : (
        <Line data={data} options={options} />
      )}
    </div>
  );
};

export default FinancialStats;
