export interface Coordinate {
  type: string;
  x: number; // latitude in opendata API
  y: number; // longitude in opendata API
}

export interface StationLocation {
  id: string;
  name: string;
  score?: number | null;
  coordinate?: Coordinate;
  distance?: number | null;
  icon?: string;
}

export interface PassListItem {
  station: StationLocation;
  arrival: string | null;
  arrivalTimestamp: number | null;
  departure: string | null;
  departureTimestamp: number | null;
  delay: number | null;
  platform: string | null;
}

export interface StationboardStop {
  station: StationLocation;
  arrival: string | null;
  arrivalTimestamp: number | null;
  departure: string | null;
  departureTimestamp: number | null;
  delay: number | null;
  platform: string | null;
  prognosis?: {
    platform?: string | null;
    departure?: string | null;
    arrival?: string | null;
  };
}

export interface StationboardEntry {
  stop: StationboardStop;
  name: string;
  category: string;
  subcategory?: string | null;
  categoryCode?: number | null;
  number: string;
  operator: string;
  to: string;
  passList?: PassListItem[];
}

export interface StationBoardResponse {
  station: StationLocation;
  stationboard: StationboardEntry[];
}

export interface FormattedDeparture {
  id: string;
  type: string;
  number: string;
  operator: string;
  destination: string;
  scheduledTime: string;
  actualDepartureIso: string;
  departureTimestamp: number;
  delayMinutes: number | null;
  platform: string | null;
  waitingMinutes: number;
  timeDisplay: string;
  timeClass: 'now' | 'soon' | 'later';
  passList?: PassListItem[];
}
