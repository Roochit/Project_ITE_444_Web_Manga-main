import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 30px',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* โลโก้ / ชื่อเว็บ */}
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>
          📖 MangaApp
        </Link>
      </div>

      {/* ลิงก์เมนูต่าง ๆ */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link href="/" style={{ color: '#ccc', textDecoration: 'none' }}>
          หน้าแรก (Frontend)
        </Link>
        <Link href="/admin/mangas" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>
          จัดการมังงะ (Admin)
        </Link>
      </div>
    </nav>
  );
}