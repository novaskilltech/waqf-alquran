"use client";

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Eye, ChevronRight, ChevronLeft } from 'lucide-react';

export default function WaqfEditor() {
  const [surahList, setSurahList] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState('1');
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [currentAyahIdx, setCurrentAyahIdx] = useState(0);
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [waqfPoints, setWaqfPoints] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    id: null,
    methodology: 'MADINA',
    ruling: 'وقف تام',
    hukumIbtida: 'جائز',
    source: '',
    explanation: '',
    taalil: '',
    status: 'DRAFT'
  });

  const currentAyah = ayahs[currentAyahIdx];

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

  // Fetch existing Waqf Points for the current Ayah
  useEffect(() => {
    const fetchExistingPoints = async () => {
      if (!currentAyah) return;
      
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const ayahId = `s${selectedSurah}a${currentAyah.number}`;

      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/WaqfPoint?ayahId=eq.${ayahId}`, {
          headers: {
            'apikey': SUPABASE_KEY || '',
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });
        const data = await response.json();
        setWaqfPoints(data || []);
      } catch (error) {
        console.error('Fetch existing points error:', error);
      }
    };

    fetchExistingPoints();
  }, [currentAyahIdx, selectedSurah, ayahs]);

  // When a word is selected, load existing data if it exists
  useEffect(() => {
    if (selectedWordIdx !== null) {
      const existing = waqfPoints.find(p => p.wordIndex === selectedWordIdx);
      if (existing) {
        const extraData = JSON.parse(existing.data || '{}');
        setFormData({
          id: existing.id,
          methodology: existing.methodology,
          ruling: extraData.ruling || 'وقف تام',
          hukumIbtida: extraData.hukumIbtida || 'جائز',
          source: extraData.source || '',
          explanation: extraData.explanation || '',
          taalil: extraData.taalil || '',
          status: existing.status
        });
      } else {
        setFormData(prev => ({
          ...prev,
          id: null,
          explanation: '',
          taalil: '',
          source: ''
        }));
      }
    }
  }, [selectedWordIdx, waqfPoints]);

  const handleSave = async () => {
    if (selectedWordIdx === null || !currentAyah) return;
    
    setIsSaving(true);
    try {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      const payload = {
        id: formData.id || undefined,
        ayahId: `s${selectedSurah}a${currentAyah.number}`,
        wordIndex: selectedWordIdx,
        methodology: formData.methodology,
        status: formData.status,
        data: JSON.stringify({
          ruling: formData.ruling,
          hukumIbtida: formData.hukumIbtida,
          explanation: formData.explanation,
          taalil: formData.taalil,
          source: formData.source
        })
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/WaqfPoint${formData.id ? `?id=eq.${formData.id}` : ''}`, {
        method: formData.id ? 'PATCH' : 'POST',
        headers: {
          'apikey': SUPABASE_KEY || '',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('✅ تم حفظ موضع الوقف بنجاح');
        const updatedResponse = await fetch(`${SUPABASE_URL}/rest/v1/WaqfPoint?ayahId=eq.${payload.ayahId}`, {
          headers: {
            'apikey': SUPABASE_KEY || '',
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });
        const updatedData = await updatedResponse.json();
        setWaqfPoints(updatedData);
      } else {
        const err = await response.json();
        alert('❌ خطأ في الحفظ: ' + (err.message || JSON.stringify(err)));
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('💥 حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary-color)' }}>محرر مواضع الوقف</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline">
            <Eye size={18} style={{ marginLeft: '0.5rem' }} />
            معاينة
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={isSaving || selectedWordIdx === null}
          >
            <Save size={18} style={{ marginLeft: '0.5rem' }} />
            {isSaving ? 'جاري الحفظ...' : formData.id ? 'تحديث الموضع' : 'حفظ الموضع'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Library size={18} /> اختيار الموضع
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>السورة</label>
                <select 
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    fontSize: '1rem',
                    textAlign: 'right'
                  }}
                  value={selectedSurah}
                  onChange={(e) => setSelectedSurah(e.target.value)}
                >
                  {surahList.map((s: any) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f1f5f9', padding: '0.5rem', borderRadius: '10px' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ background: 'white', padding: '0.5rem' }}
                  onClick={() => {
                    setCurrentAyahIdx(prev => Math.max(0, prev - 1));
                    setSelectedWordIdx(null);
                  }}
                  disabled={currentAyahIdx === 0}
                >
                  <ChevronRight size={18} />
                </button>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>آية {currentAyah?.number || 0}</span>
                </div>
                <button 
                  className="btn btn-outline" 
                  style={{ background: 'white', padding: '0.5rem' }}
                  onClick={() => {
                    setCurrentAyahIdx(prev => Math.min(ayahs.length - 1, prev + 1));
                    setSelectedWordIdx(null);
                  }}
                  disabled={currentAyahIdx === ayahs.length - 1}
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Book size={18} /> نص الآية
            </h3>
            <div className="quran-text" style={{ 
              fontSize: '1.8rem', 
              padding: '1.5rem', 
              lineHeight: '3', 
              textAlign: 'center',
              backgroundColor: '#fffcf5',
              borderRadius: '16px',
              border: '1px solid #fef3c7',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}>
              {currentAyah?.text.split(/\s+/).filter(w => w.trim()).map((word: string, idx: number) => {
                const isSelected = selectedWordIdx === idx;
                const hasExisting = waqfPoints.some((p: any) => p.wordIndex === idx);
                const isActualWord = /[\u0600-\u06FF]/.test(word) && word.length > 1;
                
                return (
                  <span 
                    key={idx}
                    onClick={() => setSelectedWordIdx(idx)}
                    style={{ 
                      cursor: 'pointer',
                      padding: '0 10px',
                      margin: '4px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'var(--accent-color)' : 'transparent',
                      borderBottom: (hasExisting && !isSelected && isActualWord) ? '4px solid var(--primary-color)' : 'none',
                      boxShadow: isSelected ? '0 6px 15px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'inline-block',
                      color: isSelected ? 'var(--primary-color)' : 'inherit',
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Data Entry Form */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.5rem' }}>
            <div style={{ background: 'var(--primary-color)', color: 'white', padding: '0.8rem', borderRadius: '12px' }}>
              <Plus size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>
                {selectedWordIdx !== null ? `تعديل الموضع: ${currentAyah?.text.split(/\s+/).filter(w => w.trim())[selectedWordIdx]}` : 'تفاصيل الموضع العلمي'}
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>أدخل البيانات والتعليلات العلمية الدقيقة للموضع</p>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '2rem', 
            opacity: selectedWordIdx === null ? 0.4 : 1, 
            pointerEvents: selectedWordIdx === null ? 'none' : 'auto',
            transition: 'opacity 0.3s'
          }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: '#334155' }}>المنهج العلمي</label>
              <select 
                style={inputStyle}
                value={formData.methodology}
                onChange={(e) => setFormData({...formData, methodology: e.target.value})}
              >
                <option value="MADINA">مصحف المدينة المنورة</option>
                <option value="HABTI">منهج الإمام الهبطي</option>
                <option value="BOOKS">أمهات كتب الوقف</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: '#334155' }}>حكم الوقف</label>
              <select 
                style={inputStyle}
                value={formData.ruling}
                onChange={(e) => setFormData({...formData, ruling: e.target.value})}
              >
                <option>وقف تام</option>
                <option>وقف كاف</option>
                <option>وقف حسن</option>
                <option>وقف قبيح</option>
                <option>جائز</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: '#334155' }}>حكم الابتداء</label>
              <select 
                style={inputStyle}
                value={formData.hukumIbtida}
                onChange={(e) => setFormData({...formData, hukumIbtida: e.target.value})}
              >
                <option>جائز</option>
                <option>كاف</option>
                <option>تام</option>
                <option>قبيح</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: '#334155' }}>المصدر العلمي</label>
              <input 
                type="text" 
                style={inputStyle} 
                placeholder="مثال: منار الهدى للأشموني"
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: '#334155' }}>الشرح المبسط (للطالب)</label>
              <textarea 
                style={{ ...inputStyle, minHeight: '140px', resize: 'vertical', lineHeight: '1.6' }}
                placeholder="قدم شرحاً يسهل على الطالب فهم سبب الوقف..."
                value={formData.explanation}
                onChange={(e) => setFormData({...formData, explanation: e.target.value})}
              ></textarea>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: '#334155' }}>التعليل العلمي (للمتخصص)</label>
              <textarea 
                style={{ ...inputStyle, minHeight: '180px', resize: 'vertical', lineHeight: '1.6' }}
                placeholder="التفصيل النحوي واللغوي الدقيق والأوجه العلمية..."
                value={formData.taalil}
                onChange={(e) => setFormData({...formData, taalil: e.target.value})}
              ></textarea>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: '#334155' }}>حالة المراجعة</label>
              <select 
                style={inputStyle}
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="DRAFT">📌 مسودة - قيد العمل</option>
                <option value="APPROVED">✅ معتمد - للنشر</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', 
  padding: '1rem', 
  borderRadius: '12px', 
  border: '2px solid #f1f5f9',
  backgroundColor: '#fff',
  fontSize: '1rem',
  textAlign: 'right',
  outline: 'none',
  transition: 'all 0.2s ease',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};
