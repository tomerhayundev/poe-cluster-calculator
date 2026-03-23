import { NavLink, useLocation } from 'react-router-dom';
import TradeSettings from '../ui/TradeSettings';
import { useTradeSettings } from '../../data/TradeSettingsContext';
import { APP_VERSION } from '../../data/version';

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
  const { settings } = useTradeSettings();

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">CM</span>
          <div>
            <h1 className="brand-title">Cluster<br/>Master</h1>
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
          <p className="sidebar-footer__credit">
            Created by{' '}
            <a href="https://poe.tichoh.com" target="_blank" rel="noreferrer">Tichoh</a>
          </p>
          <p className="sidebar-footer__credit">
            Logic by{' '}
            <a href="https://github.com/TheodoreJBieber/PoEClusterJewelCalculator" target="_blank" rel="noreferrer">TheodoreJBieber</a>
          </p>
          <p className="sidebar-footer__disclaimer">No affiliation with GGG</p>
          <p className="sidebar-footer__version">v{APP_VERSION}</p>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-area">
        <header className="topbar">
          <h2 className="topbar-title">{pageTitle}</h2>
          <div className="topbar-right">
            <TradeSettings />
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

        <main className="main-content">{children}</main>

        {/* Footer */}
        <footer className="app-footer">
          <span className="footer-league">{settings.league} League</span>
        </footer>
      </div>
    </div>
  );
}
