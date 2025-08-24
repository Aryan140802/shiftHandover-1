
import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import './HandoverReports.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend
);

const HandoverReports = ({ handovers }) => {
  const [dateRange, setDateRange] = useState('7');

  const filteredHandovers = handovers.filter(handover => {
    if (dateRange === 'all') return true;
    const days = parseInt(dateRange);
    const cutoffDate = subDays(new Date(), days);
    return new Date(handover.createdAt) >= cutoffDate;
  });

  const priorityData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [{
      data: [
        filteredHandovers.filter(h => h.priority === 'low').length,
        filteredHandovers.filter(h => h.priority === 'medium').length,
        filteredHandovers.filter(h => h.priority === 'high').length,
        filteredHandovers.filter(h => h.priority === 'critical').length
      ],
      backgroundColor: ['#4CAF50', '#FFC107', '#FF9800', '#F44336'],
      borderWidth: 1
    }]
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    }
  };

  const statusData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [{
      data: [
        filteredHandovers.filter(h => h.status === 'pending').length,
        filteredHandovers.filter(h => h.status === 'in-progress').length,
        filteredHandovers.filter(h => h.status === 'completed').length
      ],
      backgroundColor: ['#FFC107', '#2196F3', '#4CAF50']
    }]
  };

  const dailyData = {
    labels: Array.from({ length: 7 }, (_, i) => 
      format(subDays(new Date(), 6 - i), 'EEE')
    ),
    datasets: [{
      label: 'Handovers',
      data: Array.from({ length: 7 }, (_, i) => {
        const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
        return filteredHandovers.filter(h => 
          format(new Date(h.createdAt), 'yyyy-MM-dd') === date
        ).length;
      }),
      backgroundColor: '#2196F3',
      borderWidth: 1
    }]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Handover Reports</h2>
        <select 
          value={dateRange} 
          onChange={(e) => setDateRange(e.target.value)}
          className="date-selector"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <h3>Total Handovers</h3>
          <p>{filteredHandovers.length}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending</h3>
          <p>{filteredHandovers.filter(h => h.status === 'pending').length}</p>
        </div>
        <div className="stat-card in-progress">
          <h3>In Progress</h3>
          <p>{filteredHandovers.filter(h => h.status === 'in-progress').length}</p>
        </div>
        <div className="stat-card completed">
          <h3>Completed</h3>
          <p>{filteredHandovers.filter(h => h.status === 'completed').length}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Handovers by Priority</h3>
          <Pie data={priorityData} options={pieOptions} />
        </div>
        <div className="chart-card">
          <h3>Handovers by Status</h3>
          <Pie data={statusData} options={pieOptions} />
        </div>
        <div className="chart-card wide">
          <h3>Daily Handover Count</h3>
          <Bar data={dailyData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default HandoverReports;