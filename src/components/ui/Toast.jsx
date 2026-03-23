import { useState, useEffect } from 'react';

/**
 * Lightweight toast notification.
 * Shows a message that auto-disappears after a timeout.
 */
export default function Toast({ message, duration = 2000, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDone]);

  if (!visible) return null;

  return (
    <div className="toast">
      <span className="toast__icon">✓</span>
      <span className="toast__message">{message}</span>
    </div>
  );
}
