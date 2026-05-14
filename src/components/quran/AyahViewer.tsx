"use client";

import React, { useState } from 'react';

interface WaqfData {
  wordIndex: number;
  ruling: string;
  explanation: string;
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
      <div className="quran-text">
        {words.map((word, index) => {
          const waqf = waqfPoints.find(p => p.wordIndex === index);
          return (
            <React.Fragment key={index}>
              <span>{word}</span>
              {waqf && (
                <span 
                  className="waqf-mark" 
                  onClick={() => setSelectedWaqf(waqf)}
                  title={waqf.ruling}
                >
                  *
                </span>
              )}
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
            backgroundColor: 'var(--bg-color)',
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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ 
              backgroundColor: 'var(--primary-color)', 
              color: 'white', 
              padding: '0.2rem 1rem', 
              borderRadius: '20px',
              fontSize: '0.9rem'
            }}>
              {selectedWaqf.ruling}
            </span>
            {mode === 'specialist' && selectedWaqf.source && (
              <span style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>
                المصدر: {selectedWaqf.source}
              </span>
            )}
          </div>

          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            {selectedWaqf.explanation}
          </p>

          {mode === 'specialist' && selectedWaqf.type && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              <strong>نوع الوقف:</strong> {selectedWaqf.type}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
