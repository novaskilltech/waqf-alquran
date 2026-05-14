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
          
          return (
            <React.Fragment key={index}>
              <span 
                onClick={() => hasPoints && setSelectedWordIdx(index)}
                style={{ 
                  cursor: hasPoints ? 'pointer' : 'default',
                  color: hasPoints ? 'inherit' : 'inherit',
                  fontWeight: hasPoints ? 'bold' : 'normal',
                  padding: '0 2px',
                  borderRadius: '4px',
                  backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  // Highlight with multiple underlines if multiple methods
                  borderBottom: hasPoints 
                    ? `3px double ${getMethodColor(points[0].methodology)}` 
                    : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {word}
                {/* Small indicator dots for methods */}
                {hasPoints && points.length > 1 && (
                   <span style={{ fontSize: '0.8rem', verticalAlign: 'super', marginRight: '2px' }}>
                     ({points.length})
                   </span>
                )}
              </span>
              {' '}
            </React.Fragment>
          );
        })}
      </div>

      {/* Comparison Detail Card */}
      {selectedWordIdx !== null && currentPoints.length > 0 && (
        <div 
          className="animate-fade"
          style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            backgroundColor: '#fdfdfd',
            borderRadius: '12px',
            border: '2px solid var(--secondary-color)',
            position: 'relative'
          }}
        >
          <button 
            onClick={() => setSelectedWordIdx(null)}
            style={{ position: 'absolute', top: '10px', left: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ×
          </button>
          
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem', textAlign: 'center' }}>
            مقارنة المناهج العلمية (الكلمة: {words[selectedWordIdx]})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentPoints.map((p, idx) => (
              <div key={idx} style={{ 
                border: `1px solid ${getMethodColor(p.methodology)}`, 
                borderRadius: '8px', 
                padding: '1rem',
                backgroundColor: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ 
                    backgroundColor: getMethodColor(p.methodology), 
                    color: 'white', 
                    padding: '0.2rem 1rem', 
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {p.methodology === 'MADINA' ? 'مصحف المدينة' : p.methodology === 'HABTI' ? 'وقف الهبطي' : 'كتب الوقف'}
                  </span>
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>الوقف: <strong>{p.ruling}</strong></span>
                </div>

                <p style={{ fontSize: '1rem', margin: '0.5rem 0' }}>{p.explanation}</p>
                
                {mode === 'specialist' && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666', borderTop: '1px dashed #eee', paddingTop: '0.5rem' }}>
                    <strong>التعليل:</strong> {p.taalil} <br/>
                    <strong>المصدر:</strong> {p.source}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
