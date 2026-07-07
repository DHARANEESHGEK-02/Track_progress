import React from 'react';

// Static list of nav destinations. Adding a new page later just means
// adding an entry here and a matching case in App.js's renderPage().
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', glyph: '01' },
  { id: 'students', label: 'Student Register', glyph: '02' },
];

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">§</span>
        <div>
          <div className="sidebar-brand-title">Registrar</div>
          <div className="sidebar-brand-sub">Student Records System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-nav-glyph">{item.glyph}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-line" />
        <span>Academic Year 2026&ndash;27</span>
      </div>
    </aside>
  );
}

export default Sidebar;
