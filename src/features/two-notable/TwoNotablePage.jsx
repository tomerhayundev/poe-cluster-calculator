import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import NotableSearch from '../../components/ui/NotableSearch';
import SelectedNotablesList from '../../components/ui/SelectedNotablesList';
import TwoNotableResults from './TwoNotableResults';
import SingleNotableResults from '../single-notable/SingleNotableResults';
import SplitPersonalityResults from './SplitPersonalityResults';
import { calculateTwoNotables, calculateSingleNotable, calculateSplitAuto, getValidMiddlesForSide, getValidSidesForMiddle, getValidPairsForSide } from '../../data/calculator';
import ClusterDiagram from '../../components/ui/ClusterDiagram';
import PopularClusters from '../../components/ui/PopularClusters';
import Toast from '../../components/ui/Toast';
import HelpTip from '../../components/ui/HelpTip';
import { readUrlState, buildShareUrl, copyToClipboard } from '../../hooks/useUrlState';

const MODES = [
  { value: 'two-sides', label: 'Two Sides' },
  { value: 'split', label: 'Side + Middle' },
  { value: 'single', label: 'Single Notable' },
];

const PASSIVE_COUNTS = [8, 9, 10, 11, 12];

export default function TwoNotablePage() {
  // Mode state
  const [mode, setMode] = useState('two-sides');
  const [passiveCount, setPassiveCount] = useState(8);

  // Two Sides mode state
  const [selected, setSelected] = useState([]);
  const [disabled, setDisabled] = useState([]);

  // Single notable mode state
  const [singlePosition, setSinglePosition] = useState('side');

  // Split Personality mode state — just an ordered list of picks (up to 3)
  const [splitPicks, setSplitPicks] = useState([]);
  const [smartMode, setSmartMode] = useState(true);

  // Shared state
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [toast, setToast] = useState(null);
  const initializedFromUrl = useRef(false);

  // Load state from URL hash on mount
  useEffect(() => {
    if (initializedFromUrl.current) return;
    const urlState = readUrlState();
    if (!urlState) return;
    initializedFromUrl.current = true;

    setMode(urlState.mode);
    setPassiveCount(urlState.passiveCount);

    if (urlState.mode === 'two-sides' && urlState.selected) {
      setSelected(urlState.selected);
    } else if (urlState.mode === 'split') {
      setSplitPicks([urlState.splitSide, urlState.splitMiddle, urlState.splitThird].filter(Boolean));
    } else if (urlState.mode === 'single' && urlState.selected) {
      setSelected(urlState.selected);
      setSinglePosition(urlState.singlePosition || 'side');
    }
    // Clear the hash after loading
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  // --- Smart Mode filtering ---
  // Split Personality — after first pick, filter to valid companions
  const allowedSplitNext = useMemo(() => {
    if (!smartMode || splitPicks.length === 0) return null;
    if (splitPicks.length === 1) {
      // Second pick: any notable that can form a valid trio with the first
      return getValidPairsForSide(splitPicks[0]);
    }
    // Third pick is optional and unfiltered (results will validate)
    return null;
  }, [smartMode, splitPicks.join(',')]);

  // Two Sides — after first notable selected, filter to valid pairs
  const enabled = selected.filter((n) => !disabled.includes(n));
  const allowedTwoSides = useMemo(() => {
    if (!smartMode || enabled.length === 0) return null;
    let pool = null;
    for (const name of enabled) {
      const pairs = getValidPairsForSide(name);
      if (!pool) {
        pool = new Set(pairs);
      } else {
        pool = new Set(pairs.filter((p) => pool.has(p)));
      }
    }
    return pool ? [...pool] : null;
  }, [smartMode, enabled.join(',')]);

  // --- Two Sides handlers ---
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

  // --- Mode switch ---
  function handleModeChange(newMode) {
    setMode(newMode);
    setResults(null);
  }

  // --- Calculate ---
  function handleCalculate() {
    if (mode === 'split') {
      if (splitPicks.length < 2) return;
      setIsCalculating(true);
      setTimeout(() => {
        const result = calculateSplitAuto(splitPicks[0], splitPicks[1], splitPicks[2] || null);
        setResults({ mode: 'split', data: result });
        setIsCalculating(false);
      }, 50);
      return;
    }

    const enabled = selected.filter((n) => !disabled.includes(n));
    if (enabled.length === 0) return;

    if (mode === 'single') {
      setIsCalculating(true);
      setTimeout(() => {
        const result = calculateSingleNotable(enabled[0], singlePosition);
        setResults({ mode: 'single', data: result });
        setIsCalculating(false);
      }, 50);
    } else {
      if (enabled.length < 2) return;
      const result = calculateTwoNotables(enabled);
      setResults({ mode: 'multi', data: result });
    }
  }

  // --- Share handler ---
  async function handleShare() {
    const enabled = selected.filter((n) => !disabled.includes(n));
    const url = buildShareUrl({
      mode,
      selected: enabled,
      splitSide: splitPicks[0] || null,
      splitMiddle: splitPicks[1] || null,
      splitThird: splitPicks[2] || null,
      singlePosition,
      passiveCount,
    });
    const ok = await copyToClipboard(url);
    setToast(ok ? 'Link copied!' : 'Failed to copy');
  }

  // --- Derived state ---
  const enabledCount = enabled.length;
  const isSingleMode = mode === 'single';
  const validResults = results?.mode === 'multi'
    ? results.data?.results?.filter((r) => r.success) || []
    : results?.data?.results || [];

  // Can we calculate?
  let canCalculate = false;
  if (mode === 'split') {
    canCalculate = splitPicks.length >= 2;
  } else if (mode === 'single') {
    canCalculate = enabledCount >= 1;
  } else {
    canCalculate = enabledCount >= 2;
  }

  // Button label
  let buttonLabel = 'Select a notable';
  if (mode === 'split') {
    if (splitPicks.length >= 2) buttonLabel = 'Calculate';
    else buttonLabel = `Select ${2 - splitPicks.length} more notable${splitPicks.length === 1 ? '' : 's'}`;
  } else if (mode === 'single') {
    if (enabledCount === 0) buttonLabel = 'Select a notable';
    else buttonLabel = `Find ${singlePosition === 'side' ? 'Side' : 'Middle'} Pairings`;
  } else {
    if (enabledCount < 2) buttonLabel = 'Select 2 notables';
    else buttonLabel = 'Calculate';
  }

  // Diagram mode
  let diagramMode = 'two-sides';
  if (mode === 'split') diagramMode = 'split';
  else if (isSingleMode && singlePosition === 'middle') diagramMode = 'single-middle';

  const [topbarSlot, setTopbarSlot] = useState(null);
  useEffect(() => {
    setTopbarSlot(document.getElementById('topbar-slot'));
  }, []);

  return (
    <div className="page-columns">
      {/* Smart/Sandbox toggle in topbar via portal */}
      {topbarSlot && createPortal(
        <div className="smart-toggle-header">
          <div className="smart-toggle">
            <button
              className={`smart-toggle__btn ${smartMode ? 'smart-toggle__btn--active' : ''}`}
              onClick={() => setSmartMode(true)}
            >Smart</button>
            <button
              className={`smart-toggle__btn ${!smartMode ? 'smart-toggle__btn--active' : ''}`}
              onClick={() => setSmartMode(false)}
            >Sandbox</button>
          </div>
          <HelpTip text="Smart filters dropdowns to only show valid combinations. Sandbox shows all notables without restrictions." />
        </div>,
        topbarSlot
      )}

      {/* LEFT COLUMN — Input */}
      <div className="col-input">
        {/* Block 1: Hero (title only) */}
        <div className="hero-block">
          <div className="hero-label">Cluster Jewel Analysis</div>
          <h1 className="hero-title">Find Your Perfect Middle</h1>
          <p className="hero-desc">
            {mode === 'split'
              ? 'Pick a side + middle notable to find valid completions.'
              : isSingleMode
                ? 'One notable selected — choose position, then calculate.'
                : 'Select notables for positions 1 & 3 to find valid middles.'}
          </p>
        </div>

        {/* Block 2: Mode Setup (controls + diagram side by side) */}
        <div className="section">
          <div className="section-header">
            <span className="section-icon">◆</span>
            <h3 className="section-title">Mode</h3>
            <HelpTip text="Two Sides: pick positions 1 & 3. Side + Middle (Split Personality): pick one of each, tool finds the third. Single Notable: explore options for one." />
          </div>
          <div className="mode-setup">
            <div className="mode-setup__controls">
              <div className="mode-toggle">
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    className={`mode-btn ${mode === m.value ? 'mode-btn--active' : ''}`}
                    onClick={() => handleModeChange(m.value)}
                  >
                    <span className="mode-btn__label">{m.label}</span>
                  </button>
                ))}
              </div>

              <div className="passive-count-row">
                <div className="passive-count-row__header">
                  <HelpTip text="Number of passive skills on the cluster jewel. Affects trade search filters and the diagram layout." />
                  <label className="passive-count-label">Passives</label>
                </div>
                <div className="passive-count-options">
                  {PASSIVE_COUNTS.map((n) => (
                    <button
                      key={n}
                      className={`passive-btn ${passiveCount === n ? 'passive-btn--active' : ''}`}
                      onClick={() => { setPassiveCount(n); setResults(null); }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position selector — Single Notable only */}
              {isSingleMode && (
                <div className="position-selector">
                  <div className="position-selector__header">
                    <HelpTip text="Side (1 or 3) means the notable is on the outer ring. Middle (2) means it sits between two side notables — or alone as auto-middle." />
                    <label className="position-label">Position</label>
                  </div>
                  <div className="position-options">
                    <button
                      className={`position-btn ${singlePosition === 'side' ? 'position-btn--active' : ''}`}
                      onClick={() => { setSinglePosition('side'); setResults(null); }}
                    >
                      Side (1 or 3)
                    </button>
                    <button
                      className={`position-btn ${singlePosition === 'middle' ? 'position-btn--active' : ''}`}
                      onClick={() => { setSinglePosition('middle'); setResults(null); }}
                    >
                      Middle (2)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mode-setup__diagram">
              <ClusterDiagram size={180} mode={diagramMode} passiveCount={passiveCount} />
              <div className="diagram-legend-compact">
                {mode === 'split' ? (
                  <>
                    <span className="legend-item">1 & 2 = Desired</span>
                    <span className="legend-item">3 = Undesired</span>
                  </>
                ) : (
                  <>
                    <span className="legend-item">1 & 3 = Desired</span>
                    <span className="legend-item">2 = Undesired</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Block 3: Notable Selection */}
        <div className="section">
          <div className="section-header">
            <span className="section-icon">◆</span>
            <h3 className="section-title">Notable Selection</h3>
            {mode !== 'split' && enabledCount > 0 && (
              <span className="notable-count-badge">
                {enabledCount} active
              </span>
            )}
          </div>

          {mode === 'split' ? (
            <div className="split-inputs">
              {splitPicks.length < 3 && (
                <NotableSearch
                  onSelect={(name) => {
                    setSplitPicks((prev) => [...prev, name]);
                    setResults(null);
                  }}
                  currentlySelected={splitPicks}
                  placeholder={
                    splitPicks.length === 0 ? 'Search first notable…'
                    : splitPicks.length === 1 ? 'Search second notable…'
                    : 'Search third notable (optional)…'
                  }
                  allowedNames={allowedSplitNext}
                />
              )}
              {splitPicks.length > 0 && (
                <div className="split-selected-list">
                  {splitPicks.map((name, i) => (
                    <div className="split-selected" key={name}>
                      <span className={`split-role-tag ${i < 2 ? 'split-role-tag--side' : 'split-role-tag--middle'}`}>
                        {i === 0 ? '#1' : i === 1 ? '#2' : 'Filter'}
                      </span>
                      <span className="notable-badge notable-badge--desired">{name}</span>
                      <button className="split-remove" onClick={() => {
                        setSplitPicks((prev) => prev.slice(0, i));
                        setResults(null);
                      }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="input-main">
              <NotableSearch
                onSelect={addNotable}
                currentlySelected={selected}
                placeholder="Search and add a notable…"
                allowedNames={allowedTwoSides}
              />
              <SelectedNotablesList
                selected={selected}
                disabled={disabled}
                onRemove={removeNotable}
                onToggle={toggleNotable}
              />
            </div>
          )}

          {/* Calculate + Share buttons */}
          <div className="calc-actions" style={{ marginTop: '12px' }}>
            <button
              className="btn btn--primary btn--full"
              onClick={handleCalculate}
              disabled={!canCalculate || isCalculating}
            >
              {isCalculating ? 'Calculating…' : buttonLabel}
            </button>
            {canCalculate && (
              <button
                className="btn btn--ghost share-btn"
                onClick={handleShare}
                title="Copy shareable link"
              >
                🔗
              </button>
            )}
          </div>
          {toast && <Toast message={toast} onDone={() => setToast(null)} />}
        </div>

        {/* Popular Clusters from poe.ninja */}
        <PopularClusters
          onSelectNotables={(notables) => {
            // Auto-populate Two Sides mode with the first 2 notables
            setMode('two-sides');
            setSelected(notables.slice(0, 2));
            setDisabled([]);
            setResults(null);
          }}
        />
      </div>

      {/* RIGHT COLUMN — Results */}
      <div className="col-results">
        {!results ? (
          <div className="results-placeholder">
            <div className="results-placeholder__icon">◇</div>
            <p>Results will appear here after you calculate.</p>
          </div>
        ) : (
          <div className="section section--results">
            <div className="section-header">
              <span className="section-icon section-icon--active">◆</span>
              <h3 className="section-title">
                {results.mode === 'split'
                  ? 'Split Personality Results'
                  : results.mode === 'single'
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

            {results.mode === 'split' ? (
              <SplitPersonalityResults data={results.data} passiveCount={passiveCount} />
            ) : results.mode === 'single' ? (
              <SingleNotableResults data={results.data} passiveCount={passiveCount} />
            ) : (
              <TwoNotableResults data={results.data} passiveCount={passiveCount} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
