# Quick Setup Guide - Fix Bookmarks Button

## The Issue
The bookmarks button is not showing up because Supabase is not configured. You'll see a warning message in the header if this is the case.

## Solution

### 1. Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Create a new project

### 2. Get Your Credentials
1. In your Supabase dashboard, go to **Settings > API**
2. Copy your **Project URL** and **anon/public key**

### 3. Create Environment File
Create a `.env.local` file in the `workcafefinder` folder with:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the placeholder values with your actual Supabase credentials.

### 4. Create Database Table
In your Supabase dashboard, go to **SQL Editor** and run:

```sql
-- Create the bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_id TEXT NOT NULL,
  cafe_name TEXT NOT NULL,
  cafe_address TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  wifi INTEGER,
  quiet INTEGER,
  seat INTEGER,
  socket INTEGER,
  cheap INTEGER,
  open_time TEXT,
  music INTEGER,
  limited_time TEXT,
  standing_desk TEXT,
  mrt TEXT,
  url TEXT,
  city TEXT,
  district TEXT,
  price TEXT,
  tasty INTEGER,
  comfort INTEGER,
  drinks TEXT,
  food TEXT,
  last_update TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_cafe_id ON bookmarks(cafe_id);

-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);
```

### 5. Configure Authentication
1. In your Supabase dashboard, go to **Authentication > Settings**
2. Set your site URL to `http://localhost:3000` (for development)

### 6. Restart Your App
1. Stop your development server (Ctrl+C)
2. Run `npm run dev` again
3. The warning message should disappear and bookmarks should work!

## Test the Setup
1. Click "Sign In" and create an account
2. Try bookmarking a cafe
3. Click the "Bookmarks ☕" button to view your bookmarks

## Troubleshooting
- Make sure your `.env.local` file is in the correct location
- Check that you copied the credentials correctly
- Verify the database table was created successfully
- Check the browser console for any error messages 