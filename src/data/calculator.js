/**
 * Core calculation logic for PoE Cluster Jewel Calculator
 * Ported and enhanced from TheodoreJBieber/PoEClusterJewelCalculator
 */
import megaStruct from './data.json';

// --- Data Maps (initialized once) ---
export let sortOrderMap = {};
export let enchantMap = {};

export function initData() {
  createSortOrderMaps();
  createEnchantMap();
}

function createSortOrderMaps() {
  sortOrderMap = {};
  for (const s in megaStruct.Notables) {
    if (s !== 'Large') continue;
    const sObj = megaStruct.Notables[s];
    for (const notableName in sObj) {
      sortOrderMap[notableName] = sObj[notableName];
    }
  }
}

function createEnchantMap() {
  enchantMap = {};
  for (const s in megaStruct.Notables) {
    if (s !== 'Large') continue;
    const sObj = megaStruct.Notables[s];
    for (const notableName in sObj) {
      const nObj = sObj[notableName];
      for (let i = 0; i < nObj.Enchantments.length; i++) {
        const enchantment = nObj.Enchantments[i];
        const enchantKey = getEnchantKey(enchantment);
        const enchantValue = determineEnchantValue(enchantment);
        enchantMap[enchantKey] = enchantValue;
      }
    }
  }
}

// --- Enchant Helpers ---
export function getEnchantKey(enchantment) {
  return enchantment
    .map((line) => line.Description.replace('%', line.Value + '%'))
    .join('/');
}

function determineEnchantValue(enchantment) {
  let tradeOptions =
    megaStruct.TradeStats.Enchant['Added Small Passive Skills grant: #'].option
      .options;
  tradeOptions = [...tradeOptions];

  for (let i = 0; i < enchantment.length; i++) {
    const enchantLine = enchantment[i];
    const lineValue = enchantLine.Value;
    const lineDescr = enchantLine.Description;
    const keywords = harvestKeywords(lineDescr);

    tradeOptions = tradeOptions.filter((opt) => {
      const text = opt.text.toLowerCase();
      if (!text.includes(lineValue)) return false;
      for (const kword of keywords) {
        if (!text.includes(kword)) return false;
      }
      if (text.includes('legacy')) return false;
      if (text.startsWith('minion') && !keywords.includes('minion'))
        return false;
      if (text.includes('herald') && !keywords.includes('herald'))
        return false;
      if (text.includes('time') && !keywords.includes('time')) {
        let found = false;
        for (let l = 0; l < enchantment.length; l++) {
          if (l === i) continue;
          if (harvestKeywords(enchantment[l].Description).includes('time')) {
            found = true;
          }
        }
        if (!found) return false;
      }
      return true;
    });

    if (Object.keys(tradeOptions).length === 1) {
      return tradeOptions[Object.keys(tradeOptions)[0]];
    }
  }
  return null;
}

function harvestKeywords(lineDescr) {
  return lineDescr
    .replace('+', 'increased_')
    .replace('physical_damage_reduction_rating', 'armour')
    .replace('channelled', 'channel')
    .replace('suppression', 'suppress')
    .replace('sigil', 'brand')
    .replace('empowered', 'exert')
    .toLowerCase()
    .split('_')
    .filter(
      (word) =>
        !['%', 'and', 'a', 'base', 'damage', 'to', 'rating', 'additional'].includes(word)
    );
}

// --- Compatibility Logic ---
export function includesEnchant(l1, l2) {
  return l1.some((lv) => enchantEquals(lv, l2));
}

function enchantEquals(e1, e2) {
  if (e1.length !== e2.length) return false;
  return e1.every(
    (line, i) =>
      line.Description === e2[i].Description && line.Value === e2[i].Value
  );
}

function isSuffix(notable) {
  return notable.Mod.CorrectGroup.includes('Suffix');
}

function isBetween(val1, val3, between) {
  if (val1 < val3) return val1 < between && val3 > between;
  return val3 < between && val1 > between;
}

function isNotableBetween(not1, not3, between) {
  return isBetween(not1.Stat._rid, not3.Stat._rid, between.Stat._rid);
}

function isEnchantsValid(allowed, enchs) {
  return enchs.some((ench) => includesEnchant(allowed, ench));
}

