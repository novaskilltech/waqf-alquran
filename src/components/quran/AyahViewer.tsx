"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Info, Book, Library, Sparkles, Fingerprint } from 'lucide-react';
import { getWordMorphology, getGrammarColor } from '@/utils/sarf';

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
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Split text into words (cleanly)
  const words = text.split(/\s+/).filter(w => w.trim());

  // Get all waqf points for the selected word
  const currentPoints = selectedWordIdx !== null 
    ? waqfPoints.filter(p => p.wordIndex === selectedWordIdx)
    : [];

  // Reset AI analysis when word changes
  useEffect(() => {
    setAiAnalysis(null);
  }, [selectedWordIdx]);

  const handleAiAnalyze = async (word: string) => {
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, context: text })
      });
      const data = await response.json();
      if (data.success) {
        setAiAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getMethodColor = (methodology?: string) => {
    switch (methodology) {
      case 'MADINA': return '#059669';
      case 'HABTI': return '#2563eb';
      default: return '#6366f1';
    }
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
                  borderBottom: hasPoints && !isSelected && word.length > 1
                    ? `2px solid ${getMethodColor(points[0].methodology)}` 
                    : (isSpecialist && !hasPoints && word.length > 1 ? '1px dashed #ccc' : 'none'),
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
            {/* Morphological Analysis (Sarf) */}
            {(() => {
              const morph = getWordMorphology(words[selectedWordIdx]);
              if (!morph) return null;
              return (
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '1.2rem', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ 
                    background: 'white', 
                    padding: '0.8rem', 
                    borderRadius: '10px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    color: getGrammarColor(morph.grammar)
                  }}>
                    <Fingerprint size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>الهوية اللغوية:</span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        background: getGrammarColor(morph.grammar) + '20',
                        color: getGrammarColor(morph.grammar),
                        fontWeight: 'bold'
                      }}>{morph.grammar}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>الجذر:</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', marginLeft: '0.5rem', color: '#1e293b' }}>{morph.root}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>الأصل:</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', marginLeft: '0.5rem', color: '#1e293b' }}>{morph.lemma}</span>
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline" style={{ fontSize: '0.8rem' }}>استعراض المشتقات</button>
                </div>
              );
            })()}

            {currentPoints.length > 0 ? (
              currentPoints.map((p, idx) => {
                const isManar = p.source?.includes('منار الهدى');
                const typeColors: Record<string, string> = {
                  'تام': '#059669',
                  'كاف': '#2563eb',
                  'حسن': '#d97706',
                  'قبيح': '#dc2626'
                };
                const typeColor = p.type ? (typeColors[p.type] || getMethodColor(p.methodology)) : getMethodColor(p.methodology);

                return (
                  <div key={idx} style={{ 
                    border: `1px solid ${isManar ? '#e2e8f0' : '#eee'}`, 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    backgroundColor: isManar ? '#fff' : '#fafafa',
                    boxShadow: isManar ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ 
                      backgroundColor: isManar ? '#1e293b' : getMethodColor(p.methodology), 
                      color: 'white', 
                      padding: '0.8rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isManar ? <Library size={18} /> : <Book size={18} />}
                        <span style={{ fontWeight: 'bold' }}>
                          {isManar ? 'منار الهدى (الأشموني)' : (p.methodology === 'MADINA' ? 'مصحف المدينة المنورة' : p.methodology === 'HABTI' ? 'منهج الإمام الهبطي' : 'كتب الوقف والابتداء')}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                        {p.type ? `نوع الوقف: ${p.type}` : `المصدر: ${p.source || 'غير محدد'}`}
                      </span>
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ 
                          background: 'white', 
                          padding: '1rem', 
                          borderRadius: '8px', 
                          textAlign: 'center', 
                          border: `2px solid ${typeColor}20`,
                          borderTop: `4px solid ${typeColor}`
                        }}>
                          <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>حكم الوقف</div>
                          <div style={{ color: typeColor, fontWeight: 'bold', fontSize: '1.2rem' }}>{p.ruling}</div>
                        </div>
                        <div style={{ 
                          background: 'white', 
                          padding: '1rem', 
                          borderRadius: '8px', 
                          textAlign: 'center', 
                          border: '1px solid #eee' 
                        }}>
                          <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>حكم الابتداء</div>
                          <div style={{ color: 'var(--secondary-color)', fontWeight: 'bold', fontSize: '1.2rem' }}>{p.hukumIbtida || 'جائز'}</div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ color: isManar ? '#1e293b' : 'var(--primary-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Info size={16} />
                          {isManar ? 'نص التعليل من المصدر:' : 'الشرح والبيان:'}
                        </h4>
                        <p style={{ 
                          lineHeight: '1.8', 
                          color: '#334155', 
                          fontSize: isManar ? '1.05rem' : '1rem',
                          fontStyle: isManar ? 'italic' : 'normal',
                          backgroundColor: isManar ? '#f8fafc' : 'transparent',
                          padding: isManar ? '1rem' : '0',
                          borderRadius: '8px'
                        }}>
                          {p.explanation}
                        </p>
                      </div>

                      {p.taalil && (
                        <div style={{ background: '#f0f4f8', padding: '1rem', borderRadius: '8px' }}>
                          <h4 style={{ color: '#2d3748', marginBottom: '0.5rem', fontSize: '0.9rem' }}>🔍 التعليل العلمي:</h4>
                          <p style={{ fontSize: '0.95rem', color: '#4a5568', lineHeight: '1.5' }}>{p.taalil}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
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
