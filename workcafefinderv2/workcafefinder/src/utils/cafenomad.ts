export interface CafeNomadCafe {
  id: string;
  name: string;
  wifi: number; // 1-5
  seat: number; // 1-5
  quiet: number; // 1-5
  music: number; // 1-5
  socket: number; // 1-5
  limited_time: string; // 'yes' | 'no' | 'maybe'
  standing_desk: string; // 'yes' | 'no'
  mrt: string;
  open_time: string;
  address: string;
  latitude: number;
  longitude: number;
  url: string;
  city: string;
  district: string;
  price: string;
  tasty: number; // 1-5
  cheap: number; // 1-5
  comfort: number; // 1-5
  drinks: string;
  food: string;
  last_update: string;
}

export async function fetchCafeNomadCafes(): Promise<CafeNomadCafe[]> {
  const res = await fetch('/api/cafenomad');
  if (!res.ok) throw new Error('Failed to fetch CafeNomad cafes');
  return res.json();
} 