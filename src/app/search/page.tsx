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

  const handleSearch = () => {
    const normalizedQuery = normalizeArabic(query);
    const filtered = MOCK_DATA.filter(item => 
      normalizeArabic(item.text).includes(normalizedQuery) || 
      item.surah.includes(query)
    );
    setResults(filtered);
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
