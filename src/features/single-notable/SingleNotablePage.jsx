import { useState } from 'react';
import NotableSearch from '../../components/ui/NotableSearch';
import SingleNotableResults from './SingleNotableResults';
import { calculateSingleNotable, sortOrderMap } from '../../data/calculator';

export default function SingleNotablePage() {
  const [selectedNotable, setSelectedNotable] = useState(null);
  const [position, setPosition] = useState('side');
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  function handleSelect(name) {
    setSelectedNotable(name);
    setResults(null);
  }

  function handleClear() {
    setSelectedNotable(null);
    setResults(null);
  }

  function handleCalculate() {
    if (!selectedNotable) return;
    setIsCalculating(true);
    // Use setTimeout to let the UI update before heavy calculation
    setTimeout(() => {
      const result = calculateSingleNotable(selectedNotable, position);
      setResults(result);
      setIsCalculating(false);
    }, 50);
  }

  const notableInfo = selectedNotable ? sortOrderMap[selectedNotable] : null;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Single Notable Explorer</h2>
        <p className="page-description">
          Choose one notable and explore where it can appear — on the side
          (position 1/3) or in the middle (position 2) — and see all valid
          pairings.
        </p>
      </div>

      <div className="calculator-layout">
        {/* Input Panel */}
        <div className="panel">
          <div className="panel-header">
            <h3>Choose a Notable</h3>
          </div>
          <div className="panel-body">
            {!selectedNotable ? (
              <NotableSearch
                onSelect={handleSelect}
                placeholder="Search for a notable…"
              />
            ) : (
              <div className="single-selected">
                <div className="single-selected__info">
                  <span className="notable-badge notable-badge--desired">
                    {selectedNotable}
                  </span>
                  {notableInfo && (
                    <span className="notable-ilvl">
                      ilvl {notableInfo.Mod.Level} ·{' '}
                      {notableInfo.Mod.CorrectGroup.includes('Suffix')
                        ? 'Suffix'
                        : 'Prefix'}
                    </span>
                  )}
                </div>
                <button className="btn btn--ghost btn--sm" onClick={handleClear}>
                  Change
                </button>
              </div>
            )}

            {/* Position selector */}
            {selectedNotable && (
              <div className="position-selector">
                <label className="position-label">I want this notable on:</label>
                <div className="position-options">
                  <button
                    className={`position-btn ${position === 'side' ? 'position-btn--active' : ''}`}
                    onClick={() => {
                      setPosition('side');
                      setResults(null);
                    }}
                  >
                    <span className="position-btn__icon">◆</span>
                    <span className="position-btn__text">
                      <strong>The Side</strong>
                      <small>Position 1 or 3 (desired)</small>
                    </span>
                  </button>
                  <button
                    className={`position-btn ${position === 'middle' ? 'position-btn--active' : ''}`}
                    onClick={() => {
                      setPosition('middle');
                      setResults(null);
                    }}
                  >
                    <span className="position-btn__icon">◇</span>
                    <span className="position-btn__text">
                      <strong>The Middle</strong>
                      <small>Position 2 (undesired, skip it)</small>
                    </span>
                  </button>
                </div>
              </div>
            )}

            {selectedNotable && (
              <button
                className="btn btn--primary btn--full"
                onClick={handleCalculate}
                disabled={isCalculating}
              >
                {isCalculating ? 'Calculating…' : 'Find Pairings'}
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="panel panel--results">
            <div className="panel-header">
              <h3>
                {position === 'side'
                  ? `Side pairings for ${selectedNotable}`
                  : `Middle pairings for ${selectedNotable}`}
              </h3>
              <span className="result-count">
                {results.results.length} result{results.results.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="panel-body">
              <SingleNotableResults data={results} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
