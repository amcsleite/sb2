const STORAGE_KEY = 'stationBoard_important_lines';

type StationImportantLinesMap = Record<string, string[]>;

function normalizeStationKey(stationName: string): string {
  return (stationName || '').trim().toLowerCase();
}

function getStoredMap(): StationImportantLinesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse important lines from localStorage', e);
    return {};
  }
}

function saveStoredMap(map: StationImportantLinesMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save important lines to localStorage', e);
  }
}

export function getImportantLines(stationName: string): string[] {
  const map = getStoredMap();
  const key = normalizeStationKey(stationName);
  return map[key] || [];
}

export function toggleImportantLine(stationName: string, lineKey: string): boolean {
  const map = getStoredMap();
  const key = normalizeStationKey(stationName);
  const currentLines = map[key] || [];
  const normalizedLine = lineKey.trim();

  const exists = currentLines.includes(normalizedLine);
  let updatedLines: string[];

  if (exists) {
    updatedLines = currentLines.filter((l) => l !== normalizedLine);
  } else {
    updatedLines = [...currentLines, normalizedLine];
  }

  map[key] = updatedLines;
  saveStoredMap(map);
  return !exists;
}

export function isLineImportant(stationName: string, lineKey: string): boolean {
  const lines = getImportantLines(stationName);
  return lines.includes(lineKey.trim());
}
