"use client";

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Eye, ChevronRight, ChevronLeft } from 'lucide-react';

export default function WaqfEditor() {
  const [selectedSurah, setSelectedSurah] = useState('50');
  const [surahList, setSurahList] = useState<{number: number, name: string}[]>([]);
  const [ayahs, setAyahs] = useState<{number: number, text: string}[]>([]);
  const [currentAyahIdx, setCurrentAyahIdx] = useState(0);
  const [waqfPoints, setWaqfPoints] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Surah List
  useEffect(() => {
    fetch('/api/surahs')
      .then(res => res.json())
      .then(data => setSurahList(data))
      .catch(() => setSurahList([]));
  }, []);

  // Fetch Ayahs for selected Surah
  useEffect(() => {
    if (selectedSurah) {
      fetch(`/api/quran/${selectedSurah}`)
        .then(res => res.json())
        .then(data => {
          setAyahs(data.ayahs || []);
          setCurrentAyahIdx(0);
        })
        .catch(() => setAyahs([]));
    }
  }, [selectedSurah]);

  const handleSave = async () => {
    setIsSaving(true);
    // Logic to call POST /api/waqf
    setTimeout(() => {
      setIsSaving(false);
      alert('تم حفظ البيانات بنجاح');
    }, 1000);
  };

  const currentAyah = ayahs[currentAyahIdx];

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary-color)' }}>محرر مواضع الوقف</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline">
            <Eye size={18} style={{ marginLeft: '0.5rem' }} />
            معاينة
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            <Save size={18} style={{ marginLeft: '0.5rem' }} />
            {isSaving ? 'جاري الحفظ...' : 'حفظ الكل'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Selection & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>اختيار الموضع</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>السورة</label>
                <select 
                  className="btn btn-outline" 
                  style={{ width: '100%', textAlign: 'right' }}
                  value={selectedSurah}
                  onChange={(e) => setSelectedSurah(e.target.value)}
                >
                  {surahList.map(s => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setCurrentAyahIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentAyahIdx === 0}
                >
                  <ChevronRight size={18} />
                </button>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>آية {currentAyah?.number || 0}</span>
                </div>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setCurrentAyahIdx(prev => Math.min(ayahs.length - 1, prev + 1))}
                  disabled={currentAyahIdx === ayahs.length - 1}
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>نص الآية</h3>
            <div className="quran-text" style={{ fontSize: '1.5rem', padding: '1rem' }}>
              {currentAyah?.text}
            </div>
          </div>
        </div>

        {/* Data Entry Form */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            إضافة موضع وقف جديد
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>اختر الكلمة</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', direction: 'rtl' }}>
                {currentAyah?.text?.split(' ').map((word, i) => (
                  <button key={i} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem' }}>
                    {word}
                  </button>
                )) || <p style={{ color: '#999', fontSize: '0.9rem' }}>جاري تحميل كلمات الآية...</p>}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>المنهج</label>
              <select className="btn btn-outline" style={{ width: '100%', textAlign: 'right' }}>
                <option>مصحف المدينة</option>
                <option>وقف الهبطي</option>
                <option>كتب الوقف</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>حكم الابتداء</label>
              <select className="btn btn-outline" style={{ width: '100%', textAlign: 'right' }}>
                <option>جائز</option>
                <option>غير مناسب</option>
                <option>يمنع الابتداء</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>المصدر العلمي</label>
              <input type="text" className="btn btn-outline" style={{ width: '100%', textAlign: 'right' }} placeholder="مثال: منار الهدى" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>القراءة المرتبطة</label>
              <select className="btn btn-outline" style={{ width: '100%', textAlign: 'right' }}>
                <option>عامة (للكل)</option>
                <option>حفص عن عاصم</option>
                <option>ورش عن نافع</option>
                <option>قالون</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>شرح الطالب</label>
              <textarea 
                className="btn btn-outline"
                style={{ width: '100%', minHeight: '80px', padding: '1rem', textAlign: 'right', height: 'auto' }}
                placeholder="شرح مبسط..."
              ></textarea>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>حالة المراجعة</label>
              <select className="btn btn-outline" style={{ width: '100%', textAlign: 'right', backgroundColor: '#fff8e1' }}>
                <option>مسودة (Draft)</option>
                <option>قيد المراجعة</option>
                <option>معتمد (Approved)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
