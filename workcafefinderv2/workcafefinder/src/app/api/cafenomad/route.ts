import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch data from CafeNomad API
    const response = await fetch('https://cafenomad.tw/api/v1.2/cafes');
    
    if (!response.ok) {
      throw new Error(`CafeNomad API responded with status: ${response.status}`);
    }
    
    const cafes = await response.json();
    
    return NextResponse.json(cafes);
  } catch (error) {
    console.error('Error fetching CafeNomad data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cafe data' },
      { status: 500 }
    );
  }
} 