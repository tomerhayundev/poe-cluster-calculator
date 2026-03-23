import { useState } from 'react';
import NotableSearch from '../../components/ui/NotableSearch';
import SelectedNotablesList from '../../components/ui/SelectedNotablesList';
import TwoNotableResults from './TwoNotableResults';
import { calculateTwoNotables } from '../../data/calculator';
import ClusterDiagram from '../../components/ui/ClusterDiagram';

export default function TwoNotablePage() {
  const [selected, setSelected] = useState([]);
  const [disabled, setDisabled] = useState([]);
  const [results, setResults] = useState(null);

  function addNotable(name) {
    if (!selected.includes(name)) {
      setSelected((prev) => [...prev, name]);
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
  }

  function handleCalculate() {
    const enabled = selected.filter((n) => !disabled.includes(n));
    const result = calculateTwoNotables(enabled);
    setResults(result);
  }

  const enabledCount = selected.filter((n) => !disabled.includes(n)).length;
  const validResults = results?.results?.filter((r) => r.success) || [];

  return (
    <div className="page">
      {/* Hero Section — asymmetric 2-column */}
      <div className="hero-row">
        <div className="hero-main">
          <div className="hero-label">Cluster Jewel Analysis</div>
          <h1 className="hero-title">Find Your<br />Perfect Middle</h1>
          <p className="hero-desc">
            Select two desired notables for positions 1 & 3.
            The calculator finds all valid position 2 notables
            and generates trade links.
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
            <button
              className="btn btn--primary btn--full"
              onClick={handleCalculate}
              disabled={enabledCount < 2}
            >
              {enabledCount < 2
                ? `Select ${2 - enabledCount} more`
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
            <h3 className="section-title">Analysis Results</h3>
            <div className="section-tabs">
              <span className="tab-pill tab-pill--active">All</span>
              <span className="tab-pill">{validResults.length} Valid</span>
              {results.results.filter((r) => !r.success).length > 0 && (
                <span className="tab-pill">
                  {results.results.filter((r) => !r.success).length} Failed
                </span>
              )}
            </div>
          </div>
          <TwoNotableResults data={results} />
        </div>
      )}
    </div>
  );
}
