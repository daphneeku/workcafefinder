import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Bookmark = {
  cafe_id: string;
  cafe_name: string;
  cafe_address: string;
  id: string;
  latitude?: number;
  longitude?: number;
  wifi?: number;
  quiet?: number;
  seat?: number;
  socket?: number;
  cheap?: number;
  open_time?: string;
  music?: number;
  limited_time?: string;
  standing_desk?: string;
  mrt?: string;
  url?: string;
  city?: string;
  district?: string;
  price?: string;
  tasty?: number;
  comfort?: number;
  drinks?: string;
  food?: string;
  last_update?: string;
}; 