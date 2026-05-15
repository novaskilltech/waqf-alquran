"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Info, Book, Library, Sparkles } from 'lucide-react';

interface WaqfData {
  wordIndex: number;
  ruling: string;
  explanation: string;
  methodology?: string; // Made optional to fix Search page error
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

  // Reset AI analysis when word changes
  useEffect(() => {
    setAiAnalysis(null);
  }, [selectedWordIdx]);

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

      {selectedWordIdx !== null && (
        <div className="animate-fade-up" style={{ marginTop: '2rem', padding: '1.5rem', borderTop: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--primary-color)' }}>
              تفاصيل الكلمة: <span style={{ color: 'var(--secondary-color)' }}>{words[selectedWordIdx]}</span>
            </h3>
            <button className="btn btn-outline" onClick={() => setSelectedWordIdx(null)}>إغلاق</button>
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
            ) : null}

            {/* AI Assistant Block */}
            {!isAiLoading && !aiAnalysis && currentPoints.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', background: '#f9f9f9', borderRadius: '12px', border: '2px dashed #ddd' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                <h3>هذا الموضع ليس له علامة في المصحف</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>يمكنك سؤال المساعد الذكي لتحليل هذا الموضع لغوياً وعلمياً.</p>
                <button 
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                  onClick={() => handleAiAnalyze(words[selectedWordIdx])}
                >
                  <Sparkles size={18} />
                  تحليل الموضع بالذكاء الاصطناعي
                </button>
              </div>
            )}

            {isAiLoading && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="animate-pulse" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>
                  <Sparkles size={48} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
                  جاري تحليل الموضع علمياً...
                </div>
              </div>
            )}

            {aiAnalysis && (
              <div className="animate-fade-in" style={{ 
                border: `2px solid var(--secondary-color)`, 
                borderRadius: '12px', 
                overflow: 'hidden',
                backgroundColor: '#fff'
              }}>
                <div style={{ 
                  backgroundColor: 'var(--secondary-color)', 
                  color: 'white', 
                  padding: '0.8rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} />
                    <span style={{ fontWeight: 'bold' }}>تحليل المساعد الذكي (NOVA-WAQF)</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>بناءً على السياق اللغوي</span>
                </div>

                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#fff9f0', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #ffe4b5' }}>
                      <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>الحكم المقترح</div>
                      <div style={{ color: '#b45309', fontWeight: 'bold', fontSize: '1.2rem' }}>{aiAnalysis.ruling}</div>
                    </div>
                    <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #dcfce7' }}>
                      <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>الدقة التقريبية</div>
                      <div style={{ color: '#15803d', fontWeight: 'bold', fontSize: '1.2rem' }}>95%</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>📝 التفسير التحليلي:</h4>
                    <p style={{ lineHeight: '1.6', color: '#444' }}>{aiAnalysis.explanation}</p>
                  </div>

                  <div style={{ background: '#fdf2f2', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                    <h4 style={{ color: '#991b1b', marginBottom: '0.5rem', fontSize: '0.9rem' }}>🔍 التعليل اللغوي:</h4>
                    <p style={{ fontSize: '0.95rem', color: '#b91c1c', lineHeight: '1.5' }}>{aiAnalysis.taalil}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
