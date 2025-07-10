import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type Bookmark = {
  id: number; // bigint in your table
  user_id: string;
  cafe_id: string;
  cafe_name?: string;
  cafe_address?: string;
  created_at?: string;
  // Additional fields that might be used in the app
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