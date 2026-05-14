"use client";

import React, { useState } from 'react';
import { Search as SearchIcon, ArrowRight } from 'lucide-react';
import { normalizeArabic } from '@/lib/normalize';
import AyahViewer from '@/components/quran/AyahViewer';

// Mock data for initial Phase 3 demonstration
const MOCK_DATA = [
  {
    surah: 'ق',
    number: 1,
    text: 'قٓ ۚ وَالْقُرْءَانِ الْمَجِيدِ',
    waqfPoints: [
      { 
        wordIndex: 0, 
        ruling: 'الوقف أولى', 
        explanation: 'وقف تام على الحروف المقطعة في بداية السورة، والابتداء بما بعدها مستأنف.',
        type: 'تام',
        source: 'مصحف المدينة'
      }
    ]
  }
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof MOCK_DATA>([]);
  const [mode] = useState<'student' | 'specialist'>('student'); // Should be from context/url

  const handleSearch = async () => {
    if (!query) return;
    
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      // Search by Surah Name, Number or Ayah Text + Join with WaqfPoint (Corrected name)
      const searchUrl = isNaN(parseInt(query)) 
        ? `${SUPABASE_URL}/rest/v1/Ayah?select=*,Surah(name),WaqfPoint(*)&textSimple=ilike.*${normalizeArabic(query)}*&limit=20`
        : `${SUPABASE_URL}/rest/v1/Ayah?select=*,Surah(name),WaqfPoint(*)&surahNumber=eq.${query}&limit=50`;

      const response = await fetch(searchUrl, {
        headers: {
          'apikey': SUPABASE_KEY || '',
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      const data = await response.json();
      
      // Transform data for the view
      const formatted = (Array.isArray(data) ? data : []).map((item: any) => ({
        surah: item.Surah?.name || item.surahNumber,
        number: item.number,
        text: item.textOthmani,
        waqfPoints: (item.WaqfPoint || []).map((p: any) => {
           // Parse JSON data stored in the 'data' column
           const extraData = JSON.parse(p.data || '{}');
           return {
             wordIndex: p.wordIndex,
             ruling: extraData.ruling || 'غير محدد',
             explanation: extraData.explanation || 'لا يوجد شرح',
             type: p.methodology,
             source: extraData.source
           };
        })
      }));

      setResults(formatted);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className="animate-fade">
      <header className="header" style={{ padding: '2rem 1rem' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/" className="btn btn-outline" style={{ padding: '0.5rem' }}>
            <ArrowRight size={20} />
          </a>
          <h1 className="title" style={{ fontSize: '1.8rem', margin: 0 }}>البحث في مواضع الوقف</h1>
        </div>
      </header>

      <section className="container" style={{ marginTop: '2rem' }}>
        <div className="card" style={{ display: 'flex', gap: '0.5rem', padding: '0.8rem' }}>
          <input 
            type="text" 
            placeholder="ابحث بالسورة، الآية أو الكلمة..." 
            className="btn btn-outline" 
            style={{ flex: 1, textAlign: 'right', border: 'none', background: 'transparent' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            <SearchIcon size={20} />
          </button>
        </div>

        <div style={{ marginTop: '2rem' }}>
          {results.length > 0 ? (
            results.map((result, i) => (
              <div key={i} className="animate-fade" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#666' }}>
                  <span>سورة {result.surah} - آية {result.number}</span>
                </div>
                <AyahViewer 
                  text={result.text} 
                  waqfPoints={result.waqfPoints} 
                  mode={mode} 
                />
              </div>
            ))
          ) : query && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
              لم يتم العثور على نتائج في النطاق المعتمد (ق - الناس).
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
