import { useEffect, useRef } from 'react';

/**
 * Read calculator state from URL hash on mount.
 * Returns initial state if hash contains valid params, or null.
 *
 * Hash format examples:
 *   #mode=two&n=Fuel+the+Fight&n=Martial+Prowess&passives=8
 *   #mode=split&side=Fuel+the+Fight&middle=Repeater&passives=8
 *   #mode=split&side=Fuel+the+Fight&middle=Repeater&third=X&passives=8
 *   #mode=single&n=Fuel+the+Fight&pos=side&passives=10
 */
export function readUrlState() {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const mode = params.get('mode');
  if (!mode) return null;

  const passives = parseInt(params.get('passives') || '8', 10);
  const passiveCount = passives >= 8 && passives <= 12 ? passives : 8;

  if (mode === 'two' || mode === 'two-sides') {
    const notables = params.getAll('n');
    if (notables.length < 1) return null;
    return { mode: 'two-sides', selected: notables, passiveCount };
  }

  if (mode === 'split') {
    const side = params.get('side');
    const middle = params.get('middle');
    if (!side || !middle) return null;
    const third = params.get('third') || null;
    return { mode: 'split', splitSide: side, splitMiddle: middle, splitThird: third, passiveCount };
  }

  if (mode === 'single') {
    const notables = params.getAll('n');
    if (notables.length < 1) return null;
    const pos = params.get('pos') || 'side';
    return { mode: 'single', selected: notables, singlePosition: pos, passiveCount };
  }

  return null;
}

/**
 * Build a shareable URL hash from current calculator state.
 */
export function buildShareUrl(state) {
  const params = new URLSearchParams();

  if (state.mode === 'two-sides') {
    params.set('mode', 'two');
    for (const n of state.selected || []) {
      params.append('n', n);
    }
  } else if (state.mode === 'split') {
    params.set('mode', 'split');
    if (state.splitSide) params.set('side', state.splitSide);
    if (state.splitMiddle) params.set('middle', state.splitMiddle);
    if (state.splitThird) params.set('third', state.splitThird);
  } else if (state.mode === 'single') {
    params.set('mode', 'single');
    for (const n of state.selected || []) {
      params.append('n', n);
    }
    params.set('pos', state.singlePosition || 'side');
  }

  if (state.passiveCount && state.passiveCount !== 8) {
    params.set('passives', String(state.passiveCount));
  }

  const base = window.location.origin + window.location.pathname;
  return `${base}#${params.toString()}`;
}

/**
 * Copy text to clipboard and return success status.
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts (HTTP)
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}
