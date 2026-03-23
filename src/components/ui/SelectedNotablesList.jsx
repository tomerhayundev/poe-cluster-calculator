/**
 * Displays the list of selected notables with toggle and remove controls.
 * Toggle: clearly shows ON/OFF state with a switch-style control.
 * Disabled notables are visually dimmed and excluded from calculation.
 */
export default function SelectedNotablesList({
  selected,
  disabled = [],
  onRemove,
  onToggle,
}) {
  if (selected.length === 0) {
    return (
      <div className="selected-list selected-list--empty">
        <p>No notables selected yet. Use the search above to add some.</p>
      </div>
    );
  }

  return (
    <ul className="selected-list">
      {selected.map((name) => {
        const isOff = disabled.includes(name);
        return (
          <li
            key={name}
            className={`selected-item ${isOff ? 'selected-item--off' : ''}`}
          >
            {onToggle && (
              <button
                className={`toggle-switch ${isOff ? 'toggle-switch--off' : 'toggle-switch--on'}`}
                onClick={() => onToggle(name)}
                title={isOff ? 'Click to include in calculation' : 'Click to exclude from calculation'}
                aria-label={isOff ? `Enable ${name}` : `Disable ${name}`}
              >
                <span className="toggle-switch__track">
                  <span className="toggle-switch__thumb" />
                </span>
              </button>
            )}
            <span className="selected-item__name">{name}</span>
            {isOff && <span className="selected-item__status">excluded</span>}
            <button
              className="selected-item__remove"
              onClick={() => onRemove(name)}
              title="Remove"
            >
              ✕
            </button>
          </li>
        );
      })}
    </ul>
  );
}
