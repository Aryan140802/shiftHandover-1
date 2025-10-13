import React, { useState } from 'react';
import { dummyBillingData } from '../../data/dummyBillingData';
import './BillingAnalysis.css';

const BillingAnalysis = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [billingData, setBillingData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setBillingData(dummyBillingData);
      setIsLoading(false);
    }, 1000);
  };

  const filteredData = billingData.filter(item => {
    const matchesDate = (!dateRange.from || item.date >= dateRange.from) &&
                       (!dateRange.to || item.date <= dateRange.to);
    return matchesDate;
  });

  return (
    <div className="billing-analysis">
      <h2>Billing Analysis</h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter Employee Name or ADID"
            required
          />
        </div>
        <div className="form-group date-range">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Search'}
        </button>
      </form>

      {billingData.length > 0 && (
        <div className="results-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Team</th>
                <th>Schedule</th>
                <th>Department</th>
                <th>First In</th>
                <th>Last Out</th>
                <th>Gross Time</th>
                <th>Net Office Time</th>
                <th>OOO Time</th>
                <th>OOO Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.name}</td>
                  <td>{item.team}</td>
                  <td>{item.schedule}</td>
                  <td>{item.attendance.department || '-'}</td>
                  <td>{item.attendance.first_in || '-'}</td>
                  <td>{item.attendance.last_out || '-'}</td>
                  <td>{item.attendance.gross_time || '-'}</td>
                  <td>{item.attendance.net_office_time || '-'}</td>
                  <td>{item.attendance.out_of_office_time || '-'}</td>
                  <td>{item.attendance.out_of_office_count || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BillingAnalysis;
