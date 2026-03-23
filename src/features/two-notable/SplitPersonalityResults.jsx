import { useState } from 'react';
import {
  buildMasterTradeUrl,
  buildTradeUrl3n2d,
  getEnchantKey,
  enchantMap,
  includesEnchant,
  getValidEnchants,
} from '../../data/calculator';
import { useTradeSettings } from '../../data/TradeSettingsContext';
import NotableTooltip from '../../components/ui/NotableTooltip';

export default function SplitPersonalityResults({ data, passiveCount = 8 }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { settings } = useTradeSettings();

  if (data.error) {
    return <div className="result-error">{data.error}</div>;
  }

  const { sideNotableName, middleNotableName, sideNotable, middleNotable, results } = data;

  // All "other side" notable names for master trade link
  const otherSideNames = results.map((r) => r.otherSideName);

  // Master trade link: side + middle are required, any other-side is optional (count >= 1)
  // We want: AND(side, middle) + COUNT(otherSides, min:1)
  const masterUrl = buildMasterTradeUrl(
    [sideNotableName, middleNotableName],
    otherSideNames,
    settings,
    passiveCount
  );

  const displayed = showBreakdown ? results : results.slice(0, 30);

  return (
    <div className="split-results">
      {/* Notable pair display */}
      <div className="result-pair">
        <div className="result-notable">
          <NotableTooltip name={sideNotableName}>
            <span className="notable-badge notable-badge--desired">{sideNotableName}</span>
          </NotableTooltip>
          <span className="notable-ilvl">ilvl {sideNotable.Mod.Level}</span>
          <span className="notable-pos-tag notable-pos-tag--side">Side</span>
        </div>
        <span className="result-separator">+</span>
        <div className="result-notable">
          <NotableTooltip name={middleNotableName}>
            <span className="notable-badge notable-badge--split-middle">{middleNotableName}</span>
          </NotableTooltip>
          <span className="notable-ilvl">ilvl {middleNotable.Mod.Level}</span>
          <span className="notable-pos-tag notable-pos-tag--middle">Middle</span>
        </div>
      </div>

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
              Find cheapest {passiveCount}-passive jewel across {otherSideNames.length} valid other-side options
            </small>
          </span>
          <span className="trade-link__arrow">↗</span>
        </a>
      </div>

      {/* Other side options */}
      <div className="result-section">
        <h4 className="result-section__title">
          Other Side Options ({results.length})
        </h4>
        <div className="notable-chips">
          {results.slice(0, 20).map((r) => (
            <NotableTooltip key={r.otherSideName} name={r.otherSideName}>
              <span className="notable-chip notable-chip--desired">
                {r.otherSideName}
                <span className="notable-chip__ilvl">ilvl {r.otherSide.Mod.Level}</span>
              </span>
            </NotableTooltip>
          ))}
          {results.length > 20 && (
            <span className="notable-chip notable-chip--more">
              +{results.length - 20} more
            </span>
          )}
        </div>
      </div>

      {/* Breakdown */}
      <details
        className="breakdown-section"
        open={showBreakdown}
        onToggle={(e) => setShowBreakdown(e.target.open)}
      >
        <summary className="breakdown-toggle">
          Breakdown by other-side notable ({results.length} options)
        </summary>
        <div className="pairing-list">
          {displayed.map((r) => {
            const url = buildMasterTradeUrl(
              [sideNotableName, middleNotableName, r.otherSideName],
              [],
              settings,
              passiveCount
            );

            return (
              <div key={r.otherSideName} className="pairing-row">
                <span className="notable-badge notable-badge--desired">
                  {r.otherSideName}
                </span>
                <span className="pairing-row__meta">
                  ilvl {r.minLvl}–{r.maxLvl}
                </span>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="pairing-row__trade"
                >
                  Trade ↗
                </a>
              </div>
            );
          })}
        </div>

        {!showBreakdown && results.length > 30 && (
          <button
            className="btn btn--ghost btn--full"
            onClick={() => setShowBreakdown(true)}
          >
            Show all {results.length} options
          </button>
        )}
      </details>
    </div>
  );
}
