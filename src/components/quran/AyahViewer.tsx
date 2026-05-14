"use client";

import React, { useState } from 'react';

interface WaqfData {
  wordIndex: number;
  ruling: string;
  explanation: string;
  hukumIbtida?: string;
  taalil?: string;
  type?: string;
  source?: string;
}

interface AyahViewerProps {
  text: string;
  waqfPoints: WaqfData[];
  mode: 'student' | 'specialist';
}

export default function AyahViewer({ text, waqfPoints, mode }: AyahViewerProps) {
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);
  
  // Split text into words
  const words = text.split(' ');

  // Get all waqf points for the selected word
  const currentPoints = selectedWordIdx !== null 
    ? waqfPoints.filter(p => p.wordIndex === selectedWordIdx)
    : [];

  const getMethodColor = (m: string) => {
    if (m === 'MADINA') return '#1e40af'; // Blue
    if (m === 'HABTI') return '#15803d'; // Green
    if (m === 'BOOKS') return '#b45309'; // Amber
    return 'var(--accent-color)';
  };

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div className="quran-text" style={{ lineHeight: '2.5', fontSize: '1.8rem' }}>
        {words.map((word, index) => {
          const points = waqfPoints.filter(p => p.wordIndex === index);
          const hasPoints = points.length > 0;
          const isSelected = selectedWordIdx === index;
          const isSpecialist = mode === 'specialist';
          
          return (
            <React.Fragment key={index}>
              <span 
                onClick={() => (hasPoints || isSpecialist) && setSelectedWordIdx(index)}
                style={{ 
                  cursor: (hasPoints || isSpecialist) ? 'pointer' : 'default',
                  color: isSelected ? 'var(--primary-color)' : (hasPoints ? 'var(--primary-color)' : 'inherit'),
                  fontWeight: (hasPoints || isSelected) ? 'bold' : 'normal',
                  padding: '4px 8px',
                  margin: '0 2px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? 'var(--accent-color)' : 'transparent',
                  borderBottom: hasPoints && !isSelected
                    ? `2px solid ${getMethodColor(points[0].methodology)}` 
                    : (isSpecialist && !hasPoints ? '1px dashed #eee' : 'none'),
                  transition: 'all 0.2s ease',
                  display: 'inline-block'
                }}
              >
                {word}
                {hasPoints && points.length > 1 && !isSelected && (
                   <span style={{ fontSize: '0.7rem', verticalAlign: 'super', opacity: 0.7 }}>
                     ({points.length})
                   </span>
                )}
              </span>
              {' '}
            </React.Fragment>
          );
        })}
      </div>

      {/* Comparison Detail Card / Library Entry */}
      {selectedWordIdx !== null && currentPoints.length > 0 && (
        <div 
          className="animate-fade"
          style={{
            marginTop: '2rem',
            padding: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            position: 'relative'
          }}
        >
          <button 
            onClick={() => setSelectedWordIdx(null)}
            style={{ position: 'absolute', top: '15px', left: '15px', border: 'none', background: '#eee', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
          >
            ×
          </button>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>مكتبة الوقف والابتداء</h2>
            <p style={{ color: '#666' }}>تفصيل الموضع: <strong style={{ color: 'var(--accent-color)', fontSize: '1.4rem' }}>{words[selectedWordIdx]}</strong></p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {currentPoints.length > 0 ? (
              currentPoints.map((p, idx) => (
                <div key={idx} style={{ 
                  border: `1px solid #eee`, 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  backgroundColor: '#fafafa'
                }}>
                  <div style={{ 
                    backgroundColor: getMethodColor(p.methodology), 
                    color: 'white', 
                    padding: '0.8rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>
                      {p.methodology === 'MADINA' ? 'مصحف المدينة المنورة' : p.methodology === 'HABTI' ? 'منهج الإمام الهبطي' : 'كتب الوقف والابتداء'}
                    </span>
                    <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>المصدر: {p.source || 'غير محدد'}</span>
                  </div>

                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee' }}>
                        <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>حكم الوقف (Arrêt)</div>
                        <div style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.2rem' }}>{p.ruling}</div>
                      </div>
                      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee' }}>
                        <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>حكم الابتداء (Reprise)</div>
                        <div style={{ color: 'var(--secondary-color)', fontWeight: 'bold', fontSize: '1.2rem' }}>{p.hukumIbtida || 'جائز'}</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>💡 الشرح والبيان:</h4>
                      <p style={{ lineHeight: '1.6', color: '#444' }}>{p.explanation}</p>
                    </div>

                    {p.taalil && (
                      <div style={{ background: '#f0f4f8', padding: '1rem', borderRadius: '8px' }}>
                        <h4 style={{ color: '#2d3748', marginBottom: '0.5rem', fontSize: '0.9rem' }}>🔍 لماذا؟ (التعليل العلمي):</h4>
                        <p style={{ fontSize: '0.95rem', color: '#4a5568', lineHeight: '1.5' }}>{p.taalil}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', background: '#f9f9f9', borderRadius: '12px', border: '2px dashed #ddd' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                <h3>هذا الموضع ليس له علامة في المصحف</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>يمكنك سؤال المساعد الذكي لتحليل هذا الموضع لغوياً وعلمياً.</p>
                <button 
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                  onClick={() => alert('جاري تحليل الموضع من قبل الذكاء الاصطناعي...')}
                >
                  <Sparkles size={18} />
                  تحليل الموضع بالذكاء الاصطناعي
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
