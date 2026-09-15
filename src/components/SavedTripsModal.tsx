import React from 'react';
import { X, Trash2, ArrowRight, Bookmark, Calendar, Users, Wallet, ArrowUpRight } from 'lucide-react';
import { TripPlanResult } from '../types/travel';
import { CURRENCY_SYMBOLS, convertFromINR } from '../services/travelEngine';

interface SavedTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: TripPlanResult[];
  onLoadTrip: (trip: TripPlanResult) => void;
  onDeleteTrip: (index: number) => void;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
}

export const SavedTripsModal: React.FC<SavedTripsModalProps> = ({
  isOpen,
  onClose,
  savedTrips,
  onLoadTrip,
  onDeleteTrip,
  currency,
}) => {
  if (!isOpen) return null;

  const currSymbol = CURRENCY_SYMBOLS[currency] || '₹';

  return (
    <div
      id="saved-trips-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#08070e]/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        id="saved-trips-modal-content"
        className="bg-[#110e1b] rounded-3xl border border-[#2e2847] shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#231f33] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1d1633] border border-[#5e17eb]/50 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-[#a87ffb]" />
            </div>
            <h3 className="font-bold text-white text-lg tracking-tight">Saved Travel Plans</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#9a97b4] hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {savedTrips.length === 0 ? (
            <div className="text-center py-12 text-[#9a97b4] text-sm space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#181426] border border-[#231f33] flex items-center justify-center mx-auto text-[#5c5678]">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="font-bold text-white">No saved trips yet</p>
              <p className="text-xs text-[#9a97b4] max-w-xs mx-auto">
                Click "Save Complete Plan" on any analyzed journey to store and revisit it anytime.
              </p>
            </div>
          ) : (
            savedTrips.map((trip, idx) => (
              <div
                key={idx}
                id={`saved-trip-item-${idx}`}
                className="p-4 rounded-2xl border border-[#231f33] bg-[#181426] hover:border-[#5e17eb]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <strong className="text-white text-sm font-bold">
                      {trip.query.origin} → {trip.query.destination}
                    </strong>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1c1433] text-[#c084fc] border border-[#5e17eb]/40 capitalize">
                      {trip.query.preference}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#9a97b4] flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#a87ffb]" />
                      {trip.query.departureDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#a87ffb]" />
                      {trip.query.travelers} traveler{trip.query.travelers > 1 ? 's' : ''}
                    </span>
                    <span className="font-bold text-[#c084fc]">
                      {currSymbol}
                      {convertFromINR(trip.costBreakdown.grandTotal, currency).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onLoadTrip(trip)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#5e17eb] hover:bg-[#732bf5] text-white text-xs font-bold flex items-center gap-1 shadow-[0_0_12px_rgba(94,23,235,0.4)] cursor-pointer"
                  >
                    <span>Load Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteTrip(idx)}
                    className="p-2 text-[#9a97b4] hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                    title="Delete Saved Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
