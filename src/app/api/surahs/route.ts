import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/Surah?select=*&order=number.asc`, {
      headers: {
        'apikey': SUPABASE_KEY || '',
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: 'Failed to fetch from Supabase', details: error }, { status: response.status });
    }

    const surahs = await response.json();
    return NextResponse.json(surahs);
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
