import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { FormattedDeparture } from '../types/transit';
import { CategoryBadge } from './CategoryBadge';
import { formatTime } from '../services/transportApi';

interface DepartureRowProps {
  departure: FormattedDeparture;
  index: number;
}

export const DepartureRow: React.FC<DepartureRowProps> = ({ departure, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Time class colors matching original concept
  const badgeStyle = {
    now: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse font-black',
    soon: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold',
    later: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold',
  }[departure.timeClass];

  const hasStops = departure.passList && departure.passList.length > 0;

  return (
    <div
      className={`group transition-all duration-150 border-b border-slate-200 dark:border-slate-800/80 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
        isExpanded ? 'bg-slate-50 dark:bg-slate-800/40' : ''
      }`}
    >
      <div
        onClick={() => hasStops && setIsExpanded(!isExpanded)}
        className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 select-none ${
          hasStops ? 'cursor-pointer' : ''
        }`}
      >
        {/* Index counter */}
        <span className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 w-4 text-center shrink-0 hidden sm:block">
          {index + 1}
        </span>

        {/* Transport Type / Line Badge */}
        <div className="shrink-0 min-w-[76px] sm:min-w-[88px]">
          <CategoryBadge category={departure.type} number={departure.number} />
        </div>

        {/* Destination & Platform info */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100 truncate tracking-tight">
              {departure.destination}
            </h3>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {departure.operator && (
              <span className="uppercase text-[11px] font-mono tracking-wider text-slate-400 dark:text-slate-500">
                {departure.operator}
              </span>
            )}

            {departure.platform && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 font-mono font-semibold text-[11px]">
                Pl. {departure.platform}
              </span>
            )}

            {departure.delayMinutes && departure.delayMinutes > 0 ? (
              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-mono font-semibold">
                <AlertTriangle className="w-3 h-3" />
                +{departure.delayMinutes} min delay
              </span>
            ) : null}
          </div>
        </div>

        {/* Scheduled Departure Time */}
        <div className="text-right shrink-0">
          <div className="font-mono text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
            {departure.scheduledTime}
          </div>
          {departure.delayMinutes && departure.delayMinutes > 0 ? (
            <div className="text-[11px] font-mono line-through text-slate-400">
              {departure.scheduledTime}
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Sched.</div>
          )}
        </div>

        {/* Remaining Time / Live Countdown Status */}
        <div className="shrink-0 text-right min-w-[70px] sm:min-w-[85px]">
          <span
            className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs sm:text-sm font-mono tracking-wide ${badgeStyle}`}
          >
            {departure.timeDisplay}
          </span>
        </div>

        {/* Expand Stops indicator */}
        {hasStops && (
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 shrink-0 -mr-1"
            title={isExpanded ? 'Hide route stops' : 'Show route stops'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Expanded Stops Timeline */}
      {isExpanded && hasStops && (
        <div className="px-4 pb-4 pt-1 sm:pl-16 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/70 dark:bg-slate-900/50">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Route & Intermediate Stops
          </div>

          <div className="relative pl-4 space-y-2 border-l-2 border-slate-300 dark:border-slate-700">
            {departure.passList?.map((stop, sIdx) => {
              const stopName = stop.station?.name || 'Waystation';
              const stopTime = formatTime(stop.arrival || stop.departure);
              const isFinal = sIdx === (departure.passList?.length || 1) - 1;

              return (
                <div key={`${stopName}-${sIdx}`} className="relative flex items-center justify-between text-xs py-0.5">
                  <div
                    className={`absolute -left-[21px] w-2.5 h-2.5 rounded-full ${
                      isFinal
                        ? 'bg-red-500 ring-2 ring-red-300'
                        : 'bg-slate-400 dark:bg-slate-600'
                    }`}
                  />
                  <span className={`font-medium ${isFinal ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                    {stopName}
                  </span>
                  <div className="flex items-center gap-2">
                    {stop.platform && (
                      <span className="text-[10px] font-mono px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Pl. {stop.platform}
                      </span>
                    )}
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {stopTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
