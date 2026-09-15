import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationCoords, NearbyPlace, StayOption } from '../types/travel';
import { MapPin } from 'lucide-react';

interface InteractiveMapProps {
  originCoords: LocationCoords;
  destCoords: LocationCoords;
  originName: string;
  destName: string;
  places: NearbyPlace[];
  stays: StayOption[];
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  originCoords,
  destCoords,
  originName,
  destName,
  places,
  stays,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [destCoords.lat, destCoords.lng],
      zoom: 12,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // Dark Matter Map Tiles matching obsidian aesthetic
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    const bounds = L.latLngBounds([]);

    // 1. Destination Arrival Hub Marker (Glowing electric violet)
    const destIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `<div style="background: linear-gradient(135deg, #5e17eb, #8a3ffc); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: bold; border: 2px solid #ffffff; box-shadow: 0 0 15px rgba(94, 23, 235, 0.8);">📍</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([destCoords.lat, destCoords.lng], { icon: destIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px;">
          <strong style="color: #a87ffb; font-size: 14px;">${destName}</strong>
          <p style="margin: 4px 0 0; color: #9a97b4;">Central Arrival Transit Hub</p>
        </div>`
      );
    bounds.extend([destCoords.lat, destCoords.lng]);

    // 2. Attractions Markers (Amber gold)
    places.slice(0, 8).forEach((place) => {
      const placeIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background: #f59e0b; color: #110e1b; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);">🏛️</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([place.lat, place.lng], { icon: placeIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; max-width: 200px;">
            <strong style="color: #fbbf24; font-size: 13px;">${place.name}</strong>
            <p style="margin: 2px 0; color: #9a97b4;">${place.categoryLabel}</p>
            <p style="margin: 4px 0 0; font-weight: 600; color: #ffffff;">⭐ ${place.rating} • ${place.distanceFromCenterKm} km from hub</p>
          </div>`
        );
      bounds.extend([place.lat, place.lng]);
    });

    // 3. Stays Markers (Cyan blue)
    stays.forEach((stay) => {
      const stayIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background: #06b6d4; color: #110e1b; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(6, 182, 212, 0.6);">🏨</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([stay.lat, stay.lng], { icon: stayIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; max-width: 200px;">
            <strong style="color: #38bdf8; font-size: 13px;">${stay.name}</strong>
            <p style="margin: 2px 0; color: #9a97b4;">${stay.categoryLabel}</p>
            <p style="margin: 4px 0 0; font-weight: 600; color: #ffffff;">⭐ ${stay.rating} • ₹${stay.pricePerNight.toLocaleString()}/night</p>
          </div>`
        );
      bounds.extend([stay.lat, stay.lng]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [destCoords, places, stays, destName]);

  return (
    <div
      id="interactive-map-wrapper"
      className="bg-[#110e1b] rounded-3xl border border-[#231f33] p-6 space-y-4 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Geographic Spatial Map
          </h3>
          <p className="text-xs text-[#9a97b4]">
            Spatial layout of {destName} plotting arrival hub, tourist sights, and budget accommodations
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-[#9a97b4]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5e17eb] ring-2 ring-[#7a28f5]" />
            Arrival Hub
          </span>
          <span className="flex items-center gap-1.5 text-[#9a97b4]">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Attractions
          </span>
          <span className="flex items-center gap-1.5 text-[#9a97b4]">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            Stays
          </span>
        </div>
      </div>

      <div
        ref={mapContainerRef}
        id="leaflet-map-canvas"
        className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-[#231f33]"
      />
    </div>
  );
};
