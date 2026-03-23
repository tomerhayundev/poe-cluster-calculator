import { useState, useRef, useEffect } from 'react';
import { getNotableInfo } from '../../data/calculator';

/**
 * Wraps any element and shows a tooltip with notable stats on hover.
 * Usage: <NotableTooltip name="Fuel the Fight"><span>Fuel the Fight</span></NotableTooltip>
 */
export default function NotableTooltip({ name, children }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);

  const info = getNotableInfo(name);

  useEffect(() => {
    if (show && wrapperRef.current && tooltipRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current;
      const tooltipRect = tooltip.getBoundingClientRect();

      let top = rect.top - tooltipRect.height - 8;
      let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

      // Keep within viewport
      if (top < 4) top = rect.bottom + 8;
      if (left < 4) left = 4;
      if (left + tooltipRect.width > window.innerWidth - 4) {
        left = window.innerWidth - tooltipRect.width - 4;
      }

      setPosition({ top, left });
    }
  }, [show]);

  if (!info) return children;

  return (
    <span
      ref={wrapperRef}
      className="notable-tooltip-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((prev) => !prev)}
    >
      {children}
      {show && (
        <div
          ref={tooltipRef}
          className="notable-tooltip"
          style={{ top: position.top, left: position.left }}
        >
          <div className="notable-tooltip__header">
            <strong className="notable-tooltip__name">{info.name}</strong>
            <span className={`notable-tooltip__tag ${info.isSuffix ? 'notable-tooltip__tag--suffix' : 'notable-tooltip__tag--prefix'}`}>
              {info.isSuffix ? 'Suffix' : 'Prefix'}
            </span>
          </div>
          <div className="notable-tooltip__ilvl">ilvl {info.ilvl}</div>
          {info.stats.length > 0 && (
            <ul className="notable-tooltip__stats">
              {info.stats.map((stat, i) => (
                <li key={i}>{stat}</li>
              ))}
            </ul>
          )}
          {info.enchantTypes.length > 0 && (
            <div className="notable-tooltip__enchants">
              <span className="notable-tooltip__enchant-label">Enchant types:</span>
              {info.enchantTypes.map((e, i) => (
                <span key={i} className="notable-tooltip__enchant">{e}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </span>
  );
}
