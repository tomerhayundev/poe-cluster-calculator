import { useState } from 'react';
import NotableSearch from '../../components/ui/NotableSearch';
import SelectedNotablesList from '../../components/ui/SelectedNotablesList';
import TwoNotableResults from './TwoNotableResults';
import { calculateTwoNotables } from '../../data/calculator';
import diagram from '../../assets/diagram.png';

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

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">2-Notable Calculator</h2>
        <p className="page-description">
          Find possible 'middle' notables on Large Cluster Jewels when you want
          two desirable notables but don't want to allocate the third.
        </p>
      </div>

      <div className="calculator-layout">
        {/* Input Panel */}
        <div className="panel">
          <div className="panel-header">
            <h3>Select Notables</h3>
          </div>
          <div className="panel-body">
            <div className="diagram-section">
              <img src={diagram} alt="Cluster jewel positions diagram" className="diagram-img" />
              <div className="diagram-legend">
                <span className="legend-item legend-item--desired">1 & 3 = Desired</span>
                <span className="legend-item legend-item--middle">2 = Undesired middle</span>
              </div>
            </div>

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

            <button
              className="btn btn--primary btn--full"
              onClick={handleCalculate}
              disabled={enabledCount < 2}
            >
              {enabledCount < 2
                ? `Select ${2 - enabledCount} more notable${2 - enabledCount > 1 ? 's' : ''}`
                : `Calculate (${enabledCount} selected)`}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        {results && (
          <div className="panel panel--results">
            <div className="panel-header">
              <h3>Results</h3>
            </div>
            <div className="panel-body">
              <TwoNotableResults data={results} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
