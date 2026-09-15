import React from 'react';
import { Compass, Sparkles, Bookmark, RotateCcw, ArrowUpRight } from 'lucide-react';
import { CURRENCY_SYMBOLS } from '../services/travelEngine';

interface HeaderProps {
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  onCurrencyChange: (c: 'INR' | 'USD' | 'EUR' | 'GBP') => void;
  onReset: () => void;
  savedTripsCount: number;
  onOpenSavedTrips: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currency,
  onCurrencyChange,
  onReset,
  savedTripsCount,
  onOpenSavedTrips,
  onNavigateSection,
}) => {
  return (
    <header
      id="app-main-header"
      className="sticky top-0 z-40 bg-[#08070e]/90 backdrop-blur-md border-b border-[#231f33]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo & Wordmark matching the reference UI */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div
            id="brand-logo-container"
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5e17eb] to-[#8a3ffc] text-white flex items-center justify-center shadow-[0_0_20px_rgba(94,23,235,0.5)] border border-[#7a28f5]"
          >
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white leading-none">
                BeyondTrip<span className="text-[#864bff]">.</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1c1433] text-[#c084fc] border border-[#5e17eb]/50">
                <Sparkles className="w-2.5 h-2.5 text-[#a87ffb]" />
                AI Assistant
              </span>
            </div>
            <p className="text-[11px] text-[#9a97b4] hidden sm:block mt-0.5">
              Decide transportation, places & stays
            </p>
          </div>
        </div>

        {/* Center Navigation Links matching reference UI */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#9a97b4]">
          <a
            href="#section-transport-recommendation"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection?.('transport');
            }}
            className="hover:text-white transition-colors"
          >
            Transportation
          </a>
          <a
            href="#section-nearby-places"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection?.('places');
            }}
            className="hover:text-white transition-colors"
          >
            Attractions
          </a>
          <a
            href="#section-stay-recommendations"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection?.('stays');
            }}
            className="hover:text-white transition-colors"
          >
            Budget Stays
          </a>
          <a
            href="#section-trip-cost-and-itinerary"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection?.('cost');
            }}
            className="hover:text-white transition-colors"
          >
            Trip Cost
          </a>
          <a
            href="#interactive-map-wrapper"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection?.('map');
            }}
            className="hover:text-white transition-colors"
          >
            Map
          </a>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center bg-[#13111c] rounded-xl p-1 border border-[#231f33]">
            {(['INR', 'USD', 'EUR', 'GBP'] as const).map((curr) => (
              <button
                key={curr}
                id={`currency-btn-${curr.toLowerCase()}`}
                type="button"
                onClick={() => onCurrencyChange(curr)}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  currency === curr
                    ? 'bg-[#5e17eb] text-white shadow-[0_0_10px_rgba(94,23,235,0.4)]'
                    : 'text-[#9a97b4] hover:text-white'
                }`}
              >
                {CURRENCY_SYMBOLS[curr]} {curr}
              </button>
            ))}
          </div>

          {/* Saved Trips Ghost Button */}
          <button
            id="header-saved-trips-btn"
            type="button"
            onClick={onOpenSavedTrips}
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#13111c] hover:bg-[#1a1628] rounded-xl border border-[#231f33] transition-all"
            title="Saved Trips"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#a87ffb]" />
            <span className="hidden sm:inline">Saved Plans</span>
            {savedTripsCount > 0 && (
              <span
                id="saved-trips-count-badge"
                className="w-4 h-4 text-[10px] rounded-full bg-[#5e17eb] text-white flex items-center justify-center font-bold"
              >
                {savedTripsCount}
              </span>
            )}
          </button>

          {/* Reset Action */}
          <button
            id="header-reset-btn"
            type="button"
            onClick={onReset}
            className="p-2 text-[#9a97b4] hover:text-white hover:bg-[#13111c] rounded-xl border border-transparent hover:border-[#231f33] transition-colors"
            title="New Trip Search"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
