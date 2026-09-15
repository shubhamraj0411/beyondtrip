export type TravelPreference = 'cheapest' | 'fastest' | 'convenient' | 'balanced';

export type PlaceCategory = 
  | 'tourist_attraction'
  | 'historical'
  | 'nature'
  | 'restaurant'
  | 'shopping'
  | 'entertainment'
  | 'family_friendly';

export type StayCategory = 
  | 'best_budget'
  | 'best_value'
  | 'best_rated'
  | 'closest';

export interface LocationCoords {
  lat: number;
  lng: number;
  name: string;
}

export interface TripQuery {
  origin: string;
  destination: string;
  originCoords?: LocationCoords;
  destCoords?: LocationCoords;
  departureDate: string;
  departureTime: string;
  returnDate?: string;
  travelers: number;
  budget: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  preference: TravelPreference;
  interests?: PlaceCategory[];
}

export interface TransportOption {
  id: string;
  type: 'train' | 'bus' | 'car' | 'taxi' | 'flight' | 'metro';
  title: string;
  operatorOrModel: string;
  travelTimeMinutes: number;
  travelTimeDisplay: string;
  costPerPerson: number;
  totalCost: number;
  distanceKm: number;
  transfers: number;
  transfersDisplay: string;
  convenienceLevel: 'High' | 'Moderate' | 'Basic';
  convenienceScore: number; // 0 - 100
  co2Kg: number;
  overallScore: number; // 0 - 100 based on user preferences
  isBestOverall?: boolean;
  isCheapest?: boolean;
  isFastest?: boolean;
  isMostConvenient?: boolean;
  pros: string[];
  cons: string[];
  departureScheduleDisplay?: string;
  routeHighlight?: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  categoryLabel: string;
  rating: number;
  reviewCount: number;
  distanceFromCenterKm: number;
  travelTimeFromHubMin: number;
  estimatedVisitHours: string;
  openingHours: string;
  ticketPrice: number;
  description: string;
  highlightTip: string;
  lat: number;
  lng: number;
  imageUrl?: string;
}

export interface StayOption {
  id: string;
  name: string;
  category: StayCategory;
  categoryLabel: string;
  type: 'Budget Hostel' | 'Boutique Hotel' | 'Heritage Stay' | 'Comfort Hotel' | 'Guesthouse' | 'Resort';
  pricePerNight: number;
  totalCost: number;
  distanceFromCenterKm: number;
  distanceToAttractionsDisplay: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  description: string;
  address: string;
  lat: number;
  lng: number;
}

export interface ItineraryItem {
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  activityTitle: string;
  description: string;
  locationName: string;
  travelDetail?: string;
  costEstimate?: number;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  items: ItineraryItem[];
}

export interface TripPlanResult {
  query: TripQuery;
  summary: {
    distanceKm: number;
    recommendedTransport: TransportOption;
    recommendationReason: string;
    highlights: {
      bestOverall: string;
      cheapest: string;
      fastest: string;
      mostConvenient: string;
    };
  };
  transportOptions: TransportOption[];
  nearbyPlaces: NearbyPlace[];
  stayOptions: StayOption[];
  itinerary: ItineraryDay[];
  costBreakdown: {
    transportTotal: number;
    stayTotal: number;
    activitiesTotal: number;
    foodBufferTotal: number;
    grandTotal: number;
    budgetDifference: number; // budget - grandTotal
    isWithinBudget: boolean;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