function areNotablesCompatible(not1, not3, not2, validEnchants) {
  let numPrefixes = 0;
  if (!isSuffix(not1)) numPrefixes++;
  if (!isSuffix(not2)) numPrefixes++;
  if (!isSuffix(not3)) numPrefixes++;

  return (
    numPrefixes < 3 &&
    isNotableBetween(not1, not3, not2) &&
    isEnchantsValid(validEnchants, not2.Enchantments) &&
    not2.Mod.CorrectGroup !== not1.Mod.CorrectGroup &&
    not2.Mod.CorrectGroup !== not3.Mod.CorrectGroup
  );
}

// --- Main Calculation: Two Notables (original) ---
export function getValidEnchants(notable1, notable3) {
  const allEnchants = [...notable1.Enchantments];
  for (const ench of notable3.Enchantments) {
    if (!includesEnchant(allEnchants, ench)) {
      allEnchants.push(ench);
    }
  }
  return allEnchants.filter(
    (ench) =>
      includesEnchant(notable1.Enchantments, ench) &&
      includesEnchant(notable3.Enchantments, ench)
  );
}

export function calculate3n2dCompatibility(notableName1, notableName3) {
  const notable1 = sortOrderMap[notableName1];
  const notable3 = sortOrderMap[notableName3];

  const out = {
    name: `${notableName1} (ilvl: ${notable1.Mod.Level}) + ${notableName3} (ilvl: ${notable3.Mod.Level})`,
    success: false,
    notableName1,
    notableName3,
    notable1,
    notable3,
  };

  if (notable1.Mod.CorrectGroup === notable3.Mod.CorrectGroup) {
    out.error = 'Notables cannot be in the same mod group.';
    return out;
  }

  const validEnchants = getValidEnchants(notable1, notable3);
  if (validEnchants.length === 0) {
    out.error =
      'Those notables cannot roll on any of the same cluster jewel types.';
    return out;
  }

  let min = Math.min(notable1.Mod.Level, notable3.Mod.Level);
  let max = Math.max(notable1.Mod.Level, notable3.Mod.Level);

  const notablesBetween = [];
  const betweenNames = [];

  for (const s in megaStruct.Notables) {
    if (s !== 'Large') continue;
    const sObj = megaStruct.Notables[s];
    for (const notableName in sObj) {
      const nObj = sObj[notableName];
      if (areNotablesCompatible(notable1, notable3, nObj, validEnchants)) {
        notablesBetween.push(nObj);
        betweenNames.push(notableName);
        const lvl = nObj.Mod.Level;
        if (lvl > max) max = lvl;
        if (lvl < min) min = lvl;
      }
    }
  }

  if (notablesBetween.length === 0) {
    out.error =
      'There are no notables that can appear in position 2 with the current selection.';
    return out;
  }

  out.success = true;
  out.betweenNames = betweenNames;
  out.notablesBetween = notablesBetween;
  out.validEnchants = validEnchants;
  out.minLvl = min;
  out.maxLvl = max;
  return out;
}

export function calculateTwoNotables(selectedNotables) {
  if (selectedNotables.length < 2) {
    return {
      error: `Please select at least 2 notables. Currently selected ${selectedNotables.length}.`,
      results: [],
    };
  }

  const results = [];
  for (let first = 0; first < selectedNotables.length; first++) {
    for (let second = first + 1; second < selectedNotables.length; second++) {
      results.push(
        calculate3n2dCompatibility(
          selectedNotables[first],
          selectedNotables[second]
        )
      );
    }
  }

  const numValid = results.filter((out) => out.success).length;
  if (numValid === 0) {
    return {
      error: 'There are no valid combinations with the currently selected notables.',
      results,
    };
  }

  return { error: null, results };
}

// --- NEW FEATURE: Single Notable Calculation ---
// Given ONE notable, automatically detect if user wants it on a side (pos 1/3)
// or in the middle (pos 2). The logic:
//
// For SIDE (pos 1 or 3): The desired notable must have either the lowest or
// highest _rid among the 3 notables on the jewel. We need to find a companion
// that goes on the OTHER side, such that the desired notable's _rid is NOT
// between the companion and the middle. Then any middle whose _rid falls
// between the two sides works.
//
// For MIDDLE (pos 2): The desired notable's _rid must fall between the two
// side notables' _rids.

