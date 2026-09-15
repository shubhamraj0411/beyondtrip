import React, { useState } from 'react';
import {
  MapPin,
  ArrowRightLeft,
  Calendar,
  Clock,
  Users,
  Wallet,
  Sparkles,
  Zap,
  Tag,
  ShieldCheck,
  Scale,
  ArrowUpRight,
  Star,
  Compass
} from 'lucide-react';
import { TripQuery, TravelPreference } from '../types/travel';
import { CURRENCY_SYMBOLS } from '../services/travelEngine';

interface TripSearchFormProps {
  initialQuery: TripQuery;
  onSearch: (query: TripQuery) => void;
  isLoading: boolean;
}

const PRESET_ROUTES = [
  { origin: 'Delhi', dest: 'Agra', label: 'Delhi → Agra', tag: 'Mughal Heritage' },
  { origin: 'Delhi', dest: 'Jaipur', label: 'Delhi → Jaipur', tag: 'Pink City' },
  { origin: 'Mumbai', dest: 'Goa', label: 'Mumbai → Goa', tag: 'Coastal Express' },
  { origin: 'Bengaluru', dest: 'Mysore', label: 'Bengaluru → Mysore', tag: 'Palace Corridor' },
];

const PREFERENCE_OPTIONS: {
  id: TravelPreference;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'cheapest',
    label: 'Cheapest',
    sublabel: 'Max savings on bus & rail',
    icon: Tag,
  },
  {
    id: 'fastest',
    label: 'Fastest',
    sublabel: 'High-speed express & direct routes',
    icon: Zap,
  },
  {
    id: 'convenient',
    label: 'Most Convenient',
    sublabel: 'Chauffeur taxi & door-to-door comfort',
    icon: ShieldCheck,
  },
  {
    id: 'balanced',
    label: 'Balanced',
    sublabel: 'Optimal balance of cost, time & comfort',
    icon: Scale,
  },
];

