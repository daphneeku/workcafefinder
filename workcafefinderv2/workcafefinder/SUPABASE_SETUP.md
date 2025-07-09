# Supabase Setup for WorkCafeFinder

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account or sign in
2. Create a new project
3. Wait for the project to be set up

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon/public key

## 3. Set Up Environment Variables

Create a `.env.local` file in the root of your project with:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the placeholder values with your actual Supabase credentials.

## 4. Create the Bookmarks Table

In your Supabase dashboard, go to the SQL Editor and run this SQL:

```sql
-- Create the bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_id TEXT NOT NULL,
  cafe_name TEXT NOT NULL,
  cafe_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster queries
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_cafe_id ON bookmarks(cafe_id);

-- Enable Row Level Security (RLS)
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);
```

## 5. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Add any additional redirect URLs if needed

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Try signing up with an email and password
3. Check your email for the confirmation link
4. Sign in and test the bookmark functionality

## Features Implemented

- **User Authentication**: Sign up, sign in, and logout functionality
- **Bookmark System**: Users can bookmark cafes and view their bookmarks
- **Secure Data**: Row Level Security ensures users can only access their own data
- **Real-time Updates**: Bookmark status updates immediately across the app

## Troubleshooting

- Make sure your environment variables are correctly set
- Check that the bookmarks table was created successfully
- Verify that RLS policies are in place
- Check the browser console for any error messages 