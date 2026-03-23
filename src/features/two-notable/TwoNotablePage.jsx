import { useState } from 'react';
import NotableSearch from '../../components/ui/NotableSearch';
import SelectedNotablesList from '../../components/ui/SelectedNotablesList';
import TwoNotableResults from './TwoNotableResults';
import SingleNotableResults from '../single-notable/SingleNotableResults';
import { calculateTwoNotables, calculateSingleNotable } from '../../data/calculator';
import ClusterDiagram from '../../components/ui/ClusterDiagram';

export default function TwoNotablePage() {
  const [selected, setSelected] = useState([]);
  const [disabled, setDisabled] = useState([]);
  const [results, setResults] = useState(null);
  const [singlePosition, setSinglePosition] = useState('side');
  const [isCalculating, setIsCalculating] = useState(false);

  function addNotable(name) {
    if (!selected.includes(name)) {
      setSelected((prev) => [...prev, name]);
      setResults(null);
    }
  }

  function removeNotable(name) {
    setSelected((prev) => prev.filter((n) => n !== name));
    setDisabled((prev) => prev.filter((n) => n !== name));
    setResults(null);
  }

  function toggleNotable(name) {
    setDisabled((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
    setResults(null);
  }

  function handleCalculate() {
    const enabled = selected.filter((n) => !disabled.includes(n));
    if (enabled.length === 0) return;

    if (enabled.length === 1) {
      // Single notable mode
      setIsCalculating(true);
      setTimeout(() => {
        const result = calculateSingleNotable(enabled[0], singlePosition);
        setResults({ mode: 'single', data: result });
        setIsCalculating(false);
      }, 50);
    } else {
      // Multi notable mode (original)
      const result = calculateTwoNotables(enabled);
      setResults({ mode: 'multi', data: result });
    }
  }

  const enabledCount = selected.filter((n) => !disabled.includes(n)).length;
  const isSingleMode = enabledCount === 1;
  const validResults = results?.mode === 'multi'
    ? results.data?.results?.filter((r) => r.success) || []
    : results?.data?.results || [];

  return (
    <div className="page">
      {/* Hero Section */}
      <div className="hero-row">
        <div className="hero-main">
          <div className="hero-label">Cluster Jewel Analysis</div>
          <h1 className="hero-title">Find Your<br />Perfect Middle</h1>
          <p className="hero-desc">
            {isSingleMode
              ? 'One notable selected — choose where you want it positioned, then calculate.'
              : 'Select desired notables for positions 1 & 3. The calculator finds all valid position 2 notables and generates trade links.'}
          </p>
          <div className="hero-stats">
            <div className="stat-block">
              <span className="stat-label">Selected</span>
              <span className="stat-value">{selected.length}</span>
            </div>
            <div className="stat-block">
              <span className="stat-label">Enabled</span>
              <span className="stat-value">{enabledCount}</span>
            </div>
            {results && (
              <div className="stat-block">
                <span className="stat-label">Results</span>
                <span className="stat-value stat-value--accent">{validResults.length}</span>
              </div>
            )}
          </div>
        </div>

        <div className="hero-side">
          <div className="diagram-card">
            <ClusterDiagram size={160} />
            <div className="diagram-legend">
              <span className="legend-item legend-item--desired">1 & 3 = Desired</span>
              <span className="legend-item legend-item--middle">2 = Undesired</span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="section">
        <div className="section-header">
          <span className="section-icon">◆</span>
          <h3 className="section-title">Notable Selection</h3>
        </div>

        <div className="input-grid">
          <div className="input-main">
            <NotableSearch
              onSelect={addNotable}
              currentlySelected={selected}
              placeholder="Search and add a notable…"
            />
            <SelectedNotablesList
              selected={selected}
              disabled={disabled}
              onRemove={removeNotable}
              onToggle={toggleNotable}
            />
          </div>

          <div className="input-action">
            {/* Single notable position selector */}
            {isSingleMode && (
              <div className="position-selector">
                <label className="position-label">I want this notable on:</label>
                <div className="position-options">
                  <button
                    className={`position-btn ${singlePosition === 'side' ? 'position-btn--active' : ''}`}
                    onClick={() => {
                      setSinglePosition('side');
                      setResults(null);
                    }}
                  >
                    <span className="position-btn__icon">◆</span>
                    <span className="position-btn__text">
                      <strong>Side (1 or 3)</strong>
                      <small>Desired position — needs a companion</small>
                    </span>
                  </button>
                  <button
                    className={`position-btn ${singlePosition === 'middle' ? 'position-btn--active' : ''}`}
                    onClick={() => {
                      setSinglePosition('middle');
                      setResults(null);
                    }}
                  >
                    <span className="position-btn__icon">◇</span>
                    <span className="position-btn__text">
                      <strong>Middle (2)</strong>
                      <small>Top position — find side pairs</small>
                    </span>
                  </button>
                </div>
              </div>
            )}

            <button
              className="btn btn--primary btn--full"
              onClick={handleCalculate}
              disabled={enabledCount < 1 || isCalculating}
            >
              {isCalculating
                ? 'Calculating…'
                : enabledCount === 0
                  ? 'Select a notable'
                  : enabledCount === 1
                    ? `Find ${singlePosition === 'side' ? 'Side' : 'Middle'} Pairings`
                    : 'Calculate'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="section section--results">
          <div className="section-header">
            <span className="section-icon section-icon--active">◆</span>
            <h3 className="section-title">
              {results.mode === 'single'
                ? `${singlePosition === 'side' ? 'Side' : 'Middle'} Pairings`
                : 'Analysis Results'}
            </h3>
            <div className="section-tabs">
              <span className="tab-pill tab-pill--active">
                {validResults.length} Result{validResults.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {results.data?.error && (
            <div className="error-banner">{results.data.error}</div>
          )}

          {results.mode === 'single' ? (
            <SingleNotableResults data={results.data} />
          ) : (
            <TwoNotableResults data={results.data} />
          )}
        </div>
      )}
    </div>
  );
}