export const TripSearchForm: React.FC<TripSearchFormProps> = ({
  initialQuery,
  onSearch,
  isLoading,
}) => {
  const [origin, setOrigin] = useState(initialQuery.origin);
  const [destination, setDestination] = useState(initialQuery.destination);
  const [departureDate, setDepartureDate] = useState(initialQuery.departureDate);
  const [departureTime, setDepartureTime] = useState(initialQuery.departureTime);
  const [travelers, setTravelers] = useState(initialQuery.travelers);
  const [budget, setBudget] = useState(initialQuery.budget);
  const [preference, setPreference] = useState<TravelPreference>(initialQuery.preference);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const applyPreset = (presetOrigin: string, presetDest: string) => {
    setOrigin(presetOrigin);
    setDestination(presetDest);
    onSearch({
      ...initialQuery,
      origin: presetOrigin,
      destination: presetDest,
      departureDate,
      departureTime,
      travelers,
      budget,
      preference,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    onSearch({
      ...initialQuery,
      origin: origin.trim(),
      destination: destination.trim(),
      departureDate,
      departureTime,
      travelers,
      budget,
      preference,
    });
  };

  const currencySymbol = CURRENCY_SYMBOLS[initialQuery.currency] || '₹';

  return (
    <div className="space-y-6">
      {/* Hero Header matching reference aesthetic */}
      <div className="text-center relative pt-4 pb-2 space-y-3">
        {/* Glowing badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18122c] border border-[#5e17eb]/60 text-xs font-semibold text-[#c084fc] shadow-[0_0_20px_rgba(94,23,235,0.3)]">
          <Sparkles className="w-3.5 h-3.5 text-[#a87ffb]" />
          <span>Multimodal AI Decision Engine • Transit, Places & Stays</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-[1.15]">
          Travel Smarter. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a87ffb] to-[#5e17eb]">Decide Faster.</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#9a97b4] max-w-xl mx-auto leading-relaxed">
          Compare total travel time, fares, distance, and CO₂ emissions across trains, buses, and cabs—paired with handpicked sights and budget accommodation.
        </p>

        {/* Social Proof Bar matching reference UI */}
        <div className="inline-flex items-center gap-4 px-4 py-2 rounded-2xl bg-[#110e1b] border border-[#231f33] text-xs text-[#9a97b4]">
          <div className="flex items-center gap-1 text-white font-bold">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400" />
              ))}
            </div>
            <span>5/5 Rating</span>
          </div>
          <div className="w-px h-3.5 bg-[#231f33]" />
          <span>Trusted by <strong>14,000+</strong> smart travelers</span>
          <div className="w-px h-3.5 bg-[#231f33] hidden sm:block" />
          <span className="text-[#a87ffb] hidden sm:inline">Zero Ads • 100% Objective</span>
        </div>
      </div>

      {/* Main Search Card */}
      <div
        id="trip-search-form-card"
        className="bg-[#110e1b] rounded-3xl border border-[#231f33] shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-5 sm:p-7 transition-all relative overflow-hidden"
      >
        {/* Subtle Ambient Radial Glow inside card */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#5e17eb]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Route Presets Bar */}
        <div className="mb-5 flex items-center justify-between flex-wrap gap-2 relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9a97b4]">
            Popular Quick Corridors:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESET_ROUTES.map((route, idx) => (
              <button
                key={idx}
                id={`preset-route-btn-${idx}`}
                type="button"
                onClick={() => applyPreset(route.origin, route.dest)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all inline-flex items-center gap-1 cursor-pointer ${
                  origin.toLowerCase() === route.origin.toLowerCase() &&
                  destination.toLowerCase() === route.dest.toLowerCase()
                    ? 'bg-[#5e17eb] text-white border border-[#7a28f5] font-semibold shadow-[0_0_15px_rgba(94,23,235,0.4)]'
                    : 'bg-[#181426] text-[#9a97b4] hover:text-white hover:bg-[#201b33] border border-[#231f33]'
                }`}
              >
                <span>{route.label}</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Origin & Destination Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Starting Location */}
            <div className="md:col-span-5 relative">
              <label
                htmlFor="input-origin"
                className="block text-xs font-semibold text-[#9a97b4] mb-1.5"
              >
                Starting Location (Origin)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  id="input-origin"
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Delhi, Mumbai, Bengaluru"
                  className="w-full pl-10 pr-3 py-3 bg-[#181426] border border-[#2e2847] rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#5e17eb] focus:border-[#7a28f5] transition-all font-medium placeholder-[#5c5678]"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-2 flex justify-center pt-2 md:pt-6">
              <button
                id="btn-swap-locations"
                type="button"
                onClick={handleSwap}
                className="p-3 rounded-2xl border border-[#2e2847] bg-[#181426] hover:bg-[#231e36] text-[#9a97b4] hover:text-white transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Swap starting point and destination"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Destination */}
            <div className="md:col-span-5 relative">
              <label
                htmlFor="input-destination"
                className="block text-xs font-semibold text-[#9a97b4] mb-1.5"
              >
                Destination
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  id="input-destination"
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Agra, Jaipur, Goa, Manali"
                  className="w-full pl-10 pr-3 py-3 bg-[#181426] border border-[#2e2847] rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#5e17eb] focus:border-[#7a28f5] transition-all font-medium placeholder-[#5c5678]"
                />
              </div>
            </div>
          </div>

          {/* Date, Time, Travelers, Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Departure Date */}
            <div>
              <label
                htmlFor="input-departure-date"
                className="block text-xs font-semibold text-[#9a97b4] mb-1.5"
              >
                Departure Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5c5678]">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="input-departure-date"
                  type="date"
                  required
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#181426] border border-[#2e2847] rounded-2xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#5e17eb] focus:border-[#7a28f5] transition-all"
                />
              </div>
            </div>

            {/* Departure Time */}
            <div>
              <label
                htmlFor="input-departure-time"
                className="block text-xs font-semibold text-[#9a97b4] mb-1.5"
              >
                Preferred Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5c5678]">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  id="input-departure-time"
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#181426] border border-[#2e2847] rounded-2xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#5e17eb] focus:border-[#7a28f5] transition-all"
                />
              </div>
            </div>

            {/* Travelers Count */}
            <div>
              <label
                htmlFor="input-travelers-count"
                className="block text-xs font-semibold text-[#9a97b4] mb-1.5"
              >
                Number of Travelers
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5c5678]">
                  <Users className="w-4 h-4" />
                </div>
                <select
                  id="input-travelers-count"
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#181426] border border-[#2e2847] rounded-2xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#5e17eb] focus:border-[#7a28f5] transition-all cursor-pointer"
                >
                  <option value={1}>1 Traveler (Solo)</option>
                  <option value={2}>2 Travelers (Couple / Duo)</option>
                  <option value={3}>3 Travelers (Small Group)</option>
                  <option value={4}>4 Travelers (Family / Friends)</option>
                  <option value={5}>5 Travelers (Group)</option>
                  <option value={6}>6+ Travelers (Large Group)</option>
                </select>
              </div>
            </div>

            {/* Approximate Budget */}
            <div>
              <label
                htmlFor="input-approx-budget"
                className="block text-xs font-semibold text-[#9a97b4] mb-1.5"
              >
                Approx. Budget ({initialQuery.currency})
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a87ffb] font-bold text-sm">
                  {currencySymbol}
                </div>
                <input
                  id="input-approx-budget"
                  type="number"
                  min={500}
                  step={500}
                  value={budget}
                  onChange={(e) => setBudget(Math.max(500, Number(e.target.value)))}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#181426] border border-[#2e2847] rounded-2xl text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#5e17eb] focus:border-[#7a28f5] transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Priority / Preference Selector */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9a97b4] mb-2.5">
              Select Your Travel Priority
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {PREFERENCE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = preference === opt.id;
                return (
                  <button
                    key={opt.id}
                    id={`pref-option-${opt.id}`}
                    type="button"
                    onClick={() => setPreference(opt.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#5e17eb] to-[#4509b5] border-[#7a28f5] text-white shadow-[0_0_20px_rgba(94,23,235,0.4)]'
                        : 'bg-[#181426] border-[#2e2847] text-[#9a97b4] hover:text-white hover:border-[#423a63]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#a87ffb]'}`} />
                        <span className="text-sm font-bold text-white">{opt.label}</span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      )}
                    </div>
                    <p className={`text-[11px] leading-snug line-clamp-1 ${isSelected ? 'text-purple-100' : 'text-[#7e789c]'}`}>
                      {opt.sublabel}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action matching reference button style */}
          <div className="pt-3 flex items-center justify-end">
            <button
              id="btn-analyze-travel"
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#5e17eb] hover:bg-[#732bf5] text-white text-sm font-bold transition-all shadow-[0_0_25px_rgba(94,23,235,0.5)] active:scale-95 disabled:opacity-75 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing transportation & stays...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Compare & Recommend Journey</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
