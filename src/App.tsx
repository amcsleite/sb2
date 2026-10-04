/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, Download, Search, MapPin, X, WifiOff, Clock, RefreshCw } from 'lucide-react';
import {
  fetchNearestStations,
  fetchStationBoard,
  formatWaitingTime,
  formatTime,
  searchStations,
} from './services/transportApi';
import {
  getImportantLines,
  toggleImportantLine,
} from './services/favoritesStorage';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { PRESET_STATIONS } from './constants/presetStations';
import { StationboardEntry, StationLocation } from './types/transit';

interface DepartureTimeSlot {
  relativeTime: string;
  clockTime: string;
  timeClass: 'now' | 'soon' | 'later';
  minutes: number;
}

interface GroupedConnectionRow {
  groupKey: string;
  lineKey: string;
  type: string;
  number: string;
  to: string;
  times: DepartureTimeSlot[];
}

export default function App() {
  const [stationId, setStationId] = useState<string | null>(null);
  const [stationName, setStationName] = useState<string>('Loading station...');
  const [rawEntries, setRawEntries] = useState<StationboardEntry[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20);
  const [statusMessage, setStatusMessage] = useState<string>('Locating nearest station...');
  const [isError, setIsError] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<StationLocation[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState<boolean>(false);

  // Time display mode: 'relative' (e.g. 3 7 11 15) vs 'clock' (e.g. 14:05 14:09 ...)
  const [timeMode, setTimeMode] = useState<'relative' | 'clock'>(() => {
    try {
      return localStorage.getItem('stationBoard_time_mode') === 'clock' ? 'clock' : 'relative';
    } catch {
      return 'relative';
    }
  });

  // Important lines for current station
  const [importantLines, setImportantLines] = useState<string[]>([]);

  // PWA & Connectivity hooks
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  const nextUpdateTimeRef = useRef<number>(Date.now() + 20000);
  const stationIdRef = useRef<string | null>(null);
  const stationNameRef = useRef<string>('Loading station...');
  const useGpsModeRef = useRef<boolean>(true);

  stationIdRef.current = stationId;
  stationNameRef.current = stationName;

  // Responsive font calculation matching browser size even in taller standalone PWA mode
  const calculateFontSize = useCallback(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const vh = isStandalone ? Math.max(500, window.innerHeight - 140) : window.innerHeight;
    const vw = window.innerWidth;
    const heightBasedSize = vh / 35;
    const widthBasedMax = vw < 768 ? vw / 19.5 : 24;
    const baseFontSize = Math.min(heightBasedSize, widthBasedMax);
    const fontSize = Math.max(14, Math.min(24, baseFontSize));
    document.documentElement.style.setProperty('--base-size', `${fontSize}px`);
  }, []);

  useEffect(() => {
    calculateFontSize();
    window.addEventListener('resize', calculateFontSize);
    return () => window.removeEventListener('resize', calculateFontSize);
  }, [calculateFontSize]);

  // Load important lines whenever station changes
  useEffect(() => {
    if (stationName && stationName !== 'Loading station...') {
      setImportantLines(getImportantLines(stationName));
    }
  }, [stationName]);

  const handleToggleTimeMode = () => {
    setTimeMode((prev) => {
      const next = prev === 'relative' ? 'clock' : 'relative';
      try {
        localStorage.setItem('stationBoard_time_mode', next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Format time as HH:MM:SS
  const formatTimeWithSeconds = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Fetch station board data (fetch 60 entries to collect multiple departures per line)
  const loadStationData = useCallback(async (id: string, name?: string) => {
    try {
      nextUpdateTimeRef.current = Date.now() + 20000;
      setSecondsRemaining(20);

      const data = await fetchStationBoard(id, 60);
      const currentStationName = name || data.stationName;

      setStationId(id);
      setStationName(currentStationName);
      setRawEntries(data.entries || []);
      setLastUpdateTime(Date.now());
      setIsError(false);
      setStatusMessage('');
    } catch (err: unknown) {
      console.error('Fetch error:', err);
      setIsError(true);
      setStatusMessage(
        err instanceof Error ? `Error: ${err.message}` : 'Failed to fetch departures'
      );
    }
  }, []);

  // Geolocation detection (silent=true refreshes GPS + nearest stop every 20s without blanking screen)
  const initGeolocation = useCallback(
    (silent = false) => {
      useGpsModeRef.current = true;
      nextUpdateTimeRef.current = Date.now() + 20000;
      setSecondsRemaining(20);

      if (!silent) {
        setStatusMessage('Locating nearest station...');
        setIsError(false);
      }

      const fallbackId = stationIdRef.current || '8503000';
      const fallbackName =
        stationNameRef.current && stationNameRef.current !== 'Loading station...'
          ? stationNameRef.current
          : 'Zürich HB';

      if (!navigator.geolocation) {
        loadStationData(fallbackId, fallbackName);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const stations = await fetchNearestStations(lat, lng);

            let foundId: string | null = null;
            let foundName: string | null = null;

            for (const s of stations) {
              if (s.id) {
                foundId = s.id;
                foundName = s.name;
                break;
              }
            }

            if (foundId && foundName) {
              loadStationData(foundId, foundName);
            } else {
              loadStationData(fallbackId, fallbackName);
            }
          } catch {
            loadStationData(fallbackId, fallbackName);
          }
        },
        () => {
          loadStationData(fallbackId, fallbackName);
        },
        { timeout: 6000, maximumAge: 0, enableHighAccuracy: true }
      );
    },
    [loadStationData]
  );

  // Initial load
  useEffect(() => {
    initGeolocation(false);
  }, [initGeolocation]);

  // Countdown timer & 20s auto-refresh (refreshes GPS + nearest station + board when active; paused in background)
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'hidden') {
        return;
      }
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((nextUpdateTimeRef.current - now) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        if (useGpsModeRef.current) {
          initGeolocation(true);
        } else if (stationIdRef.current) {
          loadStationData(stationIdRef.current, stationNameRef.current);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };

    const timer = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initGeolocation, loadStationData]);

  // Toggle row importance
  const handleToggleImportant = (e: React.MouseEvent, row: GroupedConnectionRow) => {
    e.stopPropagation();
    if (importantLines.includes(row.lineKey) && !importantLines.includes(row.groupKey)) {
      toggleImportantLine(stationName, row.lineKey);
    } else {
      toggleImportantLine(stationName, row.groupKey);
    }
    setImportantLines(getImportantLines(stationName));
  };

  // Station search autocomplete
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchStations(searchTerm);
        setSearchResults(res);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  // Group departures so there is only ONE row per bus/train/tram + destination
  const groupedMap = new Map<string, GroupedConnectionRow>();
  const nowMs = Date.now();

  for (const conn of rawEntries) {
    const rawTime = conn.stop?.prognosis?.departure || conn.stop?.departure;
    if (!rawTime) continue;

    const depMs = new Date(rawTime).getTime();
    if (depMs - nowMs < -30000) continue;

    const cat = (conn.category || '').trim();
    const num = (conn.number || '').trim();
    const lineKey = `${cat} ${num}`.trim() || cat || 'Line';
    const to = (conn.to || 'Unknown destination').trim();
    const groupKey = `${lineKey}:::${to}`;

    const { minutes, display, timeClass } = formatWaitingTime(rawTime);
    const clockDisplay = formatTime(rawTime);

    let group = groupedMap.get(groupKey);
    if (!group) {
      group = {
        groupKey,
        lineKey,
        type: cat,
        number: num,
        to,
        times: [],
      };
      groupedMap.set(groupKey, group);
    }

    if (group.times.length < 4) {
      group.times.push({
        relativeTime: display,
        clockTime: clockDisplay,
        timeClass,
        minutes,
      });
    }
  }

  const allGroupedRows = Array.from(groupedMap.values());

  // Partition into important (on top) and regular rows
  const importantRows: GroupedConnectionRow[] = [];
  const regularRows: GroupedConnectionRow[] = [];

  for (const row of allGroupedRows) {
    const isImportant =
      importantLines.includes(row.groupKey) || importantLines.includes(row.lineKey);
    if (isImportant) {
      importantRows.push(row);
    } else {
      regularRows.push(row);
    }
  }

  const displayRows = [...importantRows, ...regularRows];
  const isClock = timeMode === 'clock';

  return (
    <div className="container">
      {/* Offline banner if phone loses connection */}
      {!isOnline && (
        <div className="mb-1 p-1.5 rounded bg-amber-500 text-white text-xs font-medium flex items-center justify-center gap-1.5">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline — departures may not be current</span>
        </div>
      )}

      {/* Header */}
      <div className="header">
        <div className="header-top-row">
          <h1
            className="station-name"
            onClick={() => setIsSearchOpen(true)}
            title="Tap to switch station"
          >
            {stationName}
          </h1>

          {/* Right slot: time toggle + optional PWA install */}
          <div className="header-right-actions">
            <button
              type="button"
              onClick={handleToggleTimeMode}
              className="mode-toggle-btn"
              title={isClock ? 'Switch to relative minutes' : 'Switch to HH:MM time'}
            >
              <Clock className="w-2.5 h-2.5" />
              <span>{isClock ? 'HH:MM' : 'min'}</span>
            </button>

            {!isInstalled && isInstallable && (
              <button
                onClick={install}
                className="p-1 rounded bg-white/20 hover:bg-white/30 text-white text-xs flex items-center"
                title="Install App"
              >
                <Download className="w-3 h-3" />
              </button>
            )}
            {!isInstalled && isIOS && (
              <button
                onClick={() => setShowIOSPrompt(true)}
                className="p-1 rounded bg-white/20 hover:bg-white/30 text-white text-xs flex items-center"
                title="Install on iPhone"
              >
                <Download className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="last-updated">
          {lastUpdateTime ? (
            <>
              Last updated: {formatTimeWithSeconds(new Date(lastUpdateTime))}{' '}
              <span className="countdown inline-flex items-center gap-0.5 ml-1.5">
                <RefreshCw className="w-3 h-3" />
                {secondsRemaining}s
              </span>
            </>
          ) : (
            'Updating...'
          )}
        </div>
      </div>

      {/* Content */}
      <div id="content" className="flex-1 flex flex-col overflow-hidden">
        {statusMessage ? (
          <div className={isError ? 'error-message' : 'loading'}>{statusMessage}</div>
        ) : displayRows.length > 0 ? (
          <ul className="connection-list">
            {displayRows.map((row) => {
              const isImportant =
                importantLines.includes(row.groupKey) ||
                importantLines.includes(row.lineKey);
              const firstDep = row.times[0];
              const nextDeps = row.times.slice(1, 4);

              return (
                <li
                  key={row.groupKey}
                  className={`connection-item ${isImportant ? 'is-important' : ''}`}
                >
                  {/* Star icon to toggle importance */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleImportant(e, row)}
                    className={`star-btn ${isImportant ? 'active' : ''}`}
                    title={
                      isImportant
                        ? `Remove ${row.lineKey} from top`
                        : `Keep ${row.lineKey} on top`
                    }
                    aria-label={`Mark ${row.lineKey} to ${row.to} as important`}
                  >
                    <Star
                      className="w-4 h-4"
                      fill={isImportant ? '#f59e0b' : 'none'}
                      stroke={isImportant ? '#f59e0b' : '#9ca3af'}
                    />
                  </button>

                  {/* Line Category and Number */}
                  <div className="connection-type">
                    {row.type}{row.number ? ` ${row.number}` : ''}
                  </div>

                  {/* Destination */}
                  <div className="connection-destination">{row.to}</div>

                  {/* First Departure Column (Bigger Font) */}
                  <div
                    className={`connection-time-first ${isClock ? 'clock-mode' : ''} ${firstDep.timeClass}`}
                  >
                    {isClock ? firstDep.clockTime : firstDep.relativeTime}
                  </div>

                  {/* Following Departures Column */}
                  <div className={`connection-time-next ${isClock ? 'clock-mode' : ''}`}>
                    {nextDeps.map((dep, slotIdx) => (
                      <span key={slotIdx} className={dep.timeClass}>
                        {isClock ? dep.clockTime : dep.relativeTime}
                      </span>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="error-message">No upcoming departures found</div>
        )}
      </div>

      {/* Station Search Modal (when tapping station name) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-4 flex flex-col max-h-[85vh] text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-base">Select Station</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS locate button */}
            <button
              onClick={() => {
                setIsSearchOpen(false);
                initGeolocation(false);
              }}
              className="mt-3 w-full py-2 px-3 rounded-lg bg-[#004f9f] text-white font-medium text-xs flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              Use Current Location
            </button>

            {/* Search input */}
            <div className="mt-3 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Swiss station..."
                autoFocus
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#004f9f]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Results or Presets */}
            <div className="mt-3 overflow-y-auto flex-1 divide-y divide-gray-100">
              {isSearching ? (
                <div className="py-4 text-center text-xs text-gray-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      useGpsModeRef.current = false;
                      setIsSearchOpen(false);
                      setSearchTerm('');
                      loadStationData(s.id, s.name);
                    }}
                    className="w-full text-left py-2 px-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{s.name}</span>
                  </button>
                ))
              ) : (
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider py-1.5">
                    Popular Stations
                  </div>
                  {PRESET_STATIONS.slice(0, 6).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        useGpsModeRef.current = false;
                        setIsSearchOpen(false);
                        loadStationData(preset.id, preset.name);
                      }}
                      className="w-full text-left py-2 px-2 text-sm hover:bg-gray-100 rounded flex items-center justify-between"
                    >
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-[11px] text-gray-400">{preset.canton}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari PWA Install Modal */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-xs w-full rounded-xl p-5 shadow-xl text-center text-slate-800">
            <h3 className="font-bold text-base mb-2">Install on iPhone</h3>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              1. Tap the <strong>Share</strong> button in Safari.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.
            </p>
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full py-2 bg-[#004f9f] text-white rounded-lg text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
