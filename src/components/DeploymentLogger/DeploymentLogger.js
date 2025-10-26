import React, { useState } from 'react';
import './DeploymentLogger.css';
import { searchDeploymentFile } from './deploymentUtils';

const DeploymentLogger = () => {
  const [ipSuffix, setIpSuffix] = useState('');
  const [deploymentData, setDeploymentData] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = () => {
    try {
      const data = searchDeploymentFile(ipSuffix);
      setDeploymentData(data);
      setError('');
    } catch (err) {
      setError(err.message);
      setDeploymentData([]);
    }
  };

  return (
    <div className="deployment-logger">
      <div className="search-section">
        <input
          type="text"
          value={ipSuffix}
          onChange={(e) => setIpSuffix(e.target.value)}
          placeholder="Enter IP suffix (e.g., 25.163)"
          className="ip-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search Deployments
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {deploymentData.length > 0 && (
        <div className="table-container">
          <table className="deployment-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Service Name</th>
                <th>Broker</th>
                <th>EG</th>
              </tr>
            </thead>
            <tbody>
              {deploymentData.map((item, index) => (
                <tr key={index}>
                  <td>{item.Date}</td>
                  <td>{item.Time}</td>
                  <td>{item["Service Name"]}</td>
                  <td>{item.Broker}</td>
                  <td>{item.EG}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeploymentLogger;