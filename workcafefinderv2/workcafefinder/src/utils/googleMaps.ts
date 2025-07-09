// Utility for Google Maps integration
// This will be expanded to include map helpers and script loading

export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export interface Cafe {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export async function fetchNearbyCafes({
  lat,
  lng,
  radius = 2000,
  type = "cafe",
}: {
  lat: number;
  lng: number;
  radius?: number;
  type?: string;
}): Promise<Cafe[]> {
  if (!GOOGLE_MAPS_API_KEY) throw new Error("Google Maps API key missing");
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch cafes");
  const data = await res.json();
  return data.results;
} 