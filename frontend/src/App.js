import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentsPage from './components/StudentsPage';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="app-content">
        {activePage === 'dashboard' ? <Dashboard /> : <StudentsPage />}
      </main>
    </div>
  );
}

export default App;
