import React, { useState } from 'react';
import {
  Train,
  Bus,
  Car,
  Plane,
  Clock,
  CircleDollarSign,
  Leaf,
  CheckCircle2,
  Award,
  ChevronRight,
  TrendingDown,
  Zap,
  ShieldCheck,
  Flame,
  Info,
  SlidersHorizontal,
  Table as TableIcon,
  ArrowUpRight
} from 'lucide-react';
import { TransportOption, TravelPreference } from '../types/travel';
import { CURRENCY_SYMBOLS, convertFromINR } from '../services/travelEngine';

interface TransportComparisonProps {
  options: TransportOption[];
  selectedOptionId: string;
  onSelectOption: (option: TransportOption) => void;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  travelers: number;
  origin: string;
  destination: string;
  preference: TravelPreference;
  recommendationReason: string;
  highlights: {
    bestOverall: string;
    cheapest: string;
    fastest: string;
    mostConvenient: string;
  };
}

export const TransportComparison: React.FC<TransportComparisonProps> = ({
  options,
  selectedOptionId,
  onSelectOption,
  currency,
  travelers,
  origin,
  destination,
  preference,
  recommendationReason,
  highlights,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'score' | 'time' | 'cost' | 'convenience'>('score');

  const currSymbol = CURRENCY_SYMBOLS[currency] || '₹';

  const getTransportIcon = (type: TransportOption['type']) => {
    switch (type) {
      case 'train':
        return Train;
      case 'bus':
        return Bus;
      case 'car':
        return Car;
      case 'taxi':
        return Car;
      case 'flight':
        return Plane;
      default:
        return Train;
    }
  };

  const sortedOptions = [...options].sort((a, b) => {
    if (sortBy === 'time') return a.travelTimeMinutes - b.travelTimeMinutes;
    if (sortBy === 'cost') return a.totalCost - b.totalCost;
    if (sortBy === 'convenience') return b.convenienceScore - a.convenienceScore;
    return b.overallScore - a.overallScore;
  });

  const recommendedOption = options.find((o) => o.isBestOverall) || options[0];

  return (
    <section id="section-transport-recommendation" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a87ffb]">
              Step 1
            </span>
            <div className="w-1 h-1 rounded-full bg-[#5e17eb]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Recommended Transportation
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#18122c] text-[#c084fc] border border-[#5e17eb]/40">
              {origin} → {destination}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#9a97b4] mt-1">
            Compare total travel time, passenger fares, distance, and CO₂ footprint across modes
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#110e1b] p-1 rounded-xl border border-[#231f33]">
          <button
            id="btn-view-transport-cards"
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'cards'
                ? 'bg-[#5e17eb] text-white shadow-[0_0_10px_rgba(94,23,235,0.4)]'
                : 'text-[#9a97b4] hover:text-white'
            }`}
          >
            Cards View
          </button>
          <button
            id="btn-view-transport-table"
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
              viewMode === 'table'
                ? 'bg-[#5e17eb] text-white shadow-[0_0_10px_rgba(94,23,235,0.4)]'
                : 'text-[#9a97b4] hover:text-white'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Comparison Table
          </button>
        </div>
      </div>

      {/* Hero Recommended Option Card matching reference highlighted active card */}
      {recommendedOption && (
        <div
          id="recommended-transport-hero-card"
          className="featured-active-card rounded-3xl p-6 sm:p-7 relative overflow-hidden text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4f00d0] shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  Top Recommended Choice
                </span>
                <span className="text-xs font-medium text-purple-200">
                  Priority: <strong className="capitalize text-white">{preference}</strong>
                </span>
              </div>

              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {recommendedOption.title}
                </h3>
                <span className="text-sm font-medium text-purple-200">
                  ({recommendedOption.operatorOrModel})
                </span>
              </div>

              {/* "Why?" Rationale */}
              <div className="pt-1">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-200 mb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-white" />
                  Why is this recommended for your journey?
                </p>
                <p className="text-sm text-purple-100 leading-relaxed max-w-2xl font-medium">
                  {recommendationReason}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3.5">
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs">
                    <span className="text-purple-200 block text-[11px]">Travel Duration</span>
                    <strong className="text-white text-base font-extrabold">
                      {recommendedOption.travelTimeDisplay}
                    </strong>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs">
                    <span className="text-purple-200 block text-[11px]">
                      Cost ({travelers} traveler{travelers > 1 ? 's' : ''})
                    </span>
                    <strong className="text-white text-base font-extrabold">
                      {currSymbol}
                      {convertFromINR(recommendedOption.totalCost, currency).toLocaleString()}
                    </strong>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs">
                    <span className="text-purple-200 block text-[11px]">Carbon Footprint</span>
                    <strong className="text-emerald-300 text-base font-extrabold flex items-center gap-1">
                      <Leaf className="w-4 h-4" />
                      {recommendedOption.co2Kg} kg CO₂
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Score & Action */}
            <div className="flex md:flex-col items-center justify-between md:justify-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-white/20">
              <div className="text-left md:text-center">
                <span className="text-[11px] text-purple-200 uppercase tracking-wider font-bold block">
                  Match Score
                </span>
                <span className="text-4xl font-black text-white">
                  {recommendedOption.overallScore}
                  <span className="text-sm font-normal text-purple-200">/100</span>
                </span>
              </div>

              <button
                id="btn-select-hero-transport"
                type="button"
                onClick={() => onSelectOption(recommendedOption)}
                className={`px-6 py-3 text-xs font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                  selectedOptionId === recommendedOption.id
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-white hover:bg-purple-50 text-[#4f00d0]'
                }`}
              >
                {selectedOptionId === recommendedOption.id ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Selected for Trip</span>
                  </>
                ) : (
                  <>
                    <span>Select for Itinerary</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Highlights Bar matching reference stats bar */}
      <div
        id="transport-highlights-bar"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[#110e1b] border border-[#231f33]"
      >
        <div className="flex items-center gap-2.5 px-3 py-1">
          <div className="w-8 h-8 rounded-xl bg-[#1d1633] text-[#a87ffb] flex items-center justify-center shrink-0 border border-[#5e17eb]/30">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="text-[#9a97b4] block text-[10px] uppercase font-bold">
              Best Overall
            </span>
            <strong className="text-white font-bold">{highlights.bestOverall}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1">
          <div className="w-8 h-8 rounded-xl bg-[#0f241a] text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="text-[#9a97b4] block text-[10px] uppercase font-bold">
              Cheapest
            </span>
            <strong className="text-white font-bold">{highlights.cheapest}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1">
          <div className="w-8 h-8 rounded-xl bg-[#111f36] text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="text-[#9a97b4] block text-[10px] uppercase font-bold">
              Fastest
            </span>
            <strong className="text-white font-bold">{highlights.fastest}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1">
          <div className="w-8 h-8 rounded-xl bg-[#231433] text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="text-[#9a97b4] block text-[10px] uppercase font-bold">
              Most Convenient
            </span>
            <strong className="text-white font-bold">{highlights.mostConvenient}</strong>
          </div>
        </div>
      </div>

      {/* Cards View matching Bento Grid style */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedOptions.map((opt) => {
            const Icon = getTransportIcon(opt.type);
            const isSelected = selectedOptionId === opt.id;

            return (
              <div
                key={opt.id}
                id={`transport-card-${opt.id}`}
                className={`rounded-3xl border p-6 transition-all flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-[#181329] border-[#7a28f5] shadow-[0_0_25px_rgba(94,23,235,0.3)] ring-1 ring-[#5e17eb]'
                    : 'bg-[#110e1b] border-[#231f33] hover:border-[#383152] hover:bg-[#151221]'
                }`}
              >
                <div>
                  {/* Top Bar: Icon, Title, and Badges */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#1d1633] text-[#a87ffb] border border-[#2e2847] flex items-center justify-center shrink-0 group-hover:border-[#5e17eb] transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base leading-tight">
                          {opt.title}
                        </h4>
                        <span className="text-xs text-[#9a97b4]">{opt.operatorOrModel}</span>
                      </div>
                    </div>

                    <ArrowUpRight className="w-4 h-4 text-[#5c5678] group-hover:text-[#a87ffb] transition-colors" />
                  </div>

                  {/* Highlights tag */}
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    {opt.isBestOverall && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#5e17eb]/30 text-[#c084fc] border border-[#5e17eb]">
                        ⭐ Best Overall
                      </span>
                    )}
                    {opt.isCheapest && !opt.isBestOverall && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-600/50">
                        Cheapest
                      </span>
                    )}
                    {opt.isFastest && !opt.isBestOverall && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-600/50">
                        Fastest
                      </span>
                    )}
                    {opt.isMostConvenient && !opt.isBestOverall && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-600/50">
                        Most Convenient
                      </span>
                    )}
                  </div>

                  {/* Metrics Block */}
                  <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-[#181426] border border-[#231f33] mb-4 text-xs">
                    <div>
                      <span className="text-[#9a97b4] block text-[11px]">Travel Time</span>
                      <strong className="text-white font-extrabold text-sm">
                        {opt.travelTimeDisplay}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#9a97b4] block text-[11px]">
                        Total ({travelers} pax)
                      </span>
                      <strong className="text-[#c084fc] font-extrabold text-sm">
                        {currSymbol}
                        {convertFromINR(opt.totalCost, currency).toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#9a97b4] block text-[11px]">Distance</span>
                      <span className="text-white font-medium">
                        {opt.distanceKm} km ({opt.transfersDisplay})
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9a97b4] block text-[11px]">CO₂ Emission</span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        {opt.co2Kg} kg
                      </span>
                    </div>
                  </div>

                  {/* Pros summary */}
                  <div className="space-y-1.5 text-xs mb-4">
                    {opt.pros.slice(0, 2).map((pro, pIdx) => (
                      <p key={pIdx} className="text-emerald-300 flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span className="line-clamp-1">{pro}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Score & Select Action */}
                <div className="pt-3.5 border-t border-[#231f33] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#9a97b4] font-bold uppercase block">
                      Score
                    </span>
                    <span className="text-xl font-extrabold text-white">
                      {opt.overallScore}
                      <span className="text-xs font-normal text-[#5c5678]">/100</span>
                    </span>
                  </div>

                  <button
                    id={`btn-select-transport-${opt.id}`}
                    type="button"
                    onClick={() => onSelectOption(opt)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#5e17eb] text-white shadow-[0_0_15px_rgba(94,23,235,0.5)]'
                        : 'bg-[#1d1633] hover:bg-[#281f47] text-white border border-[#2e2847]'
                    }`}
                  >
                    {isSelected ? '✓ Selected' : 'Select Option'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Table View */}
      {viewMode === 'table' && (
        <div
          id="transport-comparison-table-wrapper"
          className="bg-[#110e1b] rounded-3xl border border-[#231f33] overflow-hidden shadow-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#181426] border-b border-[#231f33] text-xs font-bold text-[#9a97b4] uppercase tracking-wider">
                  <th className="py-4 px-4">Transport Mode</th>
                  <th className="py-4 px-4">Duration</th>
                  <th className="py-4 px-4">Per Person</th>
                  <th className="py-4 px-4">Total ({travelers}p)</th>
                  <th className="py-4 px-4">Transfers</th>
                  <th className="py-4 px-4">Convenience</th>
                  <th className="py-4 px-4">CO₂ Impact</th>
                  <th className="py-4 px-4">Score</th>
                  <th className="py-4 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#231f33] text-xs sm:text-sm">
                {sortedOptions.map((opt) => {
                  const Icon = getTransportIcon(opt.type);
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <tr
                      key={opt.id}
                      className={`hover:bg-[#181426] transition-colors ${
                        isSelected ? 'bg-[#1e1736]' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 font-bold text-white">
                          <Icon className="w-4 h-4 text-[#a87ffb]" />
                          <span>{opt.title}</span>
                        </div>
                        <span className="text-[11px] text-[#9a97b4] block">
                          {opt.operatorOrModel}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {opt.travelTimeDisplay}
                      </td>
                      <td className="py-4 px-4 text-[#9a97b4]">
                        {currSymbol}
                        {convertFromINR(opt.costPerPerson, currency).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-extrabold text-[#c084fc]">
                        {currSymbol}
                        {convertFromINR(opt.totalCost, currency).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-[#9a97b4]">{opt.transfersDisplay}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            opt.convenienceLevel === 'High'
                              ? 'bg-blue-950/70 text-blue-300 border border-blue-600/40'
                              : 'bg-[#1d1633] text-[#c084fc] border border-[#5e17eb]/30'
                          }`}
                        >
                          {opt.convenienceLevel}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-emerald-400 font-semibold">
                        {opt.co2Kg} kg
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {opt.overallScore}/100
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectOption(opt)}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#5e17eb] text-white shadow-[0_0_10px_rgba(94,23,235,0.5)]'
                              : 'bg-[#181426] hover:bg-[#221c36] text-white border border-[#2e2847]'
                          }`}
                        >
                          {isSelected ? '✓ Selected' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
