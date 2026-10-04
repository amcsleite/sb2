export interface PresetStation {
  id: string;
  name: string;
  canton: string;
  coords: { lat: number; lng: number };
}

export const PRESET_STATIONS: PresetStation[] = [
  { id: '8503000', name: 'Zürich HB', canton: 'ZH', coords: { lat: 47.3778, lng: 8.5405 } },
  { id: '8501008', name: 'Genève-Cornavin', canton: 'GE', coords: { lat: 46.2102, lng: 6.1425 } },
  { id: '8507000', name: 'Bern', canton: 'BE', coords: { lat: 46.9488, lng: 7.4391 } },
  { id: '8500010', name: 'Basel SBB', canton: 'BS', coords: { lat: 47.5474, lng: 7.5896 } },
  { id: '8501120', name: 'Lausanne', canton: 'VD', coords: { lat: 46.5168, lng: 6.6291 } },
  { id: '8505004', name: 'Luzern', canton: 'LU', coords: { lat: 47.0502, lng: 8.3103 } },
  { id: '8506000', name: 'Winterthur', canton: 'ZH', coords: { lat: 47.5003, lng: 8.7238 } },
  { id: '8505300', name: 'Lugano', canton: 'TI', coords: { lat: 46.0054, lng: 8.9470 } },
  { id: '8506302', name: 'St. Gallen', canton: 'SG', coords: { lat: 47.4233, lng: 9.3698 } },
  { id: '8507492', name: 'Interlaken Ost', canton: 'BE', coords: { lat: 46.6903, lng: 7.8690 } },
  { id: '8501689', name: 'Zermatt', canton: 'VS', coords: { lat: 46.0244, lng: 7.7490 } },
];
