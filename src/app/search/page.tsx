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
  const [mode, setMode] = useState<'student' | 'specialist'>('student');
  const [methodology, setMethodology] = useState('MADINA');

  const handleSearch = async () => {
    if (!query) return;
    
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      // Fetch ALL methodologies to allow comparison
      const searchUrl = isNaN(parseInt(query)) 
        ? `${SUPABASE_URL}/rest/v1/Ayah?select=*,Surah(name),WaqfPoint(*)&textSimple=ilike.*${normalizeArabic(query)}*&WaqfPoint.status=eq.APPROVED&limit=20`
        : `${SUPABASE_URL}/rest/v1/Ayah?select=*,Surah(name),WaqfPoint(*)&surahNumber=eq.${query}&WaqfPoint.status=eq.APPROVED&limit=50`;

      const response = await fetch(searchUrl, {
        headers: {
          'apikey': SUPABASE_KEY || '',
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      const data = await response.json();
      
      const formatted = (Array.isArray(data) ? data : []).map((item: any) => ({
        surah: item.Surah?.name || item.surahNumber,
        number: item.number,
        text: item.textOthmani,
        waqfPoints: (item.WaqfPoint || []).map((p: any) => {
           const extraData = JSON.parse(p.data || '{}');
           return {
             id: p.id,
             wordIndex: p.wordIndex,
             methodology: p.methodology, // Important for grouping
             ruling: extraData.ruling || 'غير محدد',
             explanation: extraData.explanation || 'لا يوجد شرح',
             type: p.methodology,
             source: extraData.source,
             hukumIbtida: extraData.hukumIbtida || 'غير محدد',
             taalil: extraData.taalil || ''
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
      <header className="header" style={{ padding: '1.5rem 1rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/" className="btn btn-outline" style={{ padding: '0.5rem' }}>
              <ArrowRight size={20} />
            </a>
            <h1 className="title" style={{ fontSize: '1.5rem', margin: 0 }}>مواضع الوقف والابتداء</h1>
          </div>
          
          {/* US-01: Profile Switcher */}
          <div style={{ display: 'flex', backgroundColor: '#f0f0f0', borderRadius: '30px', padding: '4px' }}>
            <button 
              onClick={() => setMode('student')}
              style={{ 
                padding: '0.5rem 1.2rem', 
                borderRadius: '25px', 
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mode === 'student' ? 'var(--primary-color)' : 'transparent',
                color: mode === 'student' ? 'white' : '#666'
              }}
            >طالب</button>
            <button 
              onClick={() => setMode('specialist')}
              style={{ 
                padding: '0.5rem 1.2rem', 
                borderRadius: '25px', 
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mode === 'specialist' ? 'var(--primary-color)' : 'transparent',
                color: mode === 'specialist' ? 'white' : '#666'
              }}
            >متخصص</button>
          </div>
        </div>
      </header>

      <section className="container" style={{ marginTop: '2rem' }}>
        {/* US-02: Methodology Selector */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {['MADINA', 'HABTI', 'BOOKS'].map((m) => (
            <button 
              key={m}
              onClick={() => setMethodology(m)}
              className="btn"
              style={{ 
                whiteSpace: 'nowrap',
                backgroundColor: methodology === m ? 'var(--secondary-color)' : 'white',
                color: methodology === m ? 'white' : 'var(--secondary-color)',
                border: '1px solid var(--secondary-color)'
              }}
            >
              {m === 'MADINA' ? 'مصحف المدينة' : m === 'HABTI' ? 'وقف الهبطي' : 'كتب الوقف'}
            </button>
          ))}
        </div>

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
              لم يتم العثور على نتائج في المنهج المختار.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
