import React from 'react';
import {
  MapPin,
  RefreshCw,
  Search,
  Navigation,
  Maximize2,
  Minimize2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface BoardHeaderProps {
  stationName: string;
  isLocationBased: boolean;
  lastUpdated: Date | null;
  secondsRemaining: number;
  isLoading: boolean;
  limit: number;
  onChangeLimit: (limit: number) => void;
  onRefresh: () => void;
  onOpenSearch: () => void;
  onUseLocation: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  stationName,
  isLocationBased,
  lastUpdated,
  secondsRemaining,
  isLoading,
  limit,
  onChangeLimit,
  onRefresh,
  onOpenSearch,
  onUseLocation,
  isFullscreen,
  onToggleFullscreen,
  selectedFilter,
  onSelectFilter,
}) => {
  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const filterOptions = [
    { id: 'ALL', label: 'All Departures' },
    { id: 'TRAIN', label: 'Trains (S / IC / IR)' },
    { id: 'BUS', label: 'Buses' },
    { id: 'TRAM', label: 'Trams' },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Bar: Station & Primary Status */}
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Station Identity */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-slate-400">
            {isLocationBased ? (
              <span className="inline-flex items-center gap-1.5 text-blue-400 font-semibold">
                <Navigation className="w-3.5 h-3.5 animate-pulse" />
                Nearest Station by GPS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                Selected Station
              </span>
            )}
            <span>•</span>
            <span className="text-slate-400">Swiss Public Transport</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              {stationName}
            </h1>
            <button
              onClick={onOpenSearch}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Search and change station"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Countdown & Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          {/* Refresh Countdown Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">
              Updated: <strong className="text-white">{formatTime(lastUpdated)}</strong>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">
              Next in <span className="font-bold text-amber-400">{secondsRemaining}s</span>
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onUseLocation}
              className={`p-2 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                isLocationBased
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Locate nearest station using GPS"
            >
              <Navigation className="w-4 h-4" />
              <span className="hidden sm:inline">GPS</span>
            </button>

            <button
              onClick={onOpenSearch}
              className="p-2 rounded-xl text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-1.5"
              title="Browse and select station"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Find Station</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 transition flex items-center gap-1.5 disabled:opacity-50"
              title="Refresh departures now"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={onToggleFullscreen}
              className="p-2 rounded-xl text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition"
              title={isFullscreen ? 'Exit Kiosk Fullscreen' : 'Enter Kiosk Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Bar: Filter & Row Count Controls */}
      <div className="bg-slate-950/70 border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Transport Type Filters */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onSelectFilter(opt.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition text-xs whitespace-nowrap ${
                  selectedFilter === opt.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Limit selector */}
          <div className="flex items-center gap-2 text-slate-400">
            <span>Show:</span>
            {[5, 7, 10, 15].map((num) => (
              <button
                key={num}
                onClick={() => onChangeLimit(num)}
                className={`px-2 py-0.5 rounded font-mono font-semibold text-xs transition ${
                  limit === num
                    ? 'bg-slate-700 text-white border border-slate-600'
                    : 'hover:text-slate-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
