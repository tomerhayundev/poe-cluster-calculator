import { useState } from 'react';
import { buildMasterTradeUrl } from '../../data/calculator';

export default function SingleNotableResults({ data }) {
  if (data.error) {
    return <div className="result-error">{data.error}</div>;
  }

  if (data.position === 'side') {
    return <SideResults data={data} />;
  }

  return <MiddleResults data={data} />;
}

function SideResults({ data }) {
  const [search, setSearch] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);

  const filtered = data.results.filter((r) =>
    r.partnerName.toLowerCase().includes(search.toLowerCase())
  );

  const displayed = showBreakdown ? filtered : filtered.slice(0, 25);

  // Collect ALL unique partner names for the master trade link
  const allPartnerNames = data.results.map((r) => r.partnerName);
  const masterUrl = buildMasterTradeUrl([data.notableName], allPartnerNames);

  return (
    <div className="single-results">
      {/* MASTER Trade Link */}
      <div className="result-section">
        <a
          href={masterUrl}
          target="_blank"
          rel="noreferrer"
          className="trade-link trade-link--master"
        >
          <span className="trade-link__icon">⚡</span>
          <span className="trade-link__content">
            <strong>Search Trade</strong>
            <small>
              Find cheapest jewel with {data.notableName} on a side position
              across {data.results.length} valid companions
            </small>
          </span>
          <span className="trade-link__arrow">↗</span>
        </a>
      </div>

      <p className="single-results__summary">
        <strong>{data.notableName}</strong> can be paired on the side with{' '}
        <strong>{data.results.length}</strong> other notables.
      </p>

      {/* Breakdown — collapsible */}
      <details
        className="breakdown-section"
        open={showBreakdown}
        onToggle={(e) => setShowBreakdown(e.target.open)}
      >
        <summary className="breakdown-toggle">
          Breakdown by companion ({data.results.length} options)
        </summary>

        {data.results.length > 10 && (
          <input
            type="text"
            className="notable-search__input"
            placeholder="Filter partners…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ margin: '12px 0' }}
          />
        )}

        <div className="pairing-list">
          {displayed.map((r) => (
            <details key={r.partnerName} className="pairing-card">
              <summary className="pairing-card__header">
                <span className="notable-badge notable-badge--desired">
                  {r.partnerName}
                </span>
                <span className="pairing-card__meta">
                  ilvl {r.partner.Mod.Level} · {r.middleCount} middle option
                  {r.middleCount !== 1 ? 's' : ''}
                </span>
              </summary>
              <div className="pairing-card__body">
                <h5>Possible middles:</h5>
                <div className="notable-chips">
                  {r.middleNames.map((mn) => (
                    <span key={mn} className="notable-chip notable-chip--middle">
                      {mn}
                    </span>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>

        {!showBreakdown && filtered.length > 25 && (
          <button
            className="btn btn--ghost btn--full"
            onClick={() => setShowBreakdown(true)}
          >
            Show all {filtered.length} results
          </button>
        )}
      </details>
    </div>
  );
}

function MiddleResults({ data }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Collect all unique side names for master link
  const allSideNames = new Set();
  for (const r of data.results) {
    allSideNames.add(r.sideName1);
    allSideNames.add(r.sideName3);
  }
  const masterUrl = buildMasterTradeUrl([data.notableName], [...allSideNames]);

  const displayed = showBreakdown ? data.results : data.results.slice(0, 30);

  return (
    <div className="single-results">
      {/* MASTER Trade Link */}
      <div className="result-section">
        <a
          href={masterUrl}
          target="_blank"
          rel="noreferrer"
          className="trade-link trade-link--master"
        >
          <span className="trade-link__icon">⚡</span>
          <span className="trade-link__content">
            <strong>Search Trade</strong>
            <small>
              Find cheapest jewel with {data.notableName} in the middle
              across {data.results.length} valid side pairs
            </small>
          </span>
          <span className="trade-link__arrow">↗</span>
        </a>
      </div>

      <p className="single-results__summary">
        <strong>{data.notableName}</strong> can fit in the middle of{' '}
        <strong>{data.results.length}</strong> side-notable pairs.
      </p>

      {/* Breakdown — collapsible */}
      <details
        className="breakdown-section"
        open={showBreakdown}
        onToggle={(e) => setShowBreakdown(e.target.open)}
      >
        <summary className="breakdown-toggle">
          Breakdown by pair ({data.results.length} combos)
        </summary>
        <div className="pairing-list">
          {displayed.map((r, idx) => (
            <div key={idx} className="pairing-row">
              <span className="notable-badge notable-badge--desired">
                {r.sideName1}
              </span>
              <span className="pairing-row__sep">+</span>
              <span className="notable-badge notable-badge--desired">
                {r.sideName3}
              </span>
            </div>
          ))}
        </div>

        {!showBreakdown && data.results.length > 30 && (
          <button
            className="btn btn--ghost btn--full"
            onClick={() => setShowBreakdown(true)}
          >
            Show all {data.results.length} pairs
          </button>
        )}
      </details>
    </div>
  );
}
