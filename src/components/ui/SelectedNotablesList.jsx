/**
 * Displays the list of selected notables with enable/disable/remove controls.
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
        const isDisabled = disabled.includes(name);
        return (
          <li
            key={name}
            className={`selected-item ${isDisabled ? 'selected-item--disabled' : ''}`}
          >
            {onToggle && (
              <button
                className="selected-item__toggle"
                onClick={() => onToggle(name)}
                title={isDisabled ? 'Enable' : 'Disable'}
              >
                {isDisabled ? '○' : '●'}
              </button>
            )}
            <span className="selected-item__name">{name}</span>
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
