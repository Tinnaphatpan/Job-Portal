/**
 
 * [TH] LoginPage — หน้าเข้าสู่ระบบสำหรับ Job Portal
 *
 *      ความสามารถ:
 *        1. Login ด้วย Email + Password ผ่าน JWT API (POST /auth/login)
 *        2. Login ด้วย Google OAuth ผ่าน NextAuth (redirect ไป /google-callback)
 *        3. บังคับเปลี่ยนรหัสผ่าน — ถ้า admin สร้าง/reset รหัสผ่านให้ user
 *           ต้องเปลี่ยนรหัสผ่านก่อนจึงจะเข้าใช้งานระบบได้
 *        4. ปุ่มแสดง/ซ่อนรหัสผ่านเพื่อ UX ที่ดีขึ้น
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  // [EN] Get login function and loading state from global auth store
  // [TH] ดึงฟังก์ชัน login และสถานะ loading จาก global auth store
  const { login, isLoading } = useAuthStore();

  // [EN] Controlled form state for email and password inputs
  // [TH] State ของฟอร์มที่ควบคุมสำหรับช่อง email และ password
  const [form, setForm] = useState({ email: '', password: '' });

  // [EN] Toggle between showing/hiding password text
  // [TH] สลับระหว่างแสดง/ซ่อนข้อความรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);

  /**
   * [TH] handleSubmit — ประมวลผลการส่งฟอร์ม login
   *      1. เรียก authStore.login() ซึ่งยิง POST /api/v1/auth/login
   *      2. สำเร็จ: แสดง toast และ redirect ตาม mustChangePassword
   *      3. ล้มเหลว: แสดงข้อความ error จาก backend
   */
  const handleGoogleLogin = async () => {
    toast.info('Step 1: กำลังเรียก Supabase...');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        toast.error('Step 2 Error: ' + error.message);
        return;
      }
      if (data?.url) {
        toast.success('Step 2 OK: กำลัง redirect...');
        setTimeout(() => { window.location.href = data.url; }, 1000);
      } else {
        toast.error('Step 2: ไม่มี URL จาก Supabase');
      }
    } catch (e: unknown) {
      toast.error('Exception: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // [EN] Prevent browser default form submission (page reload) | [TH] ป้องกัน browser โหลดหน้าใหม่
    try {
      const result = await login(form.email, form.password);
      toast.success('เข้าสู่ระบบสำเร็จ');

      // [EN] If admin set mustChangePassword (created/reset user), force them to change it
      // [TH] ถ้า admin ตั้ง mustChangePassword (สร้าง/reset รหัสผ่าน) บังคับให้เปลี่ยนก่อน
      if (result.mustChangePassword) {
        router.push('/change-password');
      } else {
        router.push('/'); // [EN] Normal login → go to home | [TH] Login ปกติ → ไปหน้าหลัก
      }
    } catch (err: unknown) {
      // [EN] Extract the error message from Axios error response, fallback to generic message
      // [TH] ดึงข้อความ error จาก Axios error response ถ้าไม่มีให้ใช้ข้อความทั่วไป
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'เกิดข้อผิดพลาด กรุณาลองใหม่';
      toast.error(msg);
    }
  };

  return (
    <section>
      {/* [TH] Logo บนมือถือ — แสดงเฉพาะจอเล็ก (ซ่อนบน desktop ที่มี split layout) */}
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: '#f15a22' }}
        >
          J
        </div>
        <span className="font-bold text-lg" style={{ color: '#493584' }}>JobPortal</span>
      </div>

      
      {/* [TH] Card container สำหรับฟอร์ม login */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบ</h2>
          <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับกลับมา 👋</p>
        </div>

       
        {/* [TH] ฟอร์ม login หลัก */}
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              อีเมล
            </label>
            <input
              type="email"
              required
              placeholder="example@email.com"
              autoComplete="off"
              value={form.email}
              // [TH] อัปเดตเฉพาะ email โดยใช้ spread เพื่อรักษาค่า password ไว้
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none transition focus:border-[#493584] focus:ring-2 focus:ring-[#493584]/10 placeholder:text-gray-400"
            />
          </div>

          {/* Password field with show/hide toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            </div>
            <div className="relative">
              {/* [EN] Input type changes between 'password' and 'text' based on showPassword */}
              {/* [TH] type ของ input เปลี่ยนระหว่าง 'password' และ 'text' ตาม showPassword */}
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none transition focus:border-[#493584] focus:ring-2 focus:ring-[#493584]/10 placeholder:text-gray-400 pr-12"
              />
              {/* [TH] ปุ่มรูปตาเพื่อสลับการแสดง/ซ่อนรหัสผ่าน */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPassword ? (
                  // [TH] ไอคอนตาขีดทับ = กำลังแสดงรหัสผ่านอยู่
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  // [TH] ไอคอนตา = กำลังซ่อนรหัสผ่านอยู่
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* [EN] Submit button — shows spinner while loading */}
          {/* [TH] ปุ่ม submit — แสดง spinner ขณะโหลด */}
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

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">หรือ</span>
          </div>
        </div>

        {/* Google login button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-full border border-gray-200 text-gray-700 text-sm font-medium transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          เข้าสู่ระบบด้วย Google
        </button>

        {/* [EN] Link to registration page for new users */}
        {/* [TH] ลิงก์ไปหน้าสมัครสมาชิกสำหรับผู้ใช้ใหม่ */}
        <p className="text-center text-sm text-gray-500">
          ยังไม่มีบัญชี?{' '}
          <Link
            href="/register"
            className="font-semibold hover:underline"
            style={{ color: '#493584' }}
          >
            สมัครสมาชิกฟรี
          </Link>
        </p>
      </div>

      {/* Back to home link */}
      <p className="text-center text-xs text-gray-400 mt-6">
        <Link href="/" className="hover:text-gray-600 transition">
          ← กลับหน้าหลัก
        </Link>
      </p>
    </section>
  );
}
