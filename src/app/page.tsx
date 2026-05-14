"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Search, ShieldCheck, BarChart3, Settings } from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({ total: 0, approved: 0, surahs: 114 });

  useEffect(() => {
    const fetchStats = async () => {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      try {
        const [resPoints, resApproved] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/WaqfPoint?select=count`, { headers: { 'apikey': SUPABASE_KEY, 'Prefer': 'count=exact' } }),
          fetch(`${SUPABASE_URL}/rest/v1/WaqfPoint?status=eq.APPROVED&select=count`, { headers: { 'apikey': SUPABASE_KEY, 'Prefer': 'count=exact' } })
        ]);
        
        const countPoints = await resPoints.json();
        const countApproved = await resApproved.json();
        
        setStats({
          total: countPoints[0]?.count || 0,
          approved: countApproved[0]?.count || 0,
          surahs: 114
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-fade" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📖</div>
        <h1 className="title">مِنَصَّة وُقُوف</h1>
        <p style={{ color: 'var(--secondary-color)', fontSize: '1.2rem', marginTop: '1rem' }}>
          المشروع العلمي المتكامل لخدمة علم الوقف والابتداء
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        {/* Accès Public */}
        <Link href="/search" style={{ textDecoration: 'none' }}>
          <div className="card hover-scale" style={{ height: '100%', borderTop: '4px solid var(--primary-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--accent-color)', padding: '0.8rem', borderRadius: '12px' }}>
                <Search color="var(--primary-color)" />
              </div>
              <h2 style={{ color: 'var(--primary-color)' }}>مُحرك البحث</h2>
            </div>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              استعرض مواضع الوقف المعتمدة مع التفسير العلمي المبسط للطلاب والباحثين.
            </p>
          </div>
        </Link>

        {/* Accès Spécialiste/Admin */}
        <Link href="/admin/editor" style={{ textDecoration: 'none' }}>
          <div className="card hover-scale" style={{ height: '100%', borderTop: '4px solid var(--secondary-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#fef3c7', padding: '0.8rem', borderRadius: '12px' }}>
                <ShieldCheck color="var(--secondary-color)" />
              </div>
              <h2 style={{ color: 'var(--secondary-color)' }}>الورشة العلمية</h2>
            </div>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              لوحة التحكم الخاصة بالخبراء لإضافة وتدقيق مواضع الوقف وتوثيق المصادر.
            </p>
          </div>
        </Link>
      </div>

      {/* Statistiques de progression */}
      <div className="card" style={{ background: 'var(--primary-color)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <BarChart3 />
          <h3>إحصائيات المشروع (القرآن كاملاً)</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.surahs}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>سورة</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>موضع مسجل</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.approved}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>موضع معتمد</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${(stats.approved / 500) * 100}%`, 
            height: '100%', 
            background: 'var(--accent-color)',
            transition: 'width 1s ease-out'
          }}></div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>
          معدل الإنجاز الكلي للمرحلة الأولى
        </div>
      </div>

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>
        منصة وقوف - الإصدار 1.0 (MVP) • {new Date().getFullYear()}
      </footer>
    </div>
  );
}
