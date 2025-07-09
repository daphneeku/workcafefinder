# WorkCafeFinder

A web app to help people in Taiwan find cafes suitable for working, with features like location search, cafe attribute filters (laptop-friendly, free WiFi, cozy, quiet), and a live map.

## Features
- Search cafes by location
- Filter cafes by attributes (laptop-friendly, free WiFi, cozy, quiet)
- Live Google Map with cafe markers

## Tech Stack
- Next.js (React, TypeScript)
- Google Maps API

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local` and fill in your API key.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) to view the app.**

## Environment Variables
Create a `.env.local` file in the root with the following:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Folder Structure
- `src/app/` - Main app pages and layout
- `src/components/` - Reusable UI components
- `src/utils/` - Utility functions (API integration, helpers)

## To Do
- Integrate Google Maps
- Build search and filter UI
- Display cafes on the map
- Show cafe details

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