export function calculateSingleNotable(notableName, position) {
  const notable = sortOrderMap[notableName];
  if (!notable) {
    return { error: `Notable "${notableName}" not found.`, results: [] };
  }

  if (position === 'side') {
    return calculateSingleNotableSide(notableName, notable);
  }

  if (position === 'middle') {
    return calculateSingleNotableMiddle(notableName, notable);
  }

  return { error: 'Invalid position. Use "side" or "middle".', results: [] };
}

function calculateSingleNotableSide(notableName, notable) {
  // The desired notable is on position 1 or 3 (a side).
  // We need to find another notable for the OTHER side, such that:
  // 1. They share at least one enchant type
  // 2. They are in different mod groups
  // 3. There exists at least one valid middle notable whose _rid falls between them
  // 4. The desired notable is NOT the middle (it must be on the outside)
  //
  // Key insight: in calculate3n2dCompatibility, not1 and not3 are the SIDES,
  // and not2 is the middle. So our desired notable is not1 (or not3),
  // and we're looking for a not3 (or not1) where middles exist.
  // The desired notable's _rid must be OUTSIDE the range, not between.

  const desiredRid = notable.Stat._rid;
  const results = [];

  for (const otherSideName in sortOrderMap) {
    if (otherSideName === notableName) continue;
    const otherSide = sortOrderMap[otherSideName];

    // Must be different mod group
    if (notable.Mod.CorrectGroup === otherSide.Mod.CorrectGroup) continue;

    // Must share enchants
    const validEnchants = getValidEnchants(notable, otherSide);
    if (validEnchants.length === 0) continue;

    // Now find middles that fit between our desired notable and the other side
    // Our desired and otherSide are on positions 1 & 3 (sides)
    const middleNames = [];
    const middles = [];

    for (const mName in sortOrderMap) {
      if (mName === notableName || mName === otherSideName) continue;
      const mObj = sortOrderMap[mName];

      // The middle's _rid must be BETWEEN the two sides' _rids
      // AND our desired notable must be one of the outer positions
      if (areNotablesCompatible(notable, otherSide, mObj, validEnchants)) {
        middleNames.push(mName);
        middles.push(mObj);
      }
    }

    if (middles.length > 0) {
      results.push({
        partnerName: otherSideName,
        partner: otherSide,
        middleNames,
        middles,
        validEnchants,
        middleCount: middles.length,
      });
    }
  }

  // Sort by number of middle options (most flexible combos first)
  results.sort((a, b) => b.middleCount - a.middleCount);

  return {
    error: results.length === 0
      ? `"${notableName}" cannot be placed on a side position with any known pairing.`
      : null,
    notable,
    notableName,
    position: 'side',
    results,
  };
}

function calculateSingleNotableMiddle(notableName, notable) {
  // The desired notable is in position 2 (middle).
  // We need to find pairs of side notables (pos 1 & 3) where the desired
  // notable's _rid falls BETWEEN them.
  const results = [];
  const allNames = Object.keys(sortOrderMap);

  for (let i = 0; i < allNames.length; i++) {
    const name1 = allNames[i];
    if (name1 === notableName) continue;
    const not1 = sortOrderMap[name1];

    for (let j = i + 1; j < allNames.length; j++) {
      const name3 = allNames[j];
      if (name3 === notableName) continue;
      const not3 = sortOrderMap[name3];

      // Sides must be different mod groups
      if (not1.Mod.CorrectGroup === not3.Mod.CorrectGroup) continue;

      const validEnchants = getValidEnchants(not1, not3);
      if (validEnchants.length === 0) continue;

      // Check if our notable fits as the middle between these two sides
      if (areNotablesCompatible(not1, not3, notable, validEnchants)) {
        results.push({
          sideName1: name1,
          sideName3: name3,
          side1: not1,
          side3: not3,
          validEnchants,
        });
      }
    }
  }

  return {
    error: results.length === 0
      ? `"${notableName}" cannot fit in the middle (position 2) of any pair.`
      : null,
    notable,
    notableName,
    position: 'middle',
    results,
  };
}

// --- Trade URL Generation ---

