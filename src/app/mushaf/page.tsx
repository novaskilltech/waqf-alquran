"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AyahViewer from '@/components/quran/AyahViewer';
import { Book, Sparkles, ChevronRight, ChevronLeft, Search, Home } from 'lucide-react';

export default function MushafPage() {
  const [surah, setSurah] = useState(1);
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSurah = async (num: number) => {
    setLoading(true);
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/Ayah?surahNumber=eq.${num}&select=*,WaqfPoint(*)&order=number.asc`, {
        headers: { 'apikey': SUPABASE_KEY!, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const data = await res.json();
      setAyahs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurah(surah);
  }, [surah]);

  return (
    <div className="mushaf-container animate-fade" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Header Mushaf */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        background: 'white',
        padding: '1.5rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: '#fff9f0', 
            border: '1px solid #d4af37',
            color: '#d4af37',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}>
            <Home size={20} />
          </Link>
          <Book size={32} color="var(--primary-color)" />
          <h1 style={{ margin: 0, color: 'var(--primary-color)' }}>المصحف الشريف</h1>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => surah > 1 && setSurah(surah - 1)}
            className="btn-secondary" style={{ padding: '0.5rem' }}
          >
            <ChevronRight />
          </button>
          
          <div style={{ position: 'relative' }}>
            <input 
              type="number" 
              value={surah} 
              onChange={(e) => setSurah(parseInt(e.target.value))}
              style={{ width: '80px', textAlign: 'center', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <span style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>سورة</span>
          </div>

          <button 
            onClick={() => surah < 114 && setSurah(surah + 1)}
            className="btn-secondary" style={{ padding: '0.5rem' }}
          >
            <ChevronLeft />
          </button>
        </div>
      </div>

      {/* Mushaf Page Content */}
      <div style={{ 
        background: '#fff9f0', // Couleur papier crème
        padding: '3rem',
        borderRadius: '20px',
        border: '12px double #d4af37', // Bordure dorée
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        minHeight: '600px'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}>جاري تحميل الصفحة...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {ayahs.map((ayah) => (
              <div key={ayah.id} style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '2rem' }}>
                <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                   <span style={{ 
                     background: 'var(--primary-color)', 
                     color: 'white', 
                     padding: '0.2rem 1rem', 
                     borderRadius: '20px',
                     fontSize: '0.8rem' 
                   }}>
                     الآية {ayah.number}
                   </span>
                </div>
                <AyahViewer 
                  text={ayah.textOthmani} 
                  mode="specialist"
                  waqfPoints={ayah.WaqfPoint.map((p: any) => {
                    const d = JSON.parse(p.data || '{}');
                    return { ...p, ...d };
                  })}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Assistant Floating Action */}
      <div style={{ 
        position: 'fixed', 
        bottom: '2rem', 
        right: '2rem',
        background: 'var(--primary-color)',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '50px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        zIndex: 100
      }}>
        <Sparkles size={20} />
        <span>اسأل المساعد الذكي عن أي وقف</span>
      </div>
    </div>
  );
}
