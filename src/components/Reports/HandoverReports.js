import React, { useState, useEffect } from 'react';
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
import { getHandovers } from '../../Api/HandOverApi';
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

const HandoverReports = ({ credentials }) => {
  const [dateRange, setDateRange] = useState('7');
  const [backendData, setBackendData] = useState({ TeamHandoverDetails: [], Tasksdata: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (credentials) {
      fetchReportsData();
    }
  }, [credentials]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const data = await getHandovers(credentials.uid, credentials.password);
      if (data && data.TeamHandoverDetails && data.Tasksdata) {
        setBackendData(data);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const { TeamHandoverDetails = [], Tasksdata = [] } = backendData;

  // Filter tasks by date range
  const filteredTasks = Tasksdata.filter(task => {
    if (dateRange === 'all' || !task.creationTime) return true;
    const days = parseInt(dateRange);
    const cutoffDate = subDays(new Date(), days);
    return new Date(task.creationTime) >= cutoffDate;
  });

  // Priority data
  const priorityData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [{
      data: [
        filteredTasks.filter(t => t.priority?.toLowerCase() === 'low').length,
        filteredTasks.filter(t => t.priority?.toLowerCase() === 'medium').length,
        filteredTasks.filter(t => t.priority?.toLowerCase() === 'high').length,
        filteredTasks.filter(t => t.priority?.toLowerCase() === 'critical').length
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

  // Status data
  const statusData = {
    labels: ['Pending/Open', 'In Progress', 'Completed'],
    datasets: [{
      data: [
        filteredTasks.filter(t => t.status === 'open' || t.status === 'pending').length,
        filteredTasks.filter(t => t.status === 'in progress' || t.status === 'in-progress').length,
        filteredTasks.filter(t => t.status === 'completed' || t.status === 'closed').length
      ],
      backgroundColor: ['#FFC107', '#2196F3', '#4CAF50']
    }]
  };

  // Daily handover count (based on task creation)
  const dailyData = {
    labels: Array.from({ length: 7 }, (_, i) => 
      format(subDays(new Date(), 6 - i), 'EEE')
    ),
    datasets: [{
      label: 'Tasks Created',
      data: Array.from({ length: 7 }, (_, i) => {
        const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
        return filteredTasks.filter(t => {
          if (!t.creationTime) return false;
          return format(new Date(t.creationTime), 'yyyy-MM-dd') === date;
        }).length;
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

  // Calculate statistics
  const stats = {
    total: filteredTasks.length,
    pending: filteredTasks.filter(t => t.status === 'open' || t.status === 'pending').length,
    inProgress: filteredTasks.filter(t => t.status === 'in progress' || t.status === 'in-progress').length,
    completed: filteredTasks.filter(t => t.status === 'completed' || t.status === 'closed').length,
    totalHandovers: TeamHandoverDetails.length
  };

  if (loading) {
    return <div className="loading-message">Loading reports...</div>;
  }

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
          <p>{stats.totalHandovers}</p>
        </div>
        <div className="stat-card total">
          <h3>Total Tasks</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending Tasks</h3>
          <p>{stats.pending}</p>
        </div>
        <div className="stat-card in-progress">
          <h3>In Progress</h3>
          <p>{stats.inProgress}</p>
        </div>
        <div className="stat-card completed">
          <h3>Completed</h3>
          <p>{stats.completed}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Tasks by Priority</h3>
          <Pie data={priorityData} options={pieOptions} />
        </div>
        <div className="chart-card">
          <h3>Tasks by Status</h3>
          <Pie data={statusData} options={pieOptions} />
        </div>
        <div className="chart-card wide">
          <h3>Daily Task Creation (Last 7 Days)</h3>
          <Bar data={dailyData} options={barOptions} />
        </div>
      </div>

      {TeamHandoverDetails.length > 0 && (
        <div className="chart-card" style={{ marginTop: '2rem' }}>
          <h3>Team Handover Summary</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Team Name</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Team ID</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Team Lead ID</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Total Tasks</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Completed</th>
              </tr>
            </thead>
            <tbody>
              {TeamHandoverDetails.map(team => {
                const teamTasks = Tasksdata.filter(t => t.handover_id_id === team.handover_id_id);
                const completedTasks = teamTasks.filter(t => t.status === 'completed' || t.status === 'closed');
                
                return (
                  <tr key={team.handover_id_id}>
                    <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{team.teamName}</td>
                    <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{team.TeamId}</td>
                    <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{team.teamLead_id}</td>
                    <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{teamTasks.length}</td>
                    <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                      {completedTasks.length} ({teamTasks.length > 0 ? Math.round((completedTasks.length / teamTasks.length) * 100) : 0}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HandoverReports;