function getTradeBaseUrl(settings = {}) {
  const league = settings.league || 'Mirage';
  const platform = settings.platform || 'pc';

  // Platform-specific trade URLs
  if (platform === 'xbox') {
    return `https://www.pathofexile.com/trade/search/xbox/${league}?q=`;
  }
  if (platform === 'sony') {
    return `https://www.pathofexile.com/trade/search/sony/${league}?q=`;
  }
  return `https://www.pathofexile.com/trade/search/${league}?q=`;
}

function getStatusOption(settings = {}) {
  return settings.status || 'buyout';
}

export function getNotableTradeId(notable) {
  return megaStruct.TradeStats.Explicit[notable];
}

export function buildTradeUrl3n2d(desired, others, enchant = null, settings = {}) {
  const base_request = {
    sort: { price: 'asc' },
    query: {
      status: { option: getStatusOption(settings) },
      stats: [],
    },
  };

  const and_body = { type: 'and', filters: [] };
  const count_body = { type: 'count', value: { min: 1 }, filters: [] };

  and_body.filters.push({
    value: { max: 8, min: 8 },
    id: megaStruct.TradeStats.Enchant['Adds # Passive Skills']['id'],
  });

  if (enchant != null) {
    const enchantKey = getEnchantKey(enchant);
    const mapped = enchantMap[enchantKey];
    if (mapped) {
      and_body.filters.push({
        id: megaStruct.TradeStats.Enchant['Added Small Passive Skills grant: #']['id'],
        value: { option: mapped.id },
      });
    }
  }

  for (const de of desired) {
    const id = getNotableTradeId(de);
    if (id) and_body.filters.push({ id });
  }

  for (const oth of others) {
    const id = getNotableTradeId(oth);
    if (id) count_body.filters.push({ id });
  }

  base_request.query.stats.push(and_body);
  if (count_body.filters.length > 0) {
    base_request.query.stats.push(count_body);
  }

  return getTradeBaseUrl(settings) + encodeURIComponent(JSON.stringify(base_request));
}

/**
 * Build a MASTER trade link that searches for the cheapest jewel matching
 * ANY valid combination. For two-notable mode: desired1 + desired2 + any valid middle.
 * For single-notable side mode: desired + any valid companion on the other side.
 */
export function buildMasterTradeUrl(desiredNames, allMiddleNames = [], settings = {}) {
  const base_request = {
    sort: { price: 'asc' },
    query: {
      status: { option: getStatusOption(settings) },
      stats: [],
    },
  };

  const and_body = { type: 'and', filters: [] };

  // Must be 8-passive
  and_body.filters.push({
    value: { max: 8, min: 8 },
    id: megaStruct.TradeStats.Enchant['Adds # Passive Skills']['id'],
  });

  // Must have all desired notables
  for (const name of desiredNames) {
    const id = getNotableTradeId(name);
    if (id) and_body.filters.push({ id });
  }

  base_request.query.stats.push(and_body);

  // Must have at least 1 of the valid middles/companions
  if (allMiddleNames.length > 0) {
    // Deduplicate
    const unique = [...new Set(allMiddleNames)];
    const count_body = { type: 'count', value: { min: 1 }, filters: [] };
    for (const name of unique) {
      const id = getNotableTradeId(name);
      if (id) count_body.filters.push({ id });
    }
    if (count_body.filters.length > 0) {
      base_request.query.stats.push(count_body);
    }
  }

  return getTradeBaseUrl(settings) + encodeURIComponent(JSON.stringify(base_request));
}

export function buildTemplateTradeUrl(min, max, ilvlMin = null, settings = {}) {
  const base_request = {
    sort: { price: 'asc' },
    query: {
      status: { option: getStatusOption(settings) },
      stats: [],
    },
  };

  const and_body = { type: 'and', filters: [] };

  and_body.filters.push({
    value: { max, min },
    id: megaStruct.TradeStats.Enchant['Adds # Passive Skills']['id'],
  });

  and_body.filters.push({
    id: megaStruct.TradeStats.Enchant['Added Small Passive Skills grant: #']['id'],
    value: {},
  });

  base_request.query.stats.push(and_body);

  if (ilvlMin != null) {
    base_request.query.filters = {
      misc_filters: { filters: { ilvl: { min: ilvlMin } } },
    };
  }

  return getTradeBaseUrl(settings) + encodeURIComponent(JSON.stringify(base_request));
}

// --- Get all notable names ---
export function getAllNotableNames() {
  return Object.keys(sortOrderMap).sort();
}
