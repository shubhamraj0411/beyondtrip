import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Star,
  Sparkles,
  Plus,
  Check,
  Building,
  Landmark,
  Trees,
  Utensils,
  ShoppingBag,
  Film,
  Users,
  Info,
  ArrowUpRight
} from 'lucide-react';
import { NearbyPlace, PlaceCategory } from '../types/travel';
import { CURRENCY_SYMBOLS, convertFromINR } from '../services/travelEngine';

interface NearbyPlacesProps {
  places: NearbyPlace[];
  selectedPlaceIds: string[];
  onTogglePlace: (placeId: string) => void;
  destination: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
}

const CATEGORY_TABS: { id: PlaceCategory | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All Places', icon: Sparkles },
  { id: 'tourist_attraction', label: 'Attractions', icon: Landmark },
  { id: 'historical', label: 'Heritage', icon: Building },
  { id: 'nature', label: 'Nature & Parks', icon: Trees },
  { id: 'restaurant', label: 'Local Food', icon: Utensils },
  { id: 'shopping', label: 'Bazaars', icon: ShoppingBag },
  { id: 'entertainment', label: 'Entertainment', icon: Film },
  { id: 'family_friendly', label: 'Family-Friendly', icon: Users },
];

export const NearbyPlaces: React.FC<NearbyPlacesProps> = ({
  places,
  selectedPlaceIds,
  onTogglePlace,
  destination,
  currency,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'time'>('rating');

  const currSymbol = CURRENCY_SYMBOLS[currency] || '₹';

  const filteredPlaces = places.filter((place) => {
    if (selectedCategory === 'all') return true;
    return place.category === selectedCategory;
  });

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    if (sortBy === 'distance') return a.distanceFromCenterKm - b.distanceFromCenterKm;
    if (sortBy === 'time') return a.travelTimeFromHubMin - b.travelTimeFromHubMin;
    return b.rating - a.rating;
  });

  return (
    <section id="section-nearby-places" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a87ffb]">
              Step 2
            </span>
            <div className="w-1 h-1 rounded-full bg-[#5e17eb]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Nearby Places & Attractions
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#18122c] text-[#c084fc] border border-[#5e17eb]/40">
              {destination}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#9a97b4] mt-1">
            Explore heritage landmarks, street food alleys, and nature spots with distance and estimated visiting hours
          </p>
        </div>

        {/* Selected count badge */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#9a97b4]">
          <span className="bg-[#110e1b] px-3.5 py-1.5 rounded-xl border border-[#231f33] text-white">
            <strong className="text-[#a87ffb]">{selectedPlaceIds.length}</strong> of {places.length} added to itinerary
          </span>
        </div>
      </div>

      {/* Category Pills & Sort Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-b border-[#231f33] pb-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                id={`places-tab-${tab.id}`}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#5e17eb] text-white shadow-[0_0_15px_rgba(94,23,235,0.4)] border border-[#7a28f5]'
                    : 'bg-[#110e1b] text-[#9a97b4] hover:text-white hover:bg-[#181426] border border-[#231f33]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#9a97b4]">Sort:</span>
          <select
            id="sort-nearby-places"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#110e1b] border border-[#231f33] rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#5e17eb] cursor-pointer"
          >
            <option value="rating">Top Rated</option>
            <option value="distance">Closest Distance</option>
            <option value="time">Fastest Travel Time</option>
          </select>
        </div>
      </div>

      {/* Places Cards Grid matching Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedPlaces.map((place) => {
          const isSelected = selectedPlaceIds.includes(place.id);
          return (
            <div
              key={place.id}
              id={`place-card-${place.id}`}
              className={`rounded-3xl border p-6 transition-all flex flex-col justify-between group ${
                isSelected
                  ? 'bg-[#181329] border-[#7a28f5] shadow-[0_0_20px_rgba(94,23,235,0.25)] ring-1 ring-[#5e17eb]'
                  : 'bg-[#110e1b] border-[#231f33] hover:border-[#383152] hover:bg-[#151221]'
              }`}
            >
              <div>
                {/* Badge and Rating */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#181426] text-[#c084fc] border border-[#2e2847]">
                    {place.categoryLabel}
                  </span>
                  <div className="flex items-center gap-1 bg-[#1a152e] px-2.5 py-1 rounded-lg border border-[#5e17eb]/40 text-xs font-bold text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{place.rating}</span>
                    <span className="text-[10px] font-normal text-[#9a97b4]">
                      ({place.reviewCount.toLocaleString()})
                    </span>
                  </div>
                </div>

                {/* Place Name & Description */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-bold text-white text-base leading-snug">
                    {place.name}
                  </h4>
                  <ArrowUpRight className="w-4 h-4 text-[#5c5678] group-hover:text-[#a87ffb] shrink-0 mt-0.5" />
                </div>
                <p className="text-xs text-[#9a97b4] leading-relaxed line-clamp-2 mb-3.5">
                  {place.description}
                </p>

                {/* Distance, Travel Time, Visit Duration */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#181426] border border-[#231f33] mb-3.5 text-xs">
                  <div>
                    <span className="text-[11px] text-[#9a97b4] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#a87ffb]" />
                      Distance
                    </span>
                    <strong className="text-white font-bold">
                      {place.distanceFromCenterKm} km
                    </strong>
                    <span className="text-[10px] text-[#5c5678] block">
                      ~{place.travelTimeFromHubMin}m from hub
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#9a97b4] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#a87ffb]" />
                      Duration
                    </span>
                    <strong className="text-white font-bold">
                      {place.estimatedVisitHours}
                    </strong>
                    <span className="text-[10px] text-[#5c5678] block line-clamp-1">
                      {place.openingHours}
                    </span>
                  </div>
                </div>

                {/* Insider Highlight Tip */}
                {place.highlightTip && (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#18122c] border border-[#5e17eb]/30 text-[11px] text-[#c084fc] mb-3.5">
                    <Info className="w-3.5 h-3.5 text-[#a87ffb] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{place.highlightTip}</span>
                  </div>
                )}
              </div>

              {/* Bottom: Entry Fee & Add to Plan Button */}
              <div className="pt-3.5 border-t border-[#231f33] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5c5678] block">
                    Entry Ticket
                  </span>
                  <span className="text-xs font-extrabold text-white">
                    {place.ticketPrice === 0 ? (
                      <span className="text-emerald-400">Free Entry</span>
                    ) : (
                      `${currSymbol}${convertFromINR(place.ticketPrice, currency)} / person`
                    )}
                  </span>
                </div>

                <button
                  id={`btn-toggle-place-${place.id}`}
                  type="button"
                  onClick={() => onTogglePlace(place.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#5e17eb] text-white shadow-[0_0_15px_rgba(94,23,235,0.4)]'
                      : 'bg-[#181426] hover:bg-[#221c36] text-white border border-[#2e2847]'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>In Itinerary</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
