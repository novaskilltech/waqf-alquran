import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ surah: string }> }
) {
  try {
    const { surah } = await params;
    const surahNum = parseInt(surah);
    if (isNaN(surahNum)) return NextResponse.json({ error: 'Invalid surah number' }, { status: 400 });
    
    // Fetch directly from the official API (Dynamic loading)
    // Using a more reliable endpoint or handling 404/500 from it
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Quran Cloud API', status: response.status }, { status: response.status });
    }

    const data = await response.json();

    if (data.code === 200) {
      return NextResponse.json({
        surah: surahNum,
        name: data.data.name,
        ayahs: data.data.ayahs.map((ayah: any) => ({
          number: ayah.numberInSurah,
          text: ayah.text
        }))
      });
    }
    
    return NextResponse.json({ error: 'Surah not found in Quran Cloud' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
