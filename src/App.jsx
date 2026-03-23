import { useEffect, useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { initData } from './data/calculator';
import Layout from './components/layout/Layout';
import TwoNotablePage from './features/two-notable/TwoNotablePage';
import TradeTemplatesPage from './features/trade-templates/TradeTemplatesPage';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initData();
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading cluster jewel data…</p>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TwoNotablePage />} />
        <Route path="/trade" element={<TradeTemplatesPage />} />
      </Routes>
    </Layout>
  );
}
