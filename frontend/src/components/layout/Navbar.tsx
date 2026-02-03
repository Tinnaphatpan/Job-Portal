'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { User, Briefcase, ShieldCheck, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push('/');
  };

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dashboardHref =
    user?.role === 'EMPLOYER' ? '/dashboard/employer'
    : user?.role === 'ADMIN' ? '/dashboard/admin'
    : '/dashboard';

  const menuItems = user ? [
    ...(user.role === 'ADMIN' ? [
      { href: '/dashboard/admin', label: 'จัดการระบบ', icon: <ShieldCheck className="w-4 h-4" />, highlight: true },
    ] : []),
    { href: dashboardHref, label: user.role === 'EMPLOYER' ? 'แดชบอร์ด' : 'โปรไฟล์ของฉัน', icon: <User className="w-4 h-4" /> },
    ...(user.role === 'EMPLOYER' ? [
      { href: '/dashboard/employer', label: 'งานของฉัน', icon: <Briefcase className="w-4 h-4" /> },
    ] : []),
    ...(user.role === 'JOBSEEKER' ? [
      { href: '/dashboard', label: 'ใบสมัครของฉัน', icon: <Briefcase className="w-4 h-4" /> },
    ] : []),
  ] : [];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="JobPortal" className="w-9 h-9 object-contain" />
          <span className="font-bold text-lg" style={{ color: '#493584' }}>
            Job<span className="text-gray-900">Portal</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/jobs" className="hover:text-gray-900 transition-colors font-medium">หางาน</Link>
          <Link href="/#categories" className="hover:text-gray-900 transition-colors font-medium">เกี่ยวกับ</Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar + Name button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#493584' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-gray-700 font-medium max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                    <p className="text-gray-400 text-xs truncate">{user.email}</p>
                  </div>

                  {menuItems.map((item) => (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${item.highlight ? 'font-semibold' : 'text-gray-700'}`}
                      style={item.highlight ? { color: '#f15a22' } : {}}
                    >
                      <span style={item.highlight ? { color: '#f15a22' } : { color: '#9ca3af' }}>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}

                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-900 transition-colors font-medium">เข้าสู่ระบบ</Link>
              <Link href="/register" className="text-white px-5 py-2 rounded-full font-semibold hover:opacity-90 transition-all text-sm" style={{ backgroundColor: '#f15a22' }}>
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-gray-600 hover:text-gray-900" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-1 text-sm">
          <Link href="/jobs" onClick={() => setMobileOpen(false)} className="font-medium text-gray-700 hover:text-gray-900 py-2">หางาน</Link>
          <Link href="/#categories" onClick={() => setMobileOpen(false)} className="font-medium text-gray-700 hover:text-gray-900 py-2">เกี่ยวกับ</Link>

          {user ? (
            <>
              <div className="border-t border-gray-100 mt-2 pt-3 mb-1">
                <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                <p className="text-gray-400 text-xs">{user.email}</p>
              </div>
              {menuItems.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 py-2.5 text-sm transition-colors ${item.highlight ? 'font-semibold' : 'text-gray-700'}`}
                  style={item.highlight ? { color: '#f15a22' } : {}}
                >
                  <span style={item.highlight ? { color: '#f15a22' } : { color: '#9ca3af' }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="flex items-center gap-3 text-left text-red-500 font-medium py-2.5 border-t border-gray-100 mt-1"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="font-medium text-gray-700 hover:text-gray-900 py-2">เข้าสู่ระบบ</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="inline-block text-white px-5 py-2 rounded-full font-semibold text-center mt-1" style={{ backgroundColor: '#f15a22' }}>
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
