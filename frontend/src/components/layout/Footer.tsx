+++++++import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8 px-4 relative overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #493584 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="JobPortal" className="w-9 h-9 object-contain" />
              <span className="font-bold text-xl text-white">JobPortal</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              แพลตฟอร์มหางานชั้นนำที่เชื่อมต่อผู้หางานกับบริษัทชั้นนำทั่วประเทศ
            </p>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-gray-500">ตำแหน่งงานกว่า <span className="text-white font-medium">10,000+</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span className="text-gray-500">บริษัทชั้นนำกว่า <span className="text-white font-medium">5,000+</span> แห่ง</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span className="text-gray-500">ผู้ใช้งานกว่า <span className="text-white font-medium">50,000+</span> คน</span>
              </div>
            </div>
          </div>

          {/* Links: ผู้หางาน */}
          <div>
            <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">ผู้หางาน</p>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link href="/jobs" className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-orange-400 transition-colors" />ค้นหางาน
              </Link>
              <Link href="/register" className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-orange-400 transition-colors" />สมัครสมาชิกฟรี
              </Link>
              <Link href="/dashboard" className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-orange-400 transition-colors" />โปรไฟล์ของฉัน
              </Link>
              <Link href="/login" className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-orange-400 transition-colors" />เข้าสู่ระบบ
              </Link>
            </div>
          </div>

          {/* Links: นายจ้าง */}
          <div>
            <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">นายจ้าง</p>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link href="/register?role=EMPLOYER" className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-orange-400 transition-colors" />โพสต์งานฟรี
              </Link>
              <Link href="/dashboard/employer" className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-orange-400 transition-colors" />จัดการตำแหน่งงาน
              </Link>
              <Link href="/login" className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-orange-400 transition-colors" />เข้าสู่ระบบนายจ้าง
              </Link>
            </div>
          </div>

          {/* Newsletter / Social */}
          <div>
            <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">รับข่าวสารงาน</p>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              รับการแจ้งเตือนตำแหน่งงานใหม่ที่ตรงกับคุณทุกวัน
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="อีเมลของคุณ"
                className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-600 outline-none focus:border-gray-500 transition"
              />
              <button
                className="flex-shrink-0 px-3 py-2 rounded-lg text-white text-xs font-semibold transition hover:opacity-90"
                style={{ backgroundColor: '#f15a22' }}
              >
                สมัคร
              </button>
            </div>
            <div className="mt-5">
              <p className="text-xs text-gray-600 mb-2">ติดตามเรา</p>
              <div className="flex gap-2">
                <a href="#" className="w-9 h-9 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" style={{ backgroundColor: '#1877f222', border: '1px solid #1877f233' }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877f2">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.027 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.696 4.533-4.696 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.1 24 18.1 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" style={{ backgroundColor: '#e1306c22', border: '1px solid #e1306c33' }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="url(#ig-grad)">
                    <defs>
                      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f09433" />
                        <stop offset="25%" stopColor="#e6683c" />
                        <stop offset="50%" stopColor="#dc2743" />
                        <stop offset="75%" stopColor="#cc2366" />
                        <stop offset="100%" stopColor="#bc1888" />
                      </linearGradient>
                    </defs>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" style={{ backgroundColor: '#0a66c222', border: '1px solid #0a66c233' }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0a66c2">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" style={{ backgroundColor: '#ffffff15', border: '1px solid #ffffff20' }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider + category tags */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {['เทคโนโลยี', 'การตลาด', 'ดีไซน์', 'การเงิน', 'สาธารณสุข', 'วิศวกรรม', 'ค้าปลีก', 'การศึกษา'].map((c) => (
              <Link key={c} href={`/jobs?category=${encodeURIComponent(c)}`}
                className="text-xs px-3 py-1 rounded-full border border-gray-800 text-gray-600 hover:text-white hover:border-gray-600 transition-all">
                {c}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>© 2025 JobPortal. สงวนลิขสิทธิ์ทั้งหมด</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-400 cursor-pointer transition">นโยบายความเป็นส่วนตัว</span>
            <span className="hover:text-gray-400 cursor-pointer transition">เงื่อนไขการใช้งาน</span>
            <span className="hover:text-gray-400 cursor-pointer transition">ติดต่อเรา</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
