import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { dummyShifts } from './data/dummyShifts';

// Import Components
import Header from './components/UI/Header';
import Sidebar from './components/UI/Sidebar';
import HandoverList from './components/Handovers/HandoverList';
import CreateHandover from './components/Handovers/CreateHandover';
import HandoverDetail from './components/Handovers/HandoverDetail';
import ShiftManager from './components/Shifts/ShiftManager';
import HandoverReports from './components/Reports/HandoverReports';

// Main CSS
import './App.css';

function App() {
  // State for backend data structure
  const [backendData, setBackendData] = useState({
    TeamHandoverDetails: [],
    Tasksdata: []
  });
  const [shifts, setShifts] = useState(dummyShifts);

  // Function to update backend data from child components
  const updateBackendData = (newData) => {
    setBackendData(newData);
  };

  // Function to add new handover (for CreateHandover component)
  const addHandover = (newHandover) => {
    // Generate new IDs
    const maxHandoverId = Math.max(
      ...backendData.TeamHandoverDetails.map(h => h.handover_id_id),
      0
    );
    const maxTaskId = Math.max(
      ...backendData.Tasksdata.map(t => t.Taskid),
      0
    );

    const newHandoverId = maxHandoverId + 1;

    // Create new team handover detail
    const newTeamHandover = {
      TeamId: backendData.TeamHandoverDetails.length + 1,
      teamName: newHandover.title.replace(' team', '').replace(' Team', ''),
      teamLead_id: 0, // You can update this with actual user ID
      handover_id_id: newHandoverId
    };

    // Create new tasks
    const newTasks = newHandover.tasks.map((task, index) => ({
      Taskid: maxTaskId + index + 1,
      taskDesc: task.description,
      priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
      userCreated_id: null,
      status: task.status === 'in-progress' ? 'in progress' : task.status,
      userAccepted_id: null,
      creationTime: new Date().toISOString(),
      acknowledgeStatus: 'Pending',
      acknowledgeDesc: '',
      acknowledgeTime: '',
      statusUpdateTime: '',
      taskTitle: task.title,
      handover_id_id: newHandoverId
    }));

    // Update backend data state
    setBackendData({
      TeamHandoverDetails: [...backendData.TeamHandoverDetails, newTeamHandover],
      Tasksdata: [...backendData.Tasksdata, ...newTasks]
    });

    // TODO: Send to backend API
    console.log('New handover created:', {
      TeamHandoverDetails: newTeamHandover,
      Tasksdata: newTasks
    });
  };

  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="main-content">
          <Sidebar />
          <div className="content-area">
            <Routes>
              <Route path="/" element={
                <HandoverList 
                  onHandoversUpdate={updateBackendData}
                />
              } />
              
              <Route path="/create" element={
                <CreateHandover 
                  shifts={shifts} 
                  onSubmit={addHandover} 
                />
              } />
              
              <Route path="/handover/:id" element={
                <HandoverDetail />
              } />
              
              <Route path="/shifts" element={
                <ShiftManager 
                  shifts={shifts} 
                  setShifts={setShifts} 
                />
              } />
              
              <Route path="/reports" element={
                <HandoverReports backendData={backendData} />
              } />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
