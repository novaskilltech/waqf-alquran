import React from 'react';
import { CheckCircle, Clock, AlertCircle, BookOpen } from 'lucide-react';

export default function AdminDashboard() {
  // Mock data for now since seed failed
  const stats = [
    { label: 'المواد المعتمدة', value: '0', icon: <CheckCircle color="#27ae60" />, color: '#e8f5e9' },
    { label: 'قيد المراجعة', value: '0', icon: <Clock color="#f39c12" />, color: '#fff8e1' },
    { label: 'تحتاج تعديل', value: '0', icon: <AlertCircle color="#e74c3c" />, color: '#ffebee' },
    { label: 'إجمالي السور', value: '65', icon: <BookOpen color="#3498db" />, color: '#e3f2fd' },
  ];

  return (
    <div className="animate-fade">
      <h1 style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>لوحة التحكم</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {stats.map((stat, i) => (
          <div key={i} className="card" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            backgroundColor: stat.color,
            border: 'none'
          }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '12px', 
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>{stat.label}</p>
              <h2 style={{ color: 'var(--primary-color)' }}>{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>السور المعتمدة (نطاق ق - الناس)</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>السورة</th>
                <th style={{ padding: '1rem' }}>عدد المواضع</th>
                <th style={{ padding: '1rem' }}>الحالة</th>
                <th style={{ padding: '1rem' }}>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {/* This will be dynamic after DB seed fix */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>سورة ق</td>
                <td style={{ padding: '1rem' }}>0</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', backgroundColor: '#eee', fontSize: '0.8rem' }}>
                    لم يبدأ
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                    بدء الإدخال
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
