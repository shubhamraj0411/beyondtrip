import React from 'react';
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  Bookmark,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  Zap,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { TransportOption, StayOption, NearbyPlace, ItineraryDay, TravelPreference } from '../types/travel';
import { CURRENCY_SYMBOLS, convertFromINR } from '../services/travelEngine';

interface TripCostOverviewProps {
  selectedTransport: TransportOption;
  selectedStay: StayOption;
  selectedPlaces: NearbyPlace[];
  itinerary: ItineraryDay[];
  userBudget: number;
  travelers: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  activePreference: TravelPreference;
  onPreferenceChange: (pref: TravelPreference) => void;
  onSavePlan?: () => void;
  isSaved?: boolean;
}

const PREF_BUTTONS: { id: TravelPreference; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'cheapest', label: 'Cheapest', icon: TrendingDown },
  { id: 'fastest', label: 'Fastest', icon: Zap },
  { id: 'convenient', label: 'Convenient', icon: ShieldCheck },
  { id: 'balanced', label: 'Balanced', icon: Scale },
];

export const TripCostOverview: React.FC<TripCostOverviewProps> = ({
  selectedTransport,
  selectedStay,
  selectedPlaces,
  itinerary,
  userBudget,
  travelers,
  currency,
  activePreference,
  onPreferenceChange,
  onSavePlan,
  isSaved,
}) => {
  const currSymbol = CURRENCY_SYMBOLS[currency] || '₹';

  // Real-time dynamic cost calculation
  const transportCost = selectedTransport.totalCost;
  const stayCost = selectedStay.pricePerNight * Math.max(1, Math.ceil(travelers / 2));
  const activitiesCost = selectedPlaces.reduce((sum, p) => sum + p.ticketPrice * travelers, 0);
  const foodAndBufferCost = 600 * travelers * 2; // ~2 days food buffer

  const grandTotalCost = transportCost + stayCost + activitiesCost + foodAndBufferCost;

  const budgetConverted = convertFromINR(userBudget, currency);
  const totalCostConverted = convertFromINR(grandTotalCost, currency);
  const diffConverted = Math.abs(budgetConverted - totalCostConverted);
  const isUnderBudget = totalCostConverted <= budgetConverted;
  const budgetPct = Math.min(100, Math.round((totalCostConverted / budgetConverted) * 100));

  return (
    <section id="section-trip-cost-and-itinerary" className="space-y-6">
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a87ffb]">
              Step 4
            </span>
            <div className="w-1 h-1 rounded-full bg-[#5e17eb]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Trip Cost Overview & Itinerary
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#9a97b4] mt-1">
            Real-time financial breakdown comparing total expenses with your target budget, plus a day-by-day schedule
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 bg-[#110e1b] p-1 rounded-2xl border border-[#231f33] self-start sm:self-auto">
          {PREF_BUTTONS.map((pref) => {
            const Icon = pref.icon;
            const isSelected = activePreference === pref.id;
            return (
              <button
                key={pref.id}
                id={`cost-pref-${pref.id}`}
                type="button"
                onClick={() => onPreferenceChange(pref.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#5e17eb] text-white shadow-[0_0_10px_rgba(94,23,235,0.4)]'
                    : 'text-[#9a97b4] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{pref.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cost Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Total Budget vs Actual Expense */}
        <div
          id="cost-budget-summary-card"
          className="lg:col-span-5 bg-[#110e1b] rounded-3xl border border-[#231f33] p-6 sm:p-7 space-y-5 flex flex-col justify-between shadow-xl"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9a97b4] flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-[#a87ffb]" />
                Budget Health
              </span>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${
                  isUnderBudget
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400'
                    : 'bg-rose-950/70 border-rose-500/40 text-rose-400'
                }`}
              >
                {isUnderBudget ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Within Target Budget</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Exceeds Target Budget</span>
                  </>
                )}
              </span>
            </div>

            {/* Big Numbers */}
            <div className="space-y-1">
              <span className="text-xs text-[#9a97b4]">Estimated Grand Total</span>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {currSymbol}
                {totalCostConverted.toLocaleString()}
                <span className="text-xs font-normal text-[#9a97b4] ml-2">
                  for {travelers} traveler{travelers > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Target comparison */}
            <div className="mt-4 p-4 rounded-2xl bg-[#181426] border border-[#231f33] text-xs space-y-2.5">
              <div className="flex justify-between items-center text-[#9a97b4]">
                <span>Your Budget Target:</span>
                <span className="text-white font-bold">
                  {currSymbol}
                  {budgetConverted.toLocaleString()}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#231f33] h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isUnderBudget ? 'bg-gradient-to-r from-[#5e17eb] to-emerald-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, budgetPct)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#9a97b4]">{budgetPct}% of target</span>
                <span className={isUnderBudget ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {isUnderBudget
                    ? `Save ${currSymbol}${diffConverted.toLocaleString()}`
                    : `Over by ${currSymbol}${diffConverted.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick takeaway note */}
          <p className="text-xs text-[#9a97b4] leading-relaxed pt-3 border-t border-[#231f33]">
            💡 Total includes selected {selectedTransport.title}, {selectedStay.name} (1 night), {selectedPlaces.length} attractions, and local food buffer.
          </p>
        </div>

        {/* Right: 4 Cost Pillars */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Pillar 1: Transportation */}
          <div className="bg-[#110e1b] rounded-3xl border border-[#231f33] p-5 flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-[11px] font-bold text-[#a87ffb] uppercase tracking-wider block mb-1">
                1. Transportation
              </span>
              <h4 className="text-white font-bold text-sm line-clamp-1 mb-1">
                {selectedTransport.title}
              </h4>
              <p className="text-xs text-[#9a97b4]">
                {selectedTransport.travelTimeDisplay} • {selectedTransport.distanceKm} km
              </p>
            </div>
            <div className="pt-4 border-t border-[#231f33] mt-3 flex justify-between items-baseline">
              <span className="text-[11px] text-[#5c5678]">Total fare</span>
              <strong className="text-white text-base font-extrabold">
                {currSymbol}
                {convertFromINR(transportCost, currency).toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Pillar 2: Stay */}
          <div className="bg-[#110e1b] rounded-3xl border border-[#231f33] p-5 flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-[11px] font-bold text-[#a87ffb] uppercase tracking-wider block mb-1">
                2. Accommodation
              </span>
              <h4 className="text-white font-bold text-sm line-clamp-1 mb-1">
                {selectedStay.name}
              </h4>
              <p className="text-xs text-[#9a97b4]">
                1 Night • {selectedStay.type}
              </p>
            </div>
            <div className="pt-4 border-t border-[#231f33] mt-3 flex justify-between items-baseline">
              <span className="text-[11px] text-[#5c5678]">Lodging tariff</span>
              <strong className="text-white text-base font-extrabold">
                {currSymbol}
                {convertFromINR(stayCost, currency).toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Pillar 3: Sights / Activities */}
          <div className="bg-[#110e1b] rounded-3xl border border-[#231f33] p-5 flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-[11px] font-bold text-[#a87ffb] uppercase tracking-wider block mb-1">
                3. Entry & Sightseeing
              </span>
              <h4 className="text-white font-bold text-sm line-clamp-1 mb-1">
                {selectedPlaces.length} Selected Sights
              </h4>
              <p className="text-xs text-[#9a97b4] line-clamp-1">
                {selectedPlaces.length > 0
                  ? selectedPlaces.map((p) => p.name).join(', ')
                  : 'No attractions added'}
              </p>
            </div>
            <div className="pt-4 border-t border-[#231f33] mt-3 flex justify-between items-baseline">
              <span className="text-[11px] text-[#5c5678]">Tickets total</span>
              <strong className="text-white text-base font-extrabold">
                {currSymbol}
                {convertFromINR(activitiesCost, currency).toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Pillar 4: Food & Local Buffer */}
          <div className="bg-[#110e1b] rounded-3xl border border-[#231f33] p-5 flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-[11px] font-bold text-[#a87ffb] uppercase tracking-wider block mb-1">
                4. Food & Local Buffer
              </span>
              <h4 className="text-white font-bold text-sm line-clamp-1 mb-1">
                Meals & Auto-Rickshaws
              </h4>
              <p className="text-xs text-[#9a97b4]">
                Local transit, tea, snacks & essentials
              </p>
            </div>
            <div className="pt-4 border-t border-[#231f33] mt-3 flex justify-between items-baseline">
              <span className="text-[11px] text-[#5c5678]">Estimated buffer</span>
              <strong className="text-white text-base font-extrabold">
                {currSymbol}
                {convertFromINR(foodAndBufferCost, currency).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Day-by-Day Itinerary Timeline */}
      <div
        id="itinerary-timeline-container"
        className="bg-[#110e1b] rounded-3xl border border-[#231f33] p-6 sm:p-7 space-y-6 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[#231f33] pb-4">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-[#a87ffb]" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Synchronized Day-by-Day Itinerary
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#18122c] text-[#c084fc] border border-[#5e17eb]/40">
            {itinerary.length} Days Planned
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {itinerary.map((day: ItineraryDay) => (
            <div
              key={day.dayNumber}
              className="bg-[#181426] rounded-2xl border border-[#231f33] p-5 space-y-4"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-[#231f33] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#a87ffb] block">
                    Day {day.dayNumber}
                  </span>
                  <h4 className="font-bold text-white text-sm">{day.title}</h4>
                </div>
              </div>

              {/* Day Items */}
              <div className="space-y-3">
                {day.items.map((item, eIdx) => (
                  <div key={eIdx} className="flex items-start gap-3 text-xs">
                    <div className="w-18 shrink-0 font-mono text-[10px] font-bold text-[#a87ffb] bg-[#110e1b] px-2 py-1 rounded-lg border border-[#231f33] text-center">
                      {item.timeSlot}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-white text-xs">{item.activityTitle}</p>
                      <p className="text-[11px] text-[#9a97b4] leading-relaxed">
                        {item.description}
                      </p>
                      {item.locationName && (
                        <span className="text-[10px] text-[#5c5678] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#a87ffb]" />
                          {item.locationName}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
