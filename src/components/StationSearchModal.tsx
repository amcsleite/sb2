import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Navigation } from 'lucide-react';
import { PRESET_STATIONS, PresetStation } from '../constants/presetStations';
import { searchStations } from '../services/transportApi';
import { StationLocation } from '../types/transit';

interface StationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStation: (stationId: string, stationName: string) => void;
  onUseLocation: () => void;
}

export const StationSearchModal: React.FC<StationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectStation,
  onUseLocation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<StationLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
      setResults([]);
      setSearchError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const data = await searchStations(searchTerm);
        setResults(data);
      } catch (err: unknown) {
        setSearchError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header with Search Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search station, stop, or city (e.g., Zurich, Bern, Geneve)..."
            className="flex-1 bg-transparent border-none outline-hidden text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800"
          >
            Esc
          </button>
        </div>

        {/* Content body */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {/* Action: Use Current Geolocation */}
          <div>
            <button
              onClick={() => {
                onUseLocation();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition font-medium text-sm"
            >
              <Navigation className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>Use Current GPS Location (Find Nearest Station)</span>
            </button>
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="flex items-center justify-center py-6 text-slate-400 text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching Swiss transit database...
            </div>
          )}

          {searchError && (
            <div className="text-xs text-rose-500 p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg">
              {searchError}
            </div>
          )}

          {searchTerm.trim().length > 0 && !isSearching && results.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-sm">
              No stations found for &ldquo;{searchTerm}&rdquo;. Try another name.
            </div>
          )}

          {results.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Matching Stations
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {results.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => {
                      onSelectStation(station.id, station.name);
                      onClose();
                    }}
                    className="w-full text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {station.name}
                      </span>
                    </div>
                    {station.coordinate && (
                      <span className="text-[11px] font-mono text-slate-400">
                        ID: {station.id}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preset Major Stations */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              Major Hub Stations
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_STATIONS.map((preset: PresetStation) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onSelectStation(preset.id, preset.name);
                    onClose();
                  }}
                  className="p-2.5 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
                >
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Canton {preset.canton}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
