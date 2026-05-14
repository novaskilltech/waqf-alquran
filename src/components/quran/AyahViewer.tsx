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
  const [selectedWaqf, setSelectedWaqf] = useState<WaqfData | null>(null);
  
  // Split text into words to insert Waqf marks at specific indices
  const words = text.split(' ');

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div className="quran-text" style={{ lineHeight: '2.5', fontSize: '1.8rem' }}>
        {words.map((word, index) => {
          const waqf = waqfPoints.find(p => p.wordIndex === index);
          const isSelected = selectedWaqf === waqf;
          
          return (
            <React.Fragment key={index}>
              <span 
                onClick={() => waqf && setSelectedWaqf(waqf)}
                style={{ 
                  cursor: waqf ? 'pointer' : 'default',
                  color: waqf ? 'var(--accent-color)' : 'inherit',
                  fontWeight: waqf ? 'bold' : 'normal',
                  padding: '0 2px',
                  borderRadius: '4px',
                  backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  borderBottom: waqf ? '2px dotted var(--accent-color)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {word}
              </span>
              {' '}
            </React.Fragment>
          );
        })}
      </div>

      {/* Popover / Card for Waqf Details */}
      {selectedWaqf && (
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
            onClick={() => setSelectedWaqf(null)}
            style={{ position: 'absolute', top: '10px', left: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ×
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ 
                backgroundColor: 'var(--primary-color)', 
                color: 'white', 
                padding: '0.2rem 1rem', 
                borderRadius: '20px',
                fontSize: '0.9rem'
              }}>
                الوقف: {selectedWaqf.ruling}
              </span>
              <span style={{ 
                backgroundColor: 'var(--secondary-color)', 
                color: 'white', 
                padding: '0.2rem 1rem', 
                borderRadius: '20px',
                fontSize: '0.9rem'
              }}>
                الابتداء: {selectedWaqf.hukumIbtida}
              </span>
            </div>
            {mode === 'specialist' && selectedWaqf.source && (
              <span style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>
                المصدر: {selectedWaqf.source}
              </span>
            )}
          </div>

          <p style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            الشرح المبسط:
          </p>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            {selectedWaqf.explanation}
          </p>

          {mode === 'specialist' && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
              {selectedWaqf.taalil && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontWeight: 'bold', color: '#444', marginBottom: '0.3rem' }}>التعليل العلمي:</p>
                  <p style={{ fontSize: '1rem', color: '#666' }}>{selectedWaqf.taalil}</p>
                </div>
              )}
              {selectedWaqf.type && (
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  <strong>نوع الوقف:</strong> {selectedWaqf.type}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
