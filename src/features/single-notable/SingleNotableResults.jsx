import { useState } from 'react';
import { buildMasterTradeUrl } from '../../data/calculator';
import { useTradeSettings } from '../../data/TradeSettingsContext';
import NotableTooltip from '../../components/ui/NotableTooltip';

export default function SingleNotableResults({ data, passiveCount = 8 }) {
  if (data.error) {
    return <div className="result-error">{data.error}</div>;
  }

  if (data.position === 'side') {
    return <SideResults data={data} passiveCount={passiveCount} />;
  }

  return <MiddleResults data={data} passiveCount={passiveCount} />;
}

function SideResults({ data, passiveCount = 8 }) {
  const [search, setSearch] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { settings } = useTradeSettings();

  const filtered = data.results.filter((r) =>
    r.partnerName.toLowerCase().includes(search.toLowerCase())
  );

  const displayed = showBreakdown ? filtered : filtered.slice(0, 25);

  // Collect ALL unique partner names for the master trade link
  const allPartnerNames = data.results.map((r) => r.partnerName);
  const masterUrl = buildMasterTradeUrl([data.notableName], allPartnerNames, settings, passiveCount);

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
                <NotableTooltip name={r.partnerName}>
                  <span className="notable-badge notable-badge--desired">
                    {r.partnerName}
                  </span>
                </NotableTooltip>
                <span className="pairing-card__meta">
                  ilvl {r.partner.Mod.Level} · {r.middleCount} middle option
                  {r.middleCount !== 1 ? 's' : ''}
                </span>
              </summary>
              <div className="pairing-card__body">
                <h5>Possible middles:</h5>
                <div className="notable-chips">
                  {r.middleNames.map((mn) => (
                    <NotableTooltip key={mn} name={mn}>
                      <span className="notable-chip notable-chip--middle">
                        {mn}
                      </span>
                    </NotableTooltip>
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

function MiddleResults({ data, passiveCount = 8 }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { settings } = useTradeSettings();

  const soloResult = data.results.find((r) => r.solo);
  const pairResults = data.results.filter((r) => !r.solo);

  // Collect all unique side names for master link (skip solo)
  const allSideNames = new Set();
  for (const r of pairResults) {
    allSideNames.add(r.sideName1);
    allSideNames.add(r.sideName3);
  }

  // Solo trade link: just the notable on any matching cluster
  const soloUrl = buildMasterTradeUrl([data.notableName], [], settings, passiveCount);
  // Pairs trade link
  const masterUrl = pairResults.length > 0
    ? buildMasterTradeUrl([data.notableName], [...allSideNames], settings, passiveCount)
    : null;

  const displayed = showBreakdown ? pairResults : pairResults.slice(0, 30);

  return (
    <div className="single-results">
      {/* Solo option — always valid */}
      {soloResult && (
        <div className="result-section">
          <a
            href={soloUrl}
            target="_blank"
            rel="noreferrer"
            className="trade-link trade-link--master"
          >
            <span className="trade-link__icon">⚡</span>
            <span className="trade-link__content">
              <strong>Search Solo (no side notables)</strong>
              <small>
                Find {passiveCount}-passive jewels with just {data.notableName} — auto-middle
              </small>
            </span>
            <span className="trade-link__arrow">↗</span>
          </a>
        </div>
      )}

      {/* Paired trade link */}
      {masterUrl && (
        <div className="result-section">
          <a
            href={masterUrl}
            target="_blank"
            rel="noreferrer"
            className="trade-link trade-link--master"
          >
            <span className="trade-link__icon">⚡</span>
            <span className="trade-link__content">
              <strong>Search with Side Pairs</strong>
              <small>
                Find cheapest jewel with {data.notableName} in the middle
                across {pairResults.length} valid side pairs
              </small>
            </span>
            <span className="trade-link__arrow">↗</span>
          </a>
        </div>
      )}

      <p className="single-results__summary">
        <strong>{data.notableName}</strong> can appear solo (auto-middle) or fit
        in the middle of <strong>{pairResults.length}</strong> side-notable pairs.
      </p>

      {/* Breakdown — collapsible */}
      {pairResults.length > 0 && (
        <details
          className="breakdown-section"
          open={showBreakdown}
          onToggle={(e) => setShowBreakdown(e.target.open)}
        >
          <summary className="breakdown-toggle">
            Breakdown by pair ({pairResults.length} combos)
          </summary>
          <div className="pairing-list">
            {displayed.map((r, idx) => (
              <div key={idx} className="pairing-row">
                <NotableTooltip name={r.sideName1}>
                  <span className="notable-badge notable-badge--desired">
                    {r.sideName1}
                  </span>
                </NotableTooltip>
                <span className="pairing-row__sep">+</span>
                <NotableTooltip name={r.sideName3}>
                  <span className="notable-badge notable-badge--desired">
                    {r.sideName3}
                  </span>
                </NotableTooltip>
              </div>
            ))}
          </div>

          {!showBreakdown && pairResults.length > 30 && (
            <button
              className="btn btn--ghost btn--full"
              onClick={() => setShowBreakdown(true)}
            >
              Show all {pairResults.length} pairs
            </button>
          )}
        </details>
      )}
    </div>
  );
}
