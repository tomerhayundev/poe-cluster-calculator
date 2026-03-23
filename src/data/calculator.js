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
// Given ONE notable and a desired position (side=1/3 or middle=2),
// find all compatible partners.

export function calculateSingleNotable(notableName, position) {
  const notable = sortOrderMap[notableName];
  if (!notable) {
    return { error: `Notable "${notableName}" not found.`, results: [] };
  }

  const results = [];

  if (position === 'side') {
    // User wants this notable on the side (pos 1 or 3).
    // Find all valid pairs where this notable + another notable on the other side
    // and show what middles are possible.
    for (const otherName in sortOrderMap) {
      if (otherName === notableName) continue;
      const other = sortOrderMap[otherName];

      // Skip same group
      if (notable.Mod.CorrectGroup === other.Mod.CorrectGroup) continue;

      const validEnchants = getValidEnchants(notable, other);
      if (validEnchants.length === 0) continue;

      // Find middles
      const middles = [];
      const middleNames = [];
      for (const mName in sortOrderMap) {
        const mObj = sortOrderMap[mName];
        if (areNotablesCompatible(notable, other, mObj, validEnchants)) {
          middles.push(mObj);
          middleNames.push(mName);
        }
      }

      if (middles.length > 0) {
        results.push({
          partnerName: otherName,
          partner: other,
          middleNames,
          middles,
          validEnchants,
          middleCount: middles.length,
        });
      }
    }

    // Sort by number of middle options (most flexible first)
    results.sort((a, b) => b.middleCount - a.middleCount);

    return {
      error: results.length === 0 ? 'No valid side-position pairings found.' : null,
      notable,
      notableName,
      position,
      results,
    };
  }

  if (position === 'middle') {
    // User wants this notable in the middle (pos 2).
    // Find all pairs of side notables where this one fits between them.
    const pairs = [];

    const allNames = Object.keys(sortOrderMap);
    for (let i = 0; i < allNames.length; i++) {
      const name1 = allNames[i];
      if (name1 === notableName) continue;
      const not1 = sortOrderMap[name1];

      for (let j = i + 1; j < allNames.length; j++) {
        const name3 = allNames[j];
        if (name3 === notableName) continue;
        const not3 = sortOrderMap[name3];

        // Check if our notable fits between these two
        if (not1.Mod.CorrectGroup === not3.Mod.CorrectGroup) continue;

        const validEnchants = getValidEnchants(not1, not3);
        if (validEnchants.length === 0) continue;

        if (areNotablesCompatible(not1, not3, notable, validEnchants)) {
          pairs.push({
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
      error: pairs.length === 0 ? 'This notable cannot fit in the middle of any pair.' : null,
      notable,
      notableName,
      position,
      results: pairs,
    };
  }

  return { error: 'Invalid position. Use "side" or "middle".', results: [] };
}

// --- Trade URL Generation ---
const TRADE_BASE = 'https://www.pathofexile.com/trade/search/Settlers?q=';

export function getTradeBase() {
  return TRADE_BASE;
}

export function getNotableTradeId(notable) {
  return megaStruct.TradeStats.Explicit[notable];
}

export function buildTradeUrl3n2d(desired, others, enchant = null) {
  const base_request = {
    sort: { price: 'asc' },
    query: {
      status: { option: 'onlineleague' },
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

  return TRADE_BASE + encodeURIComponent(JSON.stringify(base_request));
}

export function buildTemplateTradeUrl(min, max, ilvlMin = null) {
  const base_request = {
    sort: { price: 'asc' },
    query: {
      status: { option: 'onlineleague' },
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

  return TRADE_BASE + encodeURIComponent(JSON.stringify(base_request));
}

// --- Get all notable names ---
export function getAllNotableNames() {
  return Object.keys(sortOrderMap).sort();
}
