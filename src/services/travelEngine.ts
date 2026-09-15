import { 
  TripQuery, 
  TripPlanResult, 
  TransportOption, 
  NearbyPlace, 
  StayOption, 
  ItineraryDay, 
  PlaceCategory, 
  LocationCoords 
} from '../types/travel';
import { KNOWN_CITIES, KnownCity } from '../data/knownLocations';

// Helper to calculate distance in km using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const roadFactor = 1.25; // Real roads are typically ~25% longer than straight-line
  return Math.round(R * c * roadFactor);
}

// Helper to normalize and resolve city
export function resolveLocation(name: string): LocationCoords {
  const clean = name.trim().toLowerCase();
  for (const [key, city] of Object.entries(KNOWN_CITIES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return { lat: city.lat, lng: city.lng, name: city.name };
    }
  }

  // Fallback hash-based coordinates if not in known cities
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const lat = 20 + (Math.abs(hash) % 1500) / 100;
  const lng = 75 + (Math.abs(hash >> 3) % 1500) / 100;
  return { lat, lng, name: name.trim() };
}

// Convert minutes to human readable "X hrs Y mins"
export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} mins`;
  if (m === 0) return `${h} hrs`;
  return `${h}h ${m}m`;
}

// Currency conversion rate multipliers relative to INR
export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const CURRENCY_RATES_FROM_INR: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
};

export function convertFromINR(amountInINR: number, targetCurrency: string): number {
  const rate = CURRENCY_RATES_FROM_INR[targetCurrency] || 1;
  const converted = amountInINR * rate;
  return targetCurrency === 'INR' ? Math.round(converted) : Number(converted.toFixed(1));
}

// Generate transport options based on distance, duration, travelers, and preferences
export function generateTransportOptions(
  origin: LocationCoords,
  dest: LocationCoords,
  query: TripQuery,
  distanceKm: number
): TransportOption[] {
  const travelers = Math.max(1, query.travelers || 1);
  const isIntercity = distanceKm >= 80;
  const isLongDistance = distanceKm >= 450;
  const options: TransportOption[] = [];

  // Specific route logic: e.g. Delhi to Agra is ~210km, Delhi to Jaipur is ~270km
  const isDelhiAgra = 
    (origin.name.toLowerCase().includes('delhi') && dest.name.toLowerCase().includes('agra')) ||
    (origin.name.toLowerCase().includes('agra') && dest.name.toLowerCase().includes('delhi'));

  const isDelhiJaipur = 
    (origin.name.toLowerCase().includes('delhi') && dest.name.toLowerCase().includes('jaipur')) ||
    (origin.name.toLowerCase().includes('jaipur') && dest.name.toLowerCase().includes('delhi'));

  // 1. Train Option
  if (isIntercity) {
    let trainTimeMins = Math.round((distanceKm / 75) * 60); // Avg speed 75 km/h
    let baseFareINR = Math.round(distanceKm * 1.8 + 120);
    let trainName = 'Express / Superfast';

    if (isDelhiAgra) {
      trainTimeMins = 100; // Gatimaan / Vande Bharat ~1h 40m
      baseFareINR = 520;
      trainName = 'Vande Bharat / Gatimaan Express';
    } else if (isDelhiJaipur) {
      trainTimeMins = 255; // 4h 15m
      baseFareINR = 550;
      trainName = 'Vande Bharat / Shatabdi Express';
    }

    const co2 = Math.round(distanceKm * 0.035 * travelers);
    options.push({
      id: 'opt-train',
      type: 'train',
      title: 'Train',
      operatorOrModel: trainName,
      travelTimeMinutes: trainTimeMins,
      travelTimeDisplay: formatMinutes(trainTimeMins),
      costPerPerson: baseFareINR,
      totalCost: baseFareINR * travelers,
      distanceKm,
      transfers: 0,
      transfersDisplay: 'Direct (Station to Station)',
      convenienceLevel: 'High',
      convenienceScore: 85,
      co2Kg: co2,
      overallScore: 0,
      pros: ['Punctual & scenic route', 'Comfortable legroom & onboard meals', 'Zero road traffic stress'],
      cons: ['Requires ticket booking in advance', 'Station transfer needed'],
      departureScheduleDisplay: 'Multiple departures: Morning (06:00, 08:15) & Evening (15:20, 18:40)',
      routeHighlight: 'Clean electrified rail corridor with reserved seating'
    });
  }

  // 2. Intercity Bus Option
  if (distanceKm >= 40 && distanceKm <= 1200) {
    let busTimeMins = Math.round((distanceKm / 50) * 60) + 30; // Avg speed 50 km/h + 1 stop
    let baseFareINR = Math.round(distanceKm * 1.4 + 80);
    let busName = 'AC Volvo Multi-Axle / Sleeper';

    if (isDelhiAgra) {
      busTimeMins = 210; // ~3.5 hrs via Yamuna Expressway
      baseFareINR = 380;
      busName = 'Yamuna Expressway AC Express';
    } else if (isDelhiJaipur) {
      busTimeMins = 330; // ~5.5 hrs
      baseFareINR = 450;
      busName = 'RSRTC Goldline / AC Volvo';
    }

    const co2 = Math.round(distanceKm * 0.065 * travelers);
    options.push({
      id: 'opt-bus',
      type: 'bus',
      title: 'Bus',
      operatorOrModel: busName,
      travelTimeMinutes: busTimeMins,
      travelTimeDisplay: formatMinutes(busTimeMins),
      costPerPerson: baseFareINR,
      totalCost: baseFareINR * travelers,
      distanceKm,
      transfers: 1,
      transfersDisplay: '1 midway refreshment stop',
      convenienceLevel: 'Moderate',
      convenienceScore: 68,
      co2Kg: co2,
      overallScore: 0,
      pros: ['Most economical option', 'High departure frequency every 30-45 mins', 'Convenient multiple pickup boarding points'],
      cons: ['Subject to highway congestion', 'Restricted luggage space'],
      departureScheduleDisplay: 'Hourly departures between 05:00 AM and 11:30 PM',
      routeHighlight: 'Expressway corridor with highway food-court halts'
    });
  }

  // 3. Private Car / Self-Drive
  {
    const carSpeed = isDelhiAgra ? 75 : 55;
    const carTimeMins = Math.round((distanceKm / carSpeed) * 60);
    // Fuel + Tolls: roughly 8.5 INR per km total for vehicle
    const totalFuelAndToll = Math.round(distanceKm * 8.5 + 250);
    const perPersonCost = Math.round(totalFuelAndToll / travelers);
    const co2 = Math.round(distanceKm * 0.16);

    options.push({
      id: 'opt-car',
      type: 'car',
      title: 'Car (Self-Drive / Personal)',
      operatorOrModel: 'Personal Vehicle / Self-Drive Sedan',
      travelTimeMinutes: carTimeMins,
      travelTimeDisplay: formatMinutes(carTimeMins),
      costPerPerson: perPersonCost,
      totalCost: totalFuelAndToll,
      distanceKm,
      transfers: 0,
      transfersDisplay: 'Direct (Door to Door)',
      convenienceLevel: 'High',
      convenienceScore: 82,
      co2Kg: co2,
      overallScore: 0,
      pros: ['100% schedule flexibility', 'Direct door-to-door convenience', 'Great cost-per-person for groups'],
      cons: ['Driving fatigue & navigation', 'Toll charges & destination parking hassles'],
      departureScheduleDisplay: 'Leave anytime at your convenience',
      routeHighlight: 'Highway drive with freedom to stop at dhabas & viewpoints'
    });
  }

  // 4. Outstation Taxi / Chauffeur Cab
  {
    const taxiSpeed = isDelhiAgra ? 72 : 54;
    const taxiTimeMins = Math.round((distanceKm / taxiSpeed) * 60);
    // Taxi fare: ~12-14 INR/km + driver allowance + toll
    const totalTaxiCost = Math.round(distanceKm * 12.5 + 600);
    const perPersonCost = Math.round(totalTaxiCost / travelers);
    const co2 = Math.round(distanceKm * 0.18);

    options.push({
      id: 'opt-taxi',
      type: 'taxi',
      title: 'Taxi / Chauffeur Cab',
      operatorOrModel: 'Outstation Sedan / SUV (AC)',
      travelTimeMinutes: taxiTimeMins,
      travelTimeDisplay: formatMinutes(taxiTimeMins),
      costPerPerson: perPersonCost,
      totalCost: totalTaxiCost,
      distanceKm,
      transfers: 0,
      transfersDisplay: 'Direct (Door to Door Pickup & Drop)',
      convenienceLevel: 'High',
      convenienceScore: 94,
      co2Kg: co2,
      overallScore: 0,
      pros: ['Zero driving fatigue (Chauffeur driven)', 'Door-to-door luggage handling', 'Flexible break stops on demand'],
      cons: ['Higher cost for solo or duo travelers', 'Dependent on traffic delays'],
      departureScheduleDisplay: 'Bookable on-demand 24/7 at your preferred pickup time',
      routeHighlight: 'Air-conditioned private cab with GPS tracking'
    });
  }

  // 5. Flight (if distance is > 220 km)
  if (distanceKm >= 220) {
    const flightAirTimeMins = Math.max(50, Math.round((distanceKm / 550) * 60));
    // Include 2 hours airport check-in & transit
    const totalFlightTimeMins = flightAirTimeMins + 120;
    const flightFare = Math.round(Math.max(2800, distanceKm * 6.5));
    const co2 = Math.round(distanceKm * 0.24 * travelers);

    options.push({
      id: 'opt-flight',
      type: 'flight',
      title: 'Flight',
      operatorOrModel: 'Domestic Airline (Economy)',
      travelTimeMinutes: totalFlightTimeMins,
      travelTimeDisplay: `${formatMinutes(totalFlightTimeMins)} (Air: ${formatMinutes(flightAirTimeMins)})`,
      costPerPerson: flightFare,
      totalCost: flightFare * travelers,
      distanceKm,
      transfers: 0,
      transfersDisplay: 'Direct flight + Airport transfers',
      convenienceLevel: isLongDistance ? 'High' : 'Moderate',
      convenienceScore: isLongDistance ? 88 : 65,
      co2Kg: co2,
      overallScore: 0,
      pros: ['Fastest over long distances (>500km)', 'In-flight hospitality', 'Ideal for busy travelers'],
      cons: ['Airport check-in & security lines', 'Expensive for shorter distances', 'Highest carbon footprint'],
      departureScheduleDisplay: 'Daily scheduled morning & evening flights',
      routeHighlight: 'Direct airport-to-airport air route'
    });
  }

  // 6. Metro / Local Transit (if distance is < 60 km)
  if (distanceKm < 60) {
    const metroTime = Math.round((distanceKm / 35) * 60) + 10;
    const metroFare = Math.min(80, Math.round(distanceKm * 1.5 + 20));
    options.push({
      id: 'opt-metro',
      type: 'metro',
      title: 'Metro / Rapid Transit',
      operatorOrModel: 'Urban Metro / Rapid Rail',
      travelTimeMinutes: metroTime,
      travelTimeDisplay: formatMinutes(metroTime),
      costPerPerson: metroFare,
      totalCost: metroFare * travelers,
      distanceKm,
      transfers: 1,
      transfersDisplay: 'Line interchange',
      convenienceLevel: 'High',
      convenienceScore: 88,
      co2Kg: Math.round(distanceKm * 0.02 * travelers),
      overallScore: 0,
      pros: ['Bypasses all city traffic', 'Very economical & frequent', 'Air-conditioned comfort'],
      cons: ['Station access walk required', 'Peak hour rush'],
      departureScheduleDisplay: 'Trains every 4-8 minutes throughout the day',
      routeHighlight: 'Elevated / underground dedicated transit corridor'
    });
  }

  // Rank and score options according to user preference
  const minCost = Math.min(...options.map(o => o.totalCost));
  const maxCost = Math.max(...options.map(o => o.totalCost));
  const minTime = Math.min(...options.map(o => o.travelTimeMinutes));
  const maxTime = Math.max(...options.map(o => o.travelTimeMinutes));

  options.forEach(opt => {
    // Normalize time score (0 - 100, where lower time is 100)
    const timeScore = maxTime === minTime ? 100 : 100 - ((opt.travelTimeMinutes - minTime) / (maxTime - minTime)) * 100;
    // Normalize cost score (0 - 100, where lower cost is 100)
    const costScore = maxCost === minCost ? 100 : 100 - ((opt.totalCost - minCost) / (maxCost - minCost)) * 100;
    // Convenience score is already 0 - 100
    const convScore = opt.convenienceScore;

    let overall = 0;
    switch (query.preference) {
      case 'cheapest':
        overall = costScore * 0.65 + timeScore * 0.15 + convScore * 0.20;
        break;
      case 'fastest':
        overall = timeScore * 0.65 + convScore * 0.20 + costScore * 0.15;
        break;
      case 'convenient':
        overall = convScore * 0.60 + timeScore * 0.25 + costScore * 0.15;
        break;
      case 'balanced':
      default:
        overall = timeScore * 0.35 + costScore * 0.35 + convScore * 0.30;
        break;
    }

    opt.overallScore = Math.round(Math.max(10, Math.min(99, overall)));
  });

  // Identify category winners
  let cheapestOpt = options[0];
  let fastestOpt = options[0];
  let convenientOpt = options[0];
  let bestOverallOpt = options[0];

  options.forEach(opt => {
    if (opt.totalCost < cheapestOpt.totalCost) cheapestOpt = opt;
    if (opt.travelTimeMinutes < fastestOpt.travelTimeMinutes) fastestOpt = opt;
    if (opt.convenienceScore > convenientOpt.convenienceScore) convenientOpt = opt;
    if (opt.overallScore > bestOverallOpt.overallScore) bestOverallOpt = opt;
  });

  options.forEach(opt => {
    opt.isCheapest = opt.id === cheapestOpt.id;
    opt.isFastest = opt.id === fastestOpt.id;
    opt.isMostConvenient = opt.id === convenientOpt.id;
    opt.isBestOverall = opt.id === bestOverallOpt.id;
  });

  // Sort options: best overall first, followed by score
  return options.sort((a, b) => (b.isBestOverall ? 1 : 0) - (a.isBestOverall ? 1 : 0) || b.overallScore - a.overallScore);
}

// Generate Nearby Places for a destination
export function getNearbyPlacesForDestination(destName: string, destCoords: LocationCoords): NearbyPlace[] {
  const clean = destName.trim().toLowerCase();
  
  for (const [key, city] of Object.entries(KNOWN_CITIES)) {
    if (clean.includes(key) || key.includes(clean)) {
      if (city.popularSpots && city.popularSpots.length > 0) {
        return city.popularSpots;
      }
    }
  }

  // Realistic synthesized places for any other destination
  return [
    {
      id: `${clean}-attraction-1`,
      name: `${destName} Central Heritage Monument`,
      category: 'historical',
      categoryLabel: 'Historical Places',
      rating: 4.7,
      reviewCount: 14200,
      distanceFromCenterKm: 1.8,
      travelTimeFromHubMin: 8,
      estimatedVisitHours: '2 hrs',
      openingHours: '9:00 AM - 5:30 PM Daily',
      ticketPrice: 50,
      description: `Renowned historic landmark of ${destName} featuring iconic architecture, open courtyards, and local museum galleries.`,
      highlightTip: 'Great morning photo opportunities and guided architectural walks.',
      lat: destCoords.lat + 0.008,
      lng: destCoords.lng + 0.006,
    },
    {
      id: `${clean}-attraction-2`,
      name: `${destName} Botanical Garden & Lake`,
      category: 'nature',
      categoryLabel: 'Nature Spots',
      rating: 4.6,
      reviewCount: 8900,
      distanceFromCenterKm: 3.2,
      travelTimeFromHubMin: 12,
      estimatedVisitHours: '1.5 - 2 hrs',
      openingHours: '6:00 AM - 7:00 PM Daily',
      ticketPrice: 20,
      description: `Sprawling verdant sanctuary with tranquil walking trails, exotic botanical flora, and paddle boating.`,
      highlightTip: 'Ideal for an afternoon stroll or peaceful sunset reflection.',
      lat: destCoords.lat - 0.012,
      lng: destCoords.lng + 0.015,
    },
    {
      id: `${clean}-attraction-3`,
      name: `Old ${destName} Artisan & Spice Bazaar`,
      category: 'shopping',
      categoryLabel: 'Shopping Areas',
      rating: 4.5,
      reviewCount: 11500,
      distanceFromCenterKm: 2.1,
      travelTimeFromHubMin: 10,
      estimatedVisitHours: '2 hrs',
      openingHours: '10:30 AM - 9:30 PM (Closed Sundays)',
      ticketPrice: 0,
      description: `Vibrant traditional market lanes packed with regional handicrafts, handloom textiles, and authentic spices.`,
      highlightTip: 'Sample local street bites and practice gentle bargaining.',
      lat: destCoords.lat + 0.015,
      lng: destCoords.lng - 0.008,
    },
    {
      id: `${clean}-attraction-4`,
      name: `${destName} Heritage Dining & Food Street`,
      category: 'restaurant',
      categoryLabel: 'Restaurants & Food',
      rating: 4.7,
      reviewCount: 9200,
      distanceFromCenterKm: 2.4,
      travelTimeFromHubMin: 10,
      estimatedVisitHours: '1.5 hrs',
      openingHours: '11:30 AM - 11:00 PM Daily',
      ticketPrice: 0,
      description: `Beloved culinary strip featuring historic eateries serving authentic local delicacies and sweets.`,
      highlightTip: 'Try the signature regional thali and freshly prepared dessert.',
      lat: destCoords.lat - 0.005,
      lng: destCoords.lng - 0.012,
    },
    {
      id: `${clean}-attraction-5`,
      name: `${destName} Cultural Center & Puppet Theater`,
      category: 'entertainment',
      categoryLabel: 'Entertainment & Nightlife',
      rating: 4.6,
      reviewCount: 6300,
      distanceFromCenterKm: 4.0,
      travelTimeFromHubMin: 16,
      estimatedVisitHours: '2.5 hrs',
      openingHours: '4:00 PM - 10:00 PM Daily',
      ticketPrice: 150,
      description: `Vibrant stage for regional folk music, classical dance recitals, and heritage handicrafts.`,
      highlightTip: 'Check the 7:00 PM evening folk performance schedule.',
      lat: destCoords.lat + 0.022,
      lng: destCoords.lng + 0.018,
    }
  ];
}

// Generate Stay Recommendations categorized into the 4 required pillars
export function getStaysForDestination(destName: string, destCoords: LocationCoords, budgetINR: number): StayOption[] {
  const clean = destName.trim().toLowerCase();
  for (const [key, city] of Object.entries(KNOWN_CITIES)) {
    if (clean.includes(key) || key.includes(clean)) {
      if (city.sampleStays && city.sampleStays.length > 0) {
        return city.sampleStays;
      }
    }
  }

  // Dynamically scale price ranges based on user's target budget
  const baseBudgetPerNight = Math.max(600, Math.min(12000, Math.round(budgetINR * 0.4)));
  const budgetPrice = Math.round(baseBudgetPerNight * 0.4);
  const valuePrice = Math.round(baseBudgetPerNight * 0.85);
  const ratedPrice = Math.round(baseBudgetPerNight * 2.2);
  const closestPrice = Math.round(baseBudgetPerNight * 0.9);

  return [
    {
      id: `${clean}-stay-budget`,
      name: `${destName} Backpacker Haven`,
      category: 'best_budget',
      categoryLabel: 'Best Budget Option',
      type: 'Budget Hostel',
      pricePerNight: budgetPrice,
      totalCost: budgetPrice,
      distanceFromCenterKm: 1.6,
      distanceToAttractionsDisplay: '10 mins to central monuments',
      rating: 4.6,
      reviewCount: 2200,
      amenities: ['Free High-Speed Wi-Fi', 'Air Conditioning', 'Social Common Lounge', 'Luggage Lockers', '24/7 Desk'],
      description: `Top-rated backpacker hub offering sparkling clean air-conditioned dorms and private rooms with community events.`,
      address: `Station Link Road, Central ${destName}`,
      lat: destCoords.lat + 0.005,
      lng: destCoords.lng + 0.008,
    },
    {
      id: `${clean}-stay-value`,
      name: `${destName} Boutique Courtyard`,
      category: 'best_value',
      categoryLabel: 'Best Value for Money',
      type: 'Comfort Hotel',
      pricePerNight: valuePrice,
      totalCost: valuePrice,
      distanceFromCenterKm: 1.1,
      distanceToAttractionsDisplay: 'Walking distance to top bazaars & cafes',
      rating: 4.7,
      reviewCount: 1850,
      amenities: ['Complimentary Buffet Breakfast', 'High-Speed Wi-Fi', 'Rain Showers', 'Rooftop Cafe', 'Tour Desk'],
      description: `Elegantly designed boutique property combining modern comforts with regional architectural touches.`,
      address: `Heritage Lane, Old ${destName}`,
      lat: destCoords.lat - 0.006,
      lng: destCoords.lng + 0.005,
    },
    {
      id: `${clean}-stay-rated`,
      name: `The Grand Royal ${destName} Palace & Spa`,
      category: 'best_rated',
      categoryLabel: 'Best-Rated Option',
      type: 'Resort',
      pricePerNight: ratedPrice,
      totalCost: ratedPrice,
      distanceFromCenterKm: 2.2,
      distanceToAttractionsDisplay: '10 mins drive to royal gardens',
      rating: 4.9,
      reviewCount: 3400,
      amenities: ['Luxury Pool', 'Full-Service Ayurvedic Spa', 'Fine-Dining Restaurants', 'Valet Parking', 'Concierge'],
      description: `Premier 5-star estate delivering royal hospitality, manicured heritage lawns, and tranquil spa therapies.`,
      address: `Palace Boulevard, ${destName}`,
      lat: destCoords.lat + 0.015,
      lng: destCoords.lng - 0.012,
    },
    {
      id: `${clean}-stay-closest`,
      name: `${destName} Junction Grand Hotel`,
      category: 'closest',
      categoryLabel: 'Closest Option',
      type: 'Comfort Hotel',
      pricePerNight: closestPrice,
      totalCost: closestPrice,
      distanceFromCenterKm: 0.4,
      distanceToAttractionsDisplay: 'Only 300m from main transit station',
      rating: 4.4,
      reviewCount: 1200,
      amenities: ['Right at Transit Hub', 'Free Wi-Fi', '24/7 Room Service', 'Elevator', 'Airport Shuttle'],
      description: `Perfect strategic location right across the transit terminal, ensuring effortless arrivals and departures.`,
      address: `Station Plaza, ${destName}`,
      lat: destCoords.lat + 0.002,
      lng: destCoords.lng + 0.001,
    }
  ];
}

// Generate Itinerary
export function generateItinerary(
  origin: string,
  dest: string,
  transport: TransportOption,
  places: NearbyPlace[],
  stay: StayOption
): ItineraryDay[] {
  const p1 = places[0]?.name || 'Central Monument';
  const p2 = places[1]?.name || 'City Gardens';
  const p3 = places[2]?.name || 'Old Town Bazaar';
  const p4 = places[3]?.name || 'Culinary Street';

  return [
    {
      dayNumber: 1,
      title: `Arrival & Heritage Exploration`,
      items: [
        {
          timeSlot: 'Morning',
          activityTitle: `Journey via ${transport.title}`,
          description: `Depart ${origin} aboard ${transport.operatorOrModel}. Enjoy the journey with an estimated travel time of ${transport.travelTimeDisplay}.`,
          locationName: `${origin} Station / Terminal`,
          travelDetail: transport.transfersDisplay,
          costEstimate: transport.costPerPerson,
        },
        {
          timeSlot: 'Afternoon',
          activityTitle: `Check-in at ${stay.name} & Relax`,
          description: `Arrive in ${dest}, settle into ${stay.name}. Freshen up and enjoy a welcoming cup of local tea.`,
          locationName: stay.name,
          travelDetail: stay.distanceToAttractionsDisplay,
        },
        {
          timeSlot: 'Evening',
          activityTitle: `Visit ${p1} & Sunset Views`,
          description: `Explore the grand architecture of ${p1}. Take in the golden sunset vistas and capture photos.`,
          locationName: p1,
          costEstimate: places[0]?.ticketPrice || 0,
        }
      ]
    },
    {
      dayNumber: 2,
      title: `Local Flavors, Culture & Departure`,
      items: [
        {
          timeSlot: 'Morning',
          activityTitle: `Nature Walk at ${p2}`,
          description: `Start early with a refreshing walk amidst the greenery at ${p2}. Discover tranquil corners before the crowds arrive.`,
          locationName: p2,
          costEstimate: places[1]?.ticketPrice || 0,
        },
        {
          timeSlot: 'Afternoon',
          activityTitle: `Shopping & Crafts at ${p3}`,
          description: `Browse authentic textiles, spices, and handmade souvenirs. Taste street delicacies along the historic lanes.`,
          locationName: p3,
        },
        {
          timeSlot: 'Evening',
          activityTitle: `Dinner at ${p4} & Return Journey`,
          description: `Indulge in authentic regional flavors at ${p4} before heading to the departure terminal for your return trip.`,
          locationName: p4,
          costEstimate: 350,
        }
      ]
    }
  ];
}

// Complete Trip Planner Master Engine
export function planTrip(query: TripQuery): TripPlanResult {
  const originCoords = query.originCoords || resolveLocation(query.origin);
  const destCoords = query.destCoords || resolveLocation(query.destination);
  const distanceKm = calculateDistance(originCoords.lat, originCoords.lng, destCoords.lat, destCoords.lng);

  // Generate transport options
  const transportOptions = generateTransportOptions(originCoords, destCoords, query, distanceKm);
  const recommendedTransport = transportOptions[0]; // Ranked #1 based on score

  // Generate nearby places
  const nearbyPlaces = getNearbyPlacesForDestination(destCoords.name, destCoords);

  // Generate stay recommendations
  const stayOptions = getStaysForDestination(destCoords.name, destCoords, query.budget);
  const selectedStay = stayOptions.find(s => s.category === 'best_value') || stayOptions[0];

  // Best category titles
  const bestOverall = transportOptions.find(o => o.isBestOverall)?.title || 'Train';
  const cheapest = transportOptions.find(o => o.isCheapest)?.title || 'Bus';
  const fastest = transportOptions.find(o => o.isFastest)?.title || 'Train';
  const mostConvenient = transportOptions.find(o => o.isMostConvenient)?.title || 'Taxi';

  // Rationale for AI recommendation
  let reason = '';
  if (recommendedTransport.isBestOverall) {
    if (query.preference === 'cheapest') {
      reason = `Provides the absolute lowest overall travel cost (${recommendedTransport.costPerPerson} per person) while maintaining reliable schedules.`;
    } else if (query.preference === 'fastest') {
      reason = `Saves maximum transit time (${recommendedTransport.travelTimeDisplay}) with direct non-stop routing.`;
    } else if (query.preference === 'convenient') {
      reason = `Offers peak door-to-door comfort, personal privacy, and zero transfer hassles for ${query.travelers} traveler(s).`;
    } else {
      reason = `Strikes the ideal equilibrium between travel duration (${recommendedTransport.travelTimeDisplay}), cost-effectiveness, and passenger comfort without road fatigue.`;
    }
  }

  // Cost calculation
  const nights = 1; // standard weekend/short trip unit
  const transportTotal = recommendedTransport.totalCost;
  const stayTotal = selectedStay.pricePerNight * nights;
  const activitiesTotal = nearbyPlaces.slice(0, 3).reduce((sum, p) => sum + p.ticketPrice * query.travelers, 0);
  const foodBufferTotal = 600 * query.travelers * (nights + 1);
  const grandTotal = transportTotal + stayTotal + activitiesTotal + foodBufferTotal;
  const budgetDiff = query.budget - grandTotal;

  // Itinerary
  const itinerary = generateItinerary(originCoords.name, destCoords.name, recommendedTransport, nearbyPlaces, selectedStay);

  return {
    query,
    summary: {
      distanceKm,
      recommendedTransport,
      recommendationReason: reason,
      highlights: {
        bestOverall,
        cheapest,
        fastest,
        mostConvenient,
      }
    },
    transportOptions,
    nearbyPlaces,
    stayOptions,
    itinerary,
    costBreakdown: {
      transportTotal,
      stayTotal,
      activitiesTotal,
      foodBufferTotal,
      grandTotal,
      budgetDifference: budgetDiff,
      isWithinBudget: budgetDiff >= 0,
    }
  };
}
