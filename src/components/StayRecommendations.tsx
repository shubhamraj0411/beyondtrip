import React from 'react';
import {
  Hotel,
  Star,
  MapPin,
  CheckCircle2,
  Wifi,
  Coffee,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { StayOption } from '../types/travel';
import { CURRENCY_SYMBOLS, convertFromINR } from '../services/travelEngine';

interface StayRecommendationsProps {
  stays: StayOption[];
  selectedStayId: string;
  onSelectStay: (stay: StayOption) => void;
  destination: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  travelers: number;
}

const CATEGORY_META = {
  best_budget: {
    num: '01',
    label: 'Best Budget Option',
    sublabel: 'Lowest tariff without sacrificing clean comfort',
    icon: TrendingDown,
    badgeBg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400',
  },
  best_value: {
    num: '02',
    label: 'Best Value for Money',
    sublabel: 'Highest amenities ratio and complimentary perks',
    icon: Sparkles,
    badgeBg: 'bg-[#18122c] border-[#5e17eb]/60 text-[#c084fc]',
  },
  best_rated: {
    num: '03',
    label: 'Best-Rated Option',
    sublabel: 'Top guest sentiment & exceptional service ratings',
    icon: Star,
    badgeBg: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
  },
  closest: {
    num: '04',
    label: 'Closest Option',
    sublabel: 'Minutes walk to transit station and main monument',
    icon: Clock,
    badgeBg: 'bg-blue-950/70 border-blue-500/40 text-blue-300',
  },
};

export const StayRecommendations: React.FC<StayRecommendationsProps> = ({
  stays,
  selectedStayId,
  onSelectStay,
  destination,
  currency,
  travelers,
}) => {
  const currSymbol = CURRENCY_SYMBOLS[currency] || '₹';

  return (
    <section id="section-stay-recommendations" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a87ffb]">
              Step 3
            </span>
            <div className="w-1 h-1 rounded-full bg-[#5e17eb]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Budget-Friendly Accommodation
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#18122c] text-[#c084fc] border border-[#5e17eb]/40">
              {destination}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#9a97b4] mt-1">
            Carefully curated across 4 core traveler priorities: lowest budget, value for money, guest ratings, and closest proximity
          </p>
        </div>
      </div>

      {/* 4 Categorized Cards Grid matching reference numbered cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stays.map((stay) => {
          const isSelected = selectedStayId === stay.id;
          const meta = CATEGORY_META[stay.category] || CATEGORY_META.best_budget;
          const CategoryIcon = meta.icon;

          return (
            <div
              key={stay.id}
              id={`stay-card-${stay.id}`}
              className={`rounded-3xl border p-6 transition-all flex flex-col justify-between group relative overflow-hidden ${
                isSelected
                  ? 'bg-[#181329] border-[#7a28f5] shadow-[0_0_25px_rgba(94,23,235,0.35)] ring-1 ring-[#5e17eb]'
                  : 'bg-[#110e1b] border-[#231f33] hover:border-[#383152] hover:bg-[#151221]'
              }`}
            >
              <div>
                {/* Number Indicator & Category Tag matching reference UI */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-3xl font-black text-[#2e2847] group-hover:text-[#5e17eb]/40 transition-colors font-mono">
                    {meta.num}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${meta.badgeBg}`}
                  >
                    <CategoryIcon className="w-3 h-3" />
                    <span>{meta.label}</span>
                  </span>
                </div>

                {/* Hotel Name & Type */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-bold text-white text-base leading-snug">
                    {stay.name}
                  </h4>
                  <ArrowUpRight className="w-4 h-4 text-[#5c5678] group-hover:text-[#a87ffb] shrink-0 mt-0.5" />
                </div>
                <p className="text-xs text-[#9a97b4] mb-3">{stay.type}</p>

                {/* Rating & Distance */}
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#181426] border border-[#231f33] mb-3 text-xs">
                  <div className="flex items-center gap-1 text-amber-300 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{stay.rating}</span>
                    <span className="text-[10px] text-[#9a97b4] font-normal">
                      ({stay.reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#9a97b4] text-[11px]">
                    <MapPin className="w-3 h-3 text-[#a87ffb]" />
                    <span>{stay.distanceFromStationKm} km from hub</span>
                  </div>
                </div>

                {/* Proximity Highlight */}
                <p className="text-[11px] text-[#c084fc] font-medium bg-[#18122c] p-2.5 rounded-xl border border-[#5e17eb]/30 mb-3.5 leading-tight">
                  📍 {stay.proximityHighlight}
                </p>

                {/* Amenities Chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {stay.amenities.map((amenity, aIdx) => (
                    <span
                      key={aIdx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#181426] text-[#9a97b4] border border-[#231f33]"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing & Selection */}
              <div className="pt-3.5 border-t border-[#231f33] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5c5678] block">
                    Per Night
                  </span>
                  <span className="text-sm font-extrabold text-white">
                    {currSymbol}
                    {convertFromINR(stay.pricePerNight, currency).toLocaleString()}
                  </span>
                </div>

                <button
                  id={`btn-select-stay-${stay.id}`}
                  type="button"
                  onClick={() => onSelectStay(stay)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#5e17eb] text-white shadow-[0_0_15px_rgba(94,23,235,0.4)]'
                      : 'bg-[#181426] hover:bg-[#221c36] text-white border border-[#2e2847]'
                  }`}
                >
                  {isSelected ? '✓ Selected' : 'Choose Stay'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
