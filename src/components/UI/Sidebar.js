import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBarChart2, FiFileText } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <nav className="app-sidebar">
      <ul className="sidebar-nav">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FiHome className="nav-icon" />
            <span>Dashboard</span>
          </NavLink>
        </li>
        
        <li>
          <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FiBarChart2 className="nav-icon" />
            <span>Reports</span>
          </NavLink>
        </li>
        
        <li>
          <NavLink to="/billing-analysis" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FiFileText className="nav-icon" />
            <span>Billing Portal</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
