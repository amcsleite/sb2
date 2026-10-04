import { FormattedDeparture, StationboardEntry, StationLocation } from '../types/transit';

const API_BASE = 'https://transport.opendata.ch/v1';

export async function fetchNearestStations(latitude: number, longitude: number): Promise<StationLocation[]> {
  const url = `${API_BASE}/locations?x=${latitude}&y=${longitude}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch nearby locations (${response.status})`);
  }
  const data = await response.json();
  const stations: StationLocation[] = (data.stations || []).filter((s: StationLocation) => !!s.id);
  return stations;
}

export async function searchStations(query: string): Promise<StationLocation[]> {
  if (!query.trim()) return [];
  const url = `${API_BASE}/locations?query=${encodeURIComponent(query.trim())}&type=station`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to search stations (${response.status})`);
  }
  const data = await response.json();
  return (data.stations || []).filter((s: StationLocation) => !!s.id && !!s.name);
}

export async function fetchStationBoard(
  stationId: string,
  limit: number = 7
): Promise<{ stationName: string; stationId: string; entries: StationboardEntry[] }> {
  const url = `${API_BASE}/stationboard?id=${encodeURIComponent(stationId)}&limit=${limit}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch station board (${response.status})`);
  }
  const data = await response.json();
  return {
    stationName: data.station?.name || 'Unknown Station',
    stationId: data.station?.id || stationId,
    entries: data.stationboard || [],
  };
}

export function formatWaitingTime(departureIso: string | null): {
  minutes: number;
  display: string;
  timeClass: 'now' | 'soon' | 'later';
} {
  if (!departureIso) {
    return { minutes: 999, display: '-', timeClass: 'later' };
  }

  const now = new Date();
  const departure = new Date(departureIso);
  const diffMs = departure.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes <= 0) {
    return { minutes: diffMinutes, display: '0', timeClass: 'now' };
  }
  if (diffMinutes < 3) {
    return { minutes: diffMinutes, display: `${diffMinutes}`, timeClass: 'now' };
  }
  if (diffMinutes < 10) {
    return { minutes: diffMinutes, display: `${diffMinutes}`, timeClass: 'soon' };
  }
  return { minutes: diffMinutes, display: `${diffMinutes}`, timeClass: 'later' };
}

export function formatTime(isoString: string | null): string {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return '--:--';
  }
}

export function parseDepartures(entries: StationboardEntry[]): FormattedDeparture[] {
  return entries.map((entry, index) => {
    const rawTime = entry.stop?.departure;
    const { minutes, display, timeClass } = formatWaitingTime(rawTime);
    const scheduledTime = formatTime(rawTime);

    return {
      id: `${entry.name || 'conn'}-${entry.stop?.departureTimestamp || index}-${entry.to}`,
      type: entry.category || 'Transit',
      number: entry.number || '',
      operator: entry.operator || 'SBB',
      destination: entry.to || 'Unknown Destination',
      scheduledTime,
      actualDepartureIso: rawTime || '',
      departureTimestamp: entry.stop?.departureTimestamp || 0,
      delayMinutes: typeof entry.stop?.delay === 'number' ? entry.stop.delay : null,
      platform: entry.stop?.prognosis?.platform || entry.stop?.platform || null,
      waitingMinutes: minutes,
      timeDisplay: display,
      timeClass,
      passList: entry.passList || [],
    };
  });
}
