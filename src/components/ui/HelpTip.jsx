import { useState, useRef, useEffect } from 'react';

/**
 * Small (?) icon that shows a tooltip on hover/tap.
 * Reusable across the app to explain features.
 */
export default function HelpTip({ text }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);
  const tipRef = useRef(null);

  useEffect(() => {
    if (!show || !iconRef.current) return;
    const rect = iconRef.current.getBoundingClientRect();
    const tipW = 220;
    let left = rect.left + rect.width / 2 - tipW / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8));
    const spaceAbove = rect.top;
    const top = spaceAbove > 60
      ? rect.top - 8 // will position above via transform
      : rect.bottom + 8;
    setPos({ top, left, above: spaceAbove > 60 });
  }, [show]);

  return (
    <span className="help-tip" ref={iconRef}>
      <button
        className="help-tip__icon"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((s) => !s)}
        aria-label="Help"
        type="button"
      >
        ?
      </button>
      {show && (
        <div
          className="help-tip__tooltip"
          ref={tipRef}
          style={{
            position: 'fixed',
            top: pos.above ? pos.top : pos.top,
            left: pos.left,
            transform: pos.above ? 'translateY(-100%)' : 'none',
            zIndex: 1000,
          }}
        >
          {text}
        </div>
      )}
    </span>
  );
}
