import React from 'react';
import "../../styles/globals.css";
import { LayoutDashboard, FileText, Settings, LogOut, Home } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', direction: 'rtl' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: 'var(--primary-color)', 
        color: 'white',
        padding: '2rem 1rem'
      }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--accent-color)' }}>وقوف - الإدارة</h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a href="/" className="btn" style={{ justifyContent: 'flex-start', color: 'var(--accent-color)', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
            <Home size={20} />
            الرئيسية
          </a>
          <a href="/admin" className="btn" style={{ justifyContent: 'flex-start', color: 'white', gap: '1rem' }}>
            <LayoutDashboard size={20} />
            لوحة التحكم
          </a>
          <a href="/admin/editor" className="btn" style={{ justifyContent: 'flex-start', color: 'white', gap: '1rem' }}>
            <FileText size={20} />
            محرر الوقف
          </a>
          <a href="/search" className="btn" style={{ justifyContent: 'flex-start', color: 'var(--accent-color)', gap: '1rem' }}>
            <FileText size={20} />
            عرض موقع الطلاب
          </a>
          <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            <button className="btn" style={{ justifyContent: 'flex-start', color: '#ff6b6b', gap: '1rem', width: '100%' }}>
              <LogOut size={20} />
              تسجيل الخروج
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, backgroundColor: '#f4f7f6', padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
}
