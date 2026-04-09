/**
 * [TH] LoginPage — หน้าเข้าสู่ระบบสำหรับ Job Portal
 *
 *      ความสามารถ:
 *        1. Login ด้วย Email + Password ผ่าน JWT API (POST /auth/login)
 *        2. บังคับเปลี่ยนรหัสผ่าน — ถ้า admin สร้าง/reset รหัสผ่านให้ user
 *           ต้องเปลี่ยนรหัสผ่านก่อนจึงจะเข้าใช้งานระบบได้
 *        3. ปุ่มแสดง/ซ่อนรหัสผ่านเพื่อ UX ที่ดีขึ้น
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(form.email, form.password);
      toast.success('เข้าสู่ระบบสำเร็จ');
      if (result.mustChangePassword) {
        router.push('/change-password');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'เกิดข้อผิดพลาด กรุณาลองใหม่';
      toast.error(msg);
    }
  };

  return (
    <section>
      {/* Logo บนมือถือ */}
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: '#f15a22' }}
        >
          J
        </div>
        <span className="font-bold text-lg" style={{ color: '#493584' }}>JobPortal</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบ</h2>
          <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับกลับมา 👋</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
            <input
              type="email"
              required
              placeholder="example@email.com"
              autoComplete="off"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none transition focus:border-[#493584] focus:ring-2 focus:ring-[#493584]/10 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none transition focus:border-[#493584] focus:ring-2 focus:ring-[#493584]/10 placeholder:text-gray-400 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#f15a22' }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                กำลังเข้าสู่ระบบ...
              </span>
            ) : (
              'เข้าสู่ระบบ'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="font-semibold hover:underline" style={{ color: '#493584' }}>
            สมัครสมาชิกฟรี
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        <Link href="/" className="hover:text-gray-600 transition">← กลับหน้าหลัก</Link>
      </p>
    </section>
  );
}
