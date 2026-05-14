"use client";

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Eye, ChevronRight, ChevronLeft } from 'lucide-react';

export default function WaqfEditor() {
  const [surahList, setSurahList] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState('1');
  const [ayahs, setAyahs] = useState([]);
  const [currentAyahIdx, setCurrentAyahIdx] = useState(0);
  const [selectedWordIdx, setSelectedWordIdx] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [waqfPoints, setWaqfPoints] = useState([]);

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
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
                  onClick={() => {
                    setCurrentAyahIdx(prev => Math.max(0, prev - 1));
                    setSelectedWordIdx(null);
                  }}
                  disabled={currentAyahIdx === 0}
                >
                  <ChevronRight size={18} />
                </button>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>آية {currentAyah?.number || 0}</span>
                </div>
                <button 
                  className="btn btn-outline" 
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

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>نص الآية</h3>
            <div className="quran-text" style={{ fontSize: '1.5rem', padding: '1rem', lineHeight: '2.5' }}>
        {/* Data Entry Form */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            إضافة موضع وقف جديد {selectedWordIdx !== null && `(كلمة: ${currentAyah?.text.split(' ')[selectedWordIdx]})`}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>المنهج</label>
              <select 
                className="btn btn-outline" 
                style={{ width: '100%', textAlign: 'right' }}
                value={formData.methodology}
                onChange={(e) => setFormData({...formData, methodology: e.target.value})}
              >
                <option value="MADINA">مصحف المدينة</option>
                <option value="HABTI">وقف الهبطي</option>
                <option value="BOOKS">كتب الوقف</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>حكم الوقف</label>
              <select 
                className="btn btn-outline" 
                style={{ width: '100%', textAlign: 'right' }}
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

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>حكم الابتداء</label>
              <select 
                className="btn btn-outline" 
                style={{ width: '100%', textAlign: 'right' }}
                value={formData.hukumIbtida}
                onChange={(e) => setFormData({...formData, hukumIbtida: e.target.value})}
              >
                <option>جائز</option>
                <option>كاف</option>
                <option>تام</option>
                <option>قبيح</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>المصدر العلمي</label>
              <input 
                type="text" 
                className="btn btn-outline" 
                style={{ width: '100%', textAlign: 'right' }} 
                placeholder="مثال: منار الهدى"
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>الشرح المبسط (للطالب)</label>
              <textarea 
                className="btn btn-outline"
                style={{ width: '100%', minHeight: '80px', padding: '1rem', textAlign: 'right', height: 'auto' }}
                placeholder="اشرح سبب الوقف هنا للطلاب..."
                value={formData.explanation}
                onChange={(e) => setFormData({...formData, explanation: e.target.value})}
              ></textarea>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>التعليل العلمي (للمتخصص)</label>
              <textarea 
                className="btn btn-outline"
                style={{ width: '100%', minHeight: '80px', padding: '1rem', textAlign: 'right', height: 'auto' }}
                placeholder="التفصيل العلمي والأوجه النحوية..."
                value={formData.taalil}
                onChange={(e) => setFormData({...formData, taalil: e.target.value})}
              ></textarea>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>حالة المراجعة</label>
              <select 
                className="btn btn-outline" 
                style={{ width: '100%', textAlign: 'right', backgroundColor: '#fff8e1' }}
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="DRAFT">مسودة (Draft)</option>
                <option value="APPROVED">معتمد (Approved)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
