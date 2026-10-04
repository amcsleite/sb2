import React from 'react';
import { Train, Bus, Compass, Navigation } from 'lucide-react';

interface CategoryBadgeProps {
  category: string;
  number: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, number, size = 'md' }) => {
  const cat = (category || '').trim().toUpperCase();

  // Determine styling based on Swiss transit categories
  let bgClass = 'bg-blue-950 text-white border-blue-800';
  let label = cat;
  let Icon = Train;

  if (cat === 'S' || cat.startsWith('S')) {
    // S-Bahn
    bgClass = 'bg-blue-600 text-white border-blue-500 font-bold';
    label = 'S';
    Icon = Train;
  } else if (cat === 'IC' || cat === 'ICE' || cat === 'TGV' || cat === 'EC') {
    // InterCity / High-speed
    bgClass = 'bg-red-600 text-white border-red-500 font-bold';
    Icon = Train;
  } else if (cat === 'IR' || cat === 'RE') {
    // InterRegio / RegioExpress
    bgClass = 'bg-slate-800 text-white border-slate-700 font-semibold';
    Icon = Train;
  } else if (cat === 'R') {
    // Regio
    bgClass = 'bg-slate-700 text-slate-100 border-slate-600';
    Icon = Train;
  } else if (cat === 'B' || cat === 'BUS' || cat.includes('BUS')) {
    // Bus
    bgClass = 'bg-amber-600 text-amber-950 border-amber-500 font-semibold';
    label = 'BUS';
    Icon = Bus;
  } else if (cat === 'T' || cat === 'TRAM' || cat.includes('TRAM')) {
    // Tram
    bgClass = 'bg-emerald-600 text-white border-emerald-500 font-semibold';
    label = 'TRAM';
    Icon = Navigation;
  } else if (cat === 'BAT' || cat === 'SHIP' || cat === 'SCHIFF') {
    // Boat
    bgClass = 'bg-cyan-700 text-white border-cyan-600 font-medium';
    label = 'BAT';
    Icon = Compass;
  } else if (cat === 'FUN' || cat === 'CAB' || cat === 'GB') {
    // Cable car / Funicular
    bgClass = 'bg-purple-700 text-white border-purple-600 font-medium';
    Icon = Compass;
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border shadow-xs tracking-wide shrink-0 ${bgClass} ${paddingClass}`}
      title={`${category} ${number}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span className="font-mono font-bold leading-none">{label}</span>
      {number && <span className="font-mono font-black text-white leading-none">{number}</span>}
    </div>
  );
};
