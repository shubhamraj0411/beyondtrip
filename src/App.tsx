import React, { useState, useMemo } from 'react';
import {
  Train,
  MapPin,
  Hotel,
  DollarSign,
  Map as MapIcon,
  Bookmark,
  Check,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { TripQuery, TripPlanResult, TravelPreference } from './types/travel';
import { planTrip } from './services/travelEngine';
import { Header } from './components/Header';
import { TripSearchForm } from './components/TripSearchForm';
import { TransportComparison } from './components/TransportComparison';
import { NearbyPlaces } from './components/NearbyPlaces';
import { StayRecommendations } from './components/StayRecommendations';
import { TripCostOverview } from './components/TripCostOverview';
import { InteractiveMap } from './components/InteractiveMap';
import { AIAssistantChat } from './components/AIAssistantChat';
import { SavedTripsModal } from './components/SavedTripsModal';

const DEFAULT_QUERY: TripQuery = {
  origin: 'Delhi',
  destination: 'Agra',
  departureDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  departureTime: '07:00',
  travelers: 2,
  budget: 6500,
  preference: 'balanced',
  currency: 'INR',
};

type ActiveSection = 'all' | 'transport' | 'places' | 'stays' | 'cost' | 'map';

export default function App() {
  const [query, setQuery] = useState<TripQuery>(DEFAULT_QUERY);
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR');
  const [planResult, setPlanResult] = useState<TripPlanResult>(() => planTrip(DEFAULT_QUERY));
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>('all');

  // Selected components for overall cost & itinerary calculation
  const [selectedTransportId, setSelectedTransportId] = useState<string>(
    () => planResult.summary.recommendedTransport.id
  );
  const [selectedStayId, setSelectedStayId] = useState<string>(
    () => planResult.stayOptions[1]?.id || planResult.stayOptions[0]?.id
  );
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>(() => [
    planResult.nearbyPlaces[0]?.id,
    planResult.nearbyPlaces[1]?.id,
    planResult.nearbyPlaces[2]?.id,
  ]);

  // Saved Trips in LocalStorage
  const [savedTrips, setSavedTrips] = useState<TripPlanResult[]>(() => {
    try {
      const stored =
        localStorage.getItem('beyondtrip_saved_trips') ||
        localStorage.getItem('waywise_saved_trips');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Sync plan when query updates
  const handleSearch = (newQuery: TripQuery) => {
    setIsLoading(true);
    setTimeout(() => {
      const updated = { ...newQuery, currency };
      setQuery(updated);
      const res = planTrip(updated);
      setPlanResult(res);
      setSelectedTransportId(res.summary.recommendedTransport.id);
      setSelectedStayId(res.stayOptions[1]?.id || res.stayOptions[0]?.id);
      setSelectedPlaceIds([
        res.nearbyPlaces[0]?.id,
        res.nearbyPlaces[1]?.id,
        res.nearbyPlaces[2]?.id,
      ]);
      setIsLoading(false);
    }, 350);
  };

  // Preference quick switch
  const handlePreferenceChange = (newPref: TravelPreference) => {
    const updatedQuery = { ...query, preference: newPref };
    setQuery(updatedQuery);
    const res = planTrip(updatedQuery);
    setPlanResult(res);
    setSelectedTransportId(res.summary.recommendedTransport.id);
  };

  // Toggle places selection
  const handleTogglePlace = (id: string) => {
    setSelectedPlaceIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Save current plan
  const handleSavePlan = () => {
    const updated = [planResult, ...savedTrips.slice(0, 9)];
    setSavedTrips(updated);
    try {
      localStorage.setItem('beyondtrip_saved_trips', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage failed:', e);
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleDeleteSavedTrip = (idx: number) => {
    const updated = savedTrips.filter((_, i) => i !== idx);
    setSavedTrips(updated);
    try {
      localStorage.setItem('beyondtrip_saved_trips', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleLoadSavedTrip = (loadedTrip: TripPlanResult) => {
    setQuery(loadedTrip.query);
    setPlanResult(loadedTrip);
    setSelectedTransportId(loadedTrip.summary.recommendedTransport.id);
    setSelectedStayId(loadedTrip.stayOptions[0]?.id);
    setSelectedPlaceIds(loadedTrip.nearbyPlaces.slice(0, 3).map((p) => p.id));
    setIsSavedModalOpen(false);
  };

  const handleReset = () => {
    setQuery(DEFAULT_QUERY);
    const res = planTrip(DEFAULT_QUERY);
    setPlanResult(res);
    setSelectedTransportId(res.summary.recommendedTransport.id);
    setSelectedStayId(res.stayOptions[1]?.id);
    setSelectedPlaceIds(res.nearbyPlaces.slice(0, 3).map((p) => p.id));
  };

  const handleSectionJump = (sectionId: string) => {
    setActiveSection('all');
    setTimeout(() => {
      let targetId = '';
      if (sectionId === 'transport') targetId = 'section-transport-recommendation';
      if (sectionId === 'places') targetId = 'section-nearby-places';
      if (sectionId === 'stays') targetId = 'section-stay-recommendations';
      if (sectionId === 'cost') targetId = 'section-trip-cost-and-itinerary';
      if (sectionId === 'map') targetId = 'interactive-map-wrapper';
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // Current selected objects for Itinerary & Cost
  const currentSelectedTransport = useMemo(
    () =>
      planResult.transportOptions.find((o) => o.id === selectedTransportId) ||
      planResult.summary.recommendedTransport,
    [planResult, selectedTransportId]
  );

  const currentSelectedStay = useMemo(
    () =>
      planResult.stayOptions.find((s) => s.id === selectedStayId) ||
      planResult.stayOptions[0],
    [planResult, selectedStayId]
  );

  const currentSelectedPlaces = useMemo(
    () =>
      planResult.nearbyPlaces.filter((p) => selectedPlaceIds.includes(p.id)),
    [planResult, selectedPlaceIds]
  );

  const originCoords = query.originCoords || {
    lat: 28.6139,
    lng: 77.209,
    name: query.origin,
  };
  const destCoords = query.destCoords || {
    lat: 27.1767,
    lng: 78.0081,
    name: query.destination,
  };

  return (
    <div className="min-h-screen bg-[#08070e] text-white flex flex-col font-sans antialiased selection:bg-[#5e17eb]/40 selection:text-white relative">
      {/* Top Ambient Glow Gradient from reference image */}
      <div className="absolute top-0 left-0 right-0 h-[450px] hero-glow-backdrop pointer-events-none" />

      {/* Header */}
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        onReset={handleReset}
        savedTripsCount={savedTrips.length}
        onOpenSavedTrips={() => setIsSavedModalOpen(true)}
        onNavigateSection={handleSectionJump}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 relative z-10">
        {/* Search & Configuration Form */}
        <TripSearchForm
          initialQuery={query}
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        {/* Action Bar: Section Navigation & Save Plan matching reference bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#110e1b] p-2.5 rounded-2xl border border-[#231f33] shadow-lg">
          {/* Navigation Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'Complete Plan' },
              { id: 'transport', label: '1. Transportation', icon: Train },
              { id: 'places', label: '2. Places & Sights', icon: MapPin },
              { id: 'stays', label: '3. Stays & Lodging', icon: Hotel },
              { id: 'cost', label: 'Trip Cost & Itinerary', icon: DollarSign },
              { id: 'map', label: 'Map View', icon: MapIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveSection(tab.id as ActiveSection)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeSection === tab.id
                    ? 'bg-[#5e17eb] text-white shadow-[0_0_15px_rgba(94,23,235,0.5)] border border-[#7a28f5]'
                    : 'text-[#9a97b4] hover:text-white hover:bg-[#181426]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Save Plan Button */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="btn-save-current-plan"
              type="button"
              onClick={handleSavePlan}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#5e17eb] hover:bg-[#732bf5] text-white transition-all shadow-[0_0_15px_rgba(94,23,235,0.4)] active:scale-95 cursor-pointer"
            >
              {saveToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Plan Saved!</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-purple-200" />
                  <span>Save Plan</span>
                  <ArrowUpRight className="w-3 h-3 opacity-70" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 1: Transportation Recommendations */}
        {(activeSection === 'all' || activeSection === 'transport') && (
          <TransportComparison
            options={planResult.transportOptions}
            selectedOptionId={selectedTransportId}
            onSelectOption={(opt) => setSelectedTransportId(opt.id)}
            currency={currency}
            travelers={query.travelers}
            origin={query.origin}
            destination={query.destination}
            preference={query.preference}
            recommendationReason={planResult.summary.recommendationReason}
            highlights={planResult.summary.highlights}
          />
        )}

        {/* Section 2: Nearby Places & Attractions */}
        {(activeSection === 'all' || activeSection === 'places') && (
          <NearbyPlaces
            places={planResult.nearbyPlaces}
            selectedPlaceIds={selectedPlaceIds}
            onTogglePlace={handleTogglePlace}
            destination={query.destination}
            currency={currency}
          />
        )}

        {/* Section 3: Budget-Friendly Stays */}
        {(activeSection === 'all' || activeSection === 'stays') && (
          <StayRecommendations
            stays={planResult.stayOptions}
            selectedStayId={selectedStayId}
            onSelectStay={(stay) => setSelectedStayId(stay.id)}
            destination={query.destination}
            currency={currency}
            travelers={query.travelers}
          />
        )}

        {/* Section 4: Complete Trip Cost & Day-by-Day Itinerary */}
        {(activeSection === 'all' || activeSection === 'cost') && (
          <TripCostOverview
            selectedTransport={currentSelectedTransport}
            selectedStay={currentSelectedStay}
            selectedPlaces={currentSelectedPlaces}
            itinerary={planResult.itinerary}
            userBudget={query.budget}
            travelers={query.travelers}
            currency={currency}
            activePreference={query.preference}
            onPreferenceChange={handlePreferenceChange}
            onSavePlan={handleSavePlan}
            isSaved={saveToast}
          />
        )}

        {/* Section 5: Interactive Map View */}
        {(activeSection === 'all' || activeSection === 'map') && (
          <InteractiveMap
            originCoords={originCoords}
            destCoords={destCoords}
            originName={query.origin}
            destName={query.destination}
            places={planResult.nearbyPlaces}
            stays={planResult.stayOptions}
          />
        )}
      </main>

      {/* Floating AI Decision Assistant Chat */}
      <AIAssistantChat
        origin={query.origin}
        destination={query.destination}
        travelers={query.travelers}
        preference={query.preference}
        transportOption={currentSelectedTransport.title}
        stayName={currentSelectedStay.name}
      />

      {/* Saved Trips Modal */}
      <SavedTripsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedTrips={savedTrips}
        onLoadTrip={handleLoadSavedTrip}
        onDeleteTrip={handleDeleteSavedTrip}
        currency={currency}
      />
    </div>
  );
}
