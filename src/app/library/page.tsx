"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Home, Search, BookOpen, Download, Loader2, ChevronLeft, ChevronRight, Library, BookMarked, X } from 'lucide-react';

const SHAMELA_API_URL = process.env.NEXT_PUBLIC_SHAMELA_API_URL || 'http://localhost:3001';

interface Book {
  id: number;
  name: string;
  author?: string;
  category?: string;
  categoryId?: number;
  isDownloaded?: boolean;
}

interface BookPage {
  id: number;
  part?: string;
  page: number;
  content: string;
}

interface Category {
  id: number;
  name: string;
  bookCount: number;
}

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [bookContent, setBookContent] = useState<BookPage[] | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const limit = 20;

  // Check API status
  useEffect(() => {
    fetch(`/api/shamela/stats`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setApiStatus('online');
        else setApiStatus('offline');
      })
      .catch(() => setApiStatus('offline'));
  }, []);

  // Fetch categories
  useEffect(() => {
    if (apiStatus !== 'online') return;
    fetch(`/api/shamela/categories`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setCategories(d.data || []);
      })
      .catch(console.error);
  }, [apiStatus]);

  // Fetch books
  useEffect(() => {
    if (apiStatus !== 'online') return;
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory.toString());
    params.set('limit', limit.toString());
    params.set('offset', ((page - 1) * limit).toString());

    fetch(`/api/shamela/search?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setBooks(d.data || []);
          setTotal(d.total || 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchQuery, selectedCategory, page, apiStatus]);

  // Search with debounce
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Open book detail
  const openBook = async (book: Book) => {
    setSelectedBook(book);
    setContentLoading(true);
    setBookContent(null);
    try {
      const res = await fetch(`/api/shamela/book/${book.id}`);
      const d = await res.json();
      if (d.success && d.data?.pages) {
        setBookContent(d.data.pages.slice(0, 50)); // First 50 pages
      } else if (d.pages) {
        // Fallback pour notre ancienne route qui renvoyait directement { pages, titles }
        setBookContent(d.pages.slice(0, 50));
      }
    } catch (e) {
      console.error(e);
    }
    setContentLoading(false);
  };

  const totalPages = Math.ceil(total / limit);

  if (apiStatus === 'offline') {
    return (
      <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', textDecoration: 'none', marginBottom: '2rem' }}>
          <Home size={18} /> الرئيسية
        </Link>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
        <h1 className="title" style={{ marginBottom: '1rem' }}>المكتبة الإسلامية</h1>
        <div className="card" style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '2rem' }}>
          <p style={{ color: '#92400e', fontSize: '1.1rem', marginBottom: '1rem' }}>
            ⚠️ خادم المكتبة الشاملة غير متاح حالياً
          </p>
          <p style={{ color: '#92400e', fontSize: '0.9rem' }}>
            يرجى التأكد من تشغيل الخادم على <code dir="ltr">{SHAMELA_API_URL}</code>
          </p>
          <p style={{ color: '#92400e', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            أو شغّل محلياً: <code dir="ltr">cd shamela-api && npm start</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '42px', height: '42px', borderRadius: '12px',
            background: '#f0fdf4', border: '1px solid var(--primary-color)',
            color: 'var(--primary-color)', textDecoration: 'none'
          }}>
            <Home size={20} />
          </Link>
          <Library size={32} color="#7c3aed" />
          <div>
            <h1 style={{ margin: 0, color: '#7c3aed', fontSize: '1.5rem' }}>المكتبة الإسلامية</h1>
            <p style={{ margin: 0, color: '#999', fontSize: '0.85rem' }}>
              {total > 0 ? `${total.toLocaleString('ar-SA')} كتاب` : 'جاري التحميل...'}
            </p>
          </div>
        </div>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: '#f0fdf4', padding: '0.3rem 0.8rem', borderRadius: '20px',
          fontSize: '0.8rem', color: '#16a34a'
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></div>
          متصل بالشاملة
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث في المكتبة الإسلامية..."
              style={{
                width: '100%', padding: '0.8rem 2.5rem 0.8rem 1rem',
                borderRadius: '10px', border: '1px solid #e5e7eb',
                fontSize: '1rem', outline: 'none', direction: 'rtl',
                background: '#fafafa'
              }}
            />
          </div>
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <button
              onClick={() => { setSelectedCategory(null); setPage(1); }}
              style={{
                padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', transition: 'all 0.2s',
                background: !selectedCategory ? '#7c3aed' : '#f3f4f6',
                color: !selectedCategory ? 'white' : '#666'
              }}
            >
              الكل
            </button>
            {categories.slice(0, 12).map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                style={{
                  padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
                  fontSize: '0.85rem', transition: 'all 0.2s',
                  background: selectedCategory === cat.id ? '#7c3aed' : '#f3f4f6',
                  color: selectedCategory === cat.id ? 'white' : '#666'
                }}
              >
                {cat.name} ({cat.bookCount})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Books Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Loader2 size={40} className="spin" style={{ color: '#7c3aed', margin: '0 auto' }} />
          <p style={{ color: '#999', marginTop: '1rem' }}>جاري تحميل الكتب...</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {books.map(book => (
              <div
                key={book.id}
                className="card hover-scale"
                onClick={() => openBook(book)}
                style={{ 
                  cursor: 'pointer', padding: '1.2rem',
                  borderRight: '4px solid #7c3aed',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                  <div style={{ 
                    background: '#f5f3ff', padding: '0.6rem', borderRadius: '10px',
                    flexShrink: 0
                  }}>
                    <BookMarked size={20} color="#7c3aed" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ 
                      margin: 0, fontSize: '0.95rem', color: '#1f2937',
                      lineHeight: '1.5', marginBottom: '0.3rem',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any
                    }}>
                      {book.name}
                    </h3>
                    {book.author && (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>
                        {book.author}
                      </p>
                    )}
                    {book.category && (
                      <span style={{
                        display: 'inline-block', marginTop: '0.4rem',
                        padding: '0.15rem 0.5rem', borderRadius: '10px',
                        background: '#f5f3ff', color: '#7c3aed',
                        fontSize: '0.7rem'
                      }}>
                        {book.category}
                      </span>
                    )}
                  </div>
                </div>
                {book.isDownloaded && (
                  <div style={{ 
                    marginTop: '0.5rem', fontSize: '0.75rem', color: '#16a34a',
                    display: 'flex', alignItems: 'center', gap: '0.3rem'
                  }}>
                    <Download size={12} /> محمّل محلياً
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb',
                  background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.3rem'
                }}
              >
                <ChevronRight size={16} /> السابق
              </button>
              <span style={{ color: '#666', fontSize: '0.9rem' }}>
                صفحة {page} من {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb',
                  background: 'white', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.3rem'
                }}
              >
                التالي <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }} onClick={() => setSelectedBook(null)}>
          <div 
            className="card animate-fade"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '800px', maxHeight: '85vh',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
              padding: 0
            }}
          >
            {/* Modal Header */}
            <div style={{ 
              padding: '1.5rem', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
            }}>
              <div>
                <h2 style={{ margin: 0, color: '#7c3aed', fontSize: '1.2rem' }}>
                  {selectedBook.name}
                </h2>
                {selectedBook.author && (
                  <p style={{ margin: '0.3rem 0 0', color: '#999', fontSize: '0.9rem' }}>
                    {selectedBook.author}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                style={{
                  background: '#f3f4f6', border: 'none', borderRadius: '8px',
                  padding: '0.5rem', cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
              {contentLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <Loader2 size={32} className="spin" style={{ color: '#7c3aed', margin: '0 auto' }} />
                  <p style={{ color: '#999', marginTop: '1rem' }}>جاري تحميل المحتوى...</p>
                </div>
              ) : bookContent && bookContent.length > 0 ? (
                <div style={{ direction: 'rtl' }}>
                  {bookContent.map((p, i) => (
                    <div key={i} style={{ 
                      marginBottom: '1.5rem', paddingBottom: '1.5rem',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      <div style={{ 
                        fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem'
                      }}>
                        صفحة {p.page || p.id}
                      </div>
                      <div 
                        style={{ 
                          fontSize: '1.05rem', lineHeight: '2',
                          fontFamily: "'Amiri', 'Traditional Arabic', serif",
                          color: '#1f2937'
                        }}
                        dangerouslySetInnerHTML={{ __html: p.content || '' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
                  <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p>المحتوى غير متاح. يُرجى مزامنة الكتاب أولاً.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    <code dir="ltr">POST /api/sync/book/{selectedBook.id}</code>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spin animation */}
      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
