'use client';

import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex">
      {/* Left Panel — Gradient */}
      <aside
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #493584 0%, #2f3592 50%, #1a237e 100%)' }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10 bg-white" />
          <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full opacity-5 bg-white" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: '#f15a22' }}
          >
            J
          </div>
          <span className="text-white font-bold text-xl tracking-wide">JobPortal</span>
        </Link>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h1 className="text-white text-4xl font-bold leading-tight mb-6">
            หางานในฝัน<br />
            <span style={{ color: '#f15a22' }}>เริ่มต้นที่นี่</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            แพลตฟอร์มหางานที่เชื่อมต่อผู้หางานกับบริษัทชั้นนำ<br />
            มากกว่า 10,000 ตำแหน่งงานที่รอคุณอยู่
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { value: '10K+', label: 'ตำแหน่งงาน' },
              { value: '5K+', label: 'บริษัท' },
              { value: '50K+', label: 'ผู้ใช้งาน' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-white font-bold text-2xl">{s.value}</div>
                <div className="text-white/60 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-white/40 text-sm">
          © 2025 JobPortal. All rights reserved.
        </div>
      </aside>

      {/* Right Panel — Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
