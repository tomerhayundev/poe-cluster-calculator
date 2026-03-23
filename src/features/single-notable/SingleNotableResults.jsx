import { useState } from 'react';

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
  const [showAll, setShowAll] = useState(false);

  const filtered = data.results.filter((r) =>
    r.partnerName.toLowerCase().includes(search.toLowerCase())
  );

  const displayed = showAll ? filtered : filtered.slice(0, 25);

  return (
    <div className="single-results">
      <p className="single-results__summary">
        <strong>{data.notableName}</strong> can be paired on the side with{' '}
        <strong>{data.results.length}</strong> other notables.
      </p>

      {data.results.length > 10 && (
        <input
          type="text"
          className="notable-search__input"
          placeholder="Filter partners…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      {!showAll && filtered.length > 25 && (
        <button
          className="btn btn--ghost btn--full"
          onClick={() => setShowAll(true)}
        >
          Show all {filtered.length} results
        </button>
      )}
    </div>
  );
}

function MiddleResults({ data }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? data.results : data.results.slice(0, 30);

  return (
    <div className="single-results">
      <p className="single-results__summary">
        <strong>{data.notableName}</strong> can fit in the middle of{' '}
        <strong>{data.results.length}</strong> side-notable pairs.
      </p>

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

      {!showAll && data.results.length > 30 && (
        <button
          className="btn btn--ghost btn--full"
          onClick={() => setShowAll(true)}
        >
          Show all {data.results.length} pairs
        </button>
      )}
    </div>
  );
}
