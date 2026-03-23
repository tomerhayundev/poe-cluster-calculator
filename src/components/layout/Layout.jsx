import { NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Calculator', icon: '◆' },
  { to: '/trade', label: 'Trade', icon: '⬡' },
];

function getPageTitle(pathname) {
  switch (pathname) {
    case '/trade': return 'Trade Templates';
    default: return 'Cluster Jewel Calculator';
  }
}

export default function Layout({ children }) {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="app-shell">
      {/* Narrow Sidebar — "Command Rail" */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">CM</span>
          <div>
            <h1 className="brand-title">Cluster<br/>Master</h1>
            <span className="brand-version">v1.0</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link--active' : ''}`
              }
              end={item.to === '/'}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status">
            <span className="status-dot"></span>
            <span>Online</span>
          </div>
          <p className="disclaimer">
            No affiliation with GGG
          </p>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-area">
        {/* Top Bar */}
        <header className="topbar">
          <h2 className="topbar-title">{pageTitle}</h2>
          <div className="topbar-actions">
            <a
              href="https://github.com/tomerhayundev/poe-cluster-calculator"
              target="_blank"
              rel="noreferrer"
              className="topbar-btn"
              title="GitHub"
            >
              ⟐
            </a>
          </div>
        </header>

        {/* Content */}
        <main className="main-content">{children}</main>

        {/* Footer */}
        <footer className="app-footer">
          <span className="footer-status">
            <span className="status-dot"></span> Data: Settlers League
          </span>
          <span className="footer-credit">
            Logic:{' '}
            <a href="https://github.com/TheodoreJBieber/PoEClusterJewelCalculator" target="_blank" rel="noreferrer">
              TheodoreJBieber
            </a>
          </span>
        </footer>
      </div>
    </div>
  );
}
