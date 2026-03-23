import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: '2-Notable Calculator', icon: '⚔️' },
  { to: '/single', label: 'Single Notable', icon: '🎯' },
  { to: '/trade', label: 'Trade Templates', icon: '💰' },
];

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">💎</div>
          <h1 className="brand-title">Cluster Master</h1>
          <span className="brand-subtitle">PoE Cluster Jewel Tools</span>
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
          <p className="disclaimer">
            Not affiliated with Grinding Gear Games or Path of Exile.
          </p>
          <p className="credit">
            Logic based on{' '}
            <a
              href="https://github.com/TheodoreJBieber/PoEClusterJewelCalculator"
              target="_blank"
              rel="noreferrer"
            >
              TheodoreJBieber's Calculator
            </a>
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">{children}</main>
    </div>
  );
}
