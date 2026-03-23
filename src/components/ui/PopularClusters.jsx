import { useState } from 'react';
import { usePrices } from '../../data/PriceContext';
import { getTopClusters, formatPrice } from '../../data/priceService';
import NotableTooltip from './NotableTooltip';

/**
 * Shows top 5 popular/expensive cluster jewels from poe.ninja.
 * Clicking a card populates the calculator with those notables.
 */
export default function PopularClusters({ onSelectNotables }) {
  const { priceMap, loading, error } = usePrices();
  const [sortBy, setSortBy] = useState('listings');

  if (loading) {
    return (
      <div className="popular-section">
        <div className="popular-header">
          <span className="section-icon">◆</span>
          <h3 className="section-title">Popular Clusters</h3>
        </div>
        <div className="popular-loading">Loading prices…</div>
      </div>
    );
  }

  if (!priceMap || error) {
    return null; // Silently hide if prices unavailable
  }

  const top = getTopClusters(priceMap, sortBy, 5);
  if (top.length === 0) return null;

  return (
    <div className="popular-section">
      <div className="popular-header">
        <span className="section-icon">◆</span>
        <h3 className="section-title">Popular Clusters</h3>
        <div className="popular-sort">
          <button
            className={`popular-sort-btn ${sortBy === 'listings' ? 'popular-sort-btn--active' : ''}`}
            onClick={() => setSortBy('listings')}
          >
            Most Listed
          </button>
          <button
            className={`popular-sort-btn ${sortBy === 'price' ? 'popular-sort-btn--active' : ''}`}
            onClick={() => setSortBy('price')}
          >
            Most Expensive
          </button>
        </div>
      </div>
      <div className="popular-list">
        {top.map((entry, i) => (
          <button
            key={i}
            className="popular-card"
            onClick={() => {
              if (onSelectNotables && entry.notables.length >= 2) {
                onSelectNotables(entry.notables);
              }
            }}
            title="Click to load these notables"
          >
            <div className="popular-card__notables">
              {entry.notables.map((name) => (
                <NotableTooltip key={name} name={name}>
                  <span className="popular-card__notable">{name}</span>
                </NotableTooltip>
              ))}
            </div>
            <div className="popular-card__meta">
              <span className="price-badge">
                ~{formatPrice(entry.chaosValue, entry.divineValue)}
              </span>
              {entry.sparkline !== 0 && (
                <span className={`price-trend ${entry.sparkline > 0 ? 'price-trend--up' : 'price-trend--down'}`}>
                  {entry.sparkline > 0 ? '↑' : '↓'}{Math.abs(Math.round(entry.sparkline))}%
                </span>
              )}
              <span className="popular-card__listings">
                {entry.listingCount} listed
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
