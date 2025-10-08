import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
// import { dummyHandovers } from './data/dummyHandovers'; // Commented out to use API data
import { dummyShifts } from './data/dummyShifts';

// Import Components
import Header from './components/UI/Header';
import Sidebar from './components/UI/Sidebar';
import HandoverList from './components/Handovers/HandoverList';
import CreateHandover from './components/Handovers/CreateHandover';
import HandoverDetail from './components/Handovers/HandoverDetail';
// import ShiftManager from './components/Shifts/ShiftManager';
import HandoverReports from './components/Reports/HandoverReports';

// Main CSS
import './App.css';

function App() {
  // State for handovers and shifts
  // Start with empty array to force API call
  const [handovers, setHandovers] = useState([]);
  const [shifts, setShifts] = useState(dummyShifts);

  // Function to add new handover
  const addHandover = (newHandover) => {
    setHandovers([
      {
        ...newHandover,
        id: `handover-${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: { name: "System User" } // Default user since no auth
      },
      ...handovers
    ]);
  };

  // Function to update handovers (including tasks)
  const updateHandovers = (updatedHandovers) => {
    setHandovers(updatedHandovers);
  };

  return (
    <Router basename="/shiftHandoverFrontend">
      <div className="app-container">
        <Header />
        <div className="main-content">
          <Sidebar />
          <div className="content-area">
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <HandoverList
                    handovers={handovers}
                    onHandoversUpdate={updateHandovers}
                  />
                }
              />
              <Route
                path="/create"
                element={
                  <CreateHandover
                    shifts={shifts}
                    onSubmit={addHandover}
                  />
                }
              />
              <Route
                path="/handover/:id"
                element={
                  <HandoverDetail handovers={handovers} />
                }
              />
              {/* <Route
                path="/shifts"
                element={
                  <ShiftManager shifts={shifts} setShifts={setShifts} />
                }
              /> */}
              <Route
                path="/reports"
                element={
                  <HandoverReports handovers={handovers} />
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
