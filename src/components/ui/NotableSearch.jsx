import { useState, useRef, useEffect } from 'react';
import { getAllNotableNames } from '../../data/calculator';

/**
 * Reusable notable search/autocomplete component.
 * Used by both Two-Notable and Single-Notable features.
 */
export default function NotableSearch({ onSelect, currentlySelected = [], placeholder = '+ Add Notable' }) {
  const [filter, setFilter] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const allNames = getAllNotableNames();
  const filtered = allNames.filter(
    (name) =>
      name.toLowerCase().includes(filter.toLowerCase()) &&
      !currentlySelected.map((n) => n.toLowerCase()).includes(name.toLowerCase())
  );

  useEffect(() => {
    setHighlightIdx(0);
  }, [filter]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault();
      selectItem(filtered[highlightIdx]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  function selectItem(name) {
    onSelect(name);
    setFilter('');
    setIsOpen(false);
  }

  return (
    <div className="notable-search" ref={containerRef}>
      <input
        type="text"
        className="notable-search__input"
        placeholder={placeholder}
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && filtered.length > 0 && (
        <ul className="notable-search__dropdown" ref={listRef}>
          {filtered.slice(0, 50).map((name, idx) => (
            <li
              key={name}
              className={`notable-search__item ${idx === highlightIdx ? 'notable-search__item--highlighted' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                selectItem(name);
              }}
              onMouseEnter={() => setHighlightIdx(idx)}
            >
              {name}
            </li>
          ))}
          {filtered.length > 50 && (
            <li className="notable-search__more">
              +{filtered.length - 50} more — type to narrow
            </li>
          )}
        </ul>
      )}
      {isOpen && filter && filtered.length === 0 && (
        <div className="notable-search__empty">No matching notables</div>
      )}
    </div>
  );
}
