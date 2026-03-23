/**
 * poe.ninja price service for cluster jewels.
 * Fetches cluster jewel prices and provides lookup by notable combination.
 */

let priceCache = null;
let cachedLeague = null;

/**
 * Fetch cluster jewel prices from poe.ninja.
 * Caches results per league.
 */
export async function fetchPrices(league) {
  if (priceCache && cachedLeague === league) {
    return priceCache;
  }

  try {
    const url = `https://poe.ninja/api/data/itemoverview?league=${encodeURIComponent(league)}&type=ClusterJewel`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data?.lines || !Array.isArray(data.lines)) {
      throw new Error('Invalid poe.ninja response');
    }

    // Build lookup map: key = sorted notable names joined by '|'
    const map = new Map();

    for (const item of data.lines) {
      const notables = extractNotableNames(item);
      if (notables.length === 0) continue;

      const key = notables.sort().join('|');
      const existing = map.get(key);

      // Keep the cheapest entry per notable combination
      if (!existing || item.chaosValue < existing.chaosValue) {
        map.set(key, {
          chaosValue: item.chaosValue || 0,
          divineValue: item.divineValue || 0,
          listingCount: item.listingCount || item.count || 0,
          sparkline: item.sparkline?.totalChange || 0,
          icon: item.icon || null,
          notables,
          name: item.name || '',
          variant: item.variant || '',
        });
      }
    }

    priceCache = map;
    cachedLeague = league;
    return map;
  } catch (err) {
    console.warn('poe.ninja price fetch failed:', err.message);
    return null;
  }
}

/**
 * Extract notable names from a poe.ninja item entry.
 * Notables appear in explicitModifiers as "1 Added Passive Skill is <Name>"
 */
function extractNotableNames(item) {
  const names = [];
  if (item.explicitModifiers && Array.isArray(item.explicitModifiers)) {
    for (const mod of item.explicitModifiers) {
      const match = mod.text?.match(/Added Passive Skill is (.+)/);
      if (match) {
        names.push(match[1].trim());
      }
    }
  }
  return names;
}

/**
 * Find cheapest price for a combination of desired notables + any valid middle.
 * Returns { chaosValue, divineValue, listingCount, sparkline } or null.
 */
export function getPriceForCombination(priceMap, desired1, desired2, middleNames = []) {
  if (!priceMap) return null;

  let best = null;

  for (const [key, entry] of priceMap) {
    const entryNotables = entry.notables;

    // Must contain both desired notables
    if (!entryNotables.includes(desired1)) continue;
    if (!entryNotables.includes(desired2)) continue;

    // If middleNames provided, the 3rd notable must be one of them
    if (middleNames.length > 0) {
      const third = entryNotables.find((n) => n !== desired1 && n !== desired2);
      if (third && !middleNames.includes(third)) continue;
    }

    if (!best || entry.chaosValue < best.chaosValue) {
      best = entry;
    }
  }

  return best;
}

/**
 * Get top N cluster jewels by listing count or chaos value.
 */
export function getTopClusters(priceMap, sortBy = 'listings', limit = 5) {
  if (!priceMap) return [];

  const entries = [...priceMap.values()].filter((e) => e.notables.length >= 2);

  if (sortBy === 'price') {
    entries.sort((a, b) => b.chaosValue - a.chaosValue);
  } else {
    entries.sort((a, b) => b.listingCount - a.listingCount);
  }

  return entries.slice(0, limit);
}

/**
 * Format price for display.
 */
export function formatPrice(chaosValue, divineValue) {
  if (divineValue >= 1) {
    return `${divineValue.toFixed(1)} div`;
  }
  return `${Math.round(chaosValue)}c`;
}

/**
 * Clear the cache (useful when league changes).
 */
export function clearPriceCache() {
  priceCache = null;
  cachedLeague = null;
}
