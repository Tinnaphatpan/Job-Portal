'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore, type UserRole } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

type Step = 1 | 2;

// ===== Password strength helpers =====
interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  checks: {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
  };
}

function getPasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= 11,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  const config: Record<number, { label: string; color: string }> = {
    0: { label: '', color: '#e5e7eb' },
    1: { label: 'อ่อนมาก', color: '#ef4444' },
    2: { label: 'อ่อน', color: '#f97316' },
    3: { label: 'ปานกลาง', color: '#eab308' },
    4: { label: 'แข็งแรง', color: '#22c55e' },
  };

  return { score, ...config[score], checks };
}

// ===== Register Page =====
export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'JOBSEEKER' as UserRole,
    companyName: '',
  });

  const passwordStrength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password]
  );

  // Real-time validation
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  const phoneValid = form.phone === '' || /^0[0-9]{9}$/.test(form.phone);
  const passwordMatch =
    form.confirmPassword === '' || form.password === form.confirmPassword;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordStrength.score < 4) {
      toast.error('รหัสผ่านไม่แข็งแรงพอ กรุณาตรวจสอบเงื่อนไขด้านล่าง');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.phone && !/^0[0-9]{9}$/.test(form.phone)) {
      toast.error('เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมี 10 หลัก)');
      return;
    }
    if (form.role === 'EMPLOYER' && !form.companyName.trim()) {
      toast.error('กรุณากรอกชื่อบริษัท');
      return;
    }

    try {
      await register({
        email: form.email,
        password: form.password,
        name: form.name,
        role: form.role,
        companyName: form.role === 'EMPLOYER' ? form.companyName : undefined,
        phone: form.phone || undefined,
      });
      toast.success('สมัครสมาชิกสำเร็จ ยินดีต้อนรับ!');
      router.push('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'เกิดข้อผิดพลาด กรุณาลองใหม่';
      toast.error(msg);
    }
  };

  return (
    <section>
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: '#f15a22' }}
        >
          J
        </div>
        <span className="font-bold text-lg" style={{ color: '#493584' }}>JobPortal</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">สมัครสมาชิก</h2>
          <p className="text-gray-500 text-sm mt-1">เริ่มต้นหางานในฝันได้เลย ✨</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                style={
                  step >= s
                    ? { backgroundColor: '#493584', color: 'white' }
                    : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                }
              >
                {step > s ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s
                )}
              </div>
              <span className={`text-xs font-medium ${step >= s ? 'text-gray-700' : 'text-gray-400'}`}>
                {s === 1 ? 'ข้อมูลบัญชี' : 'ข้อมูลส่วนตัว'}
              </span>
              {s < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {/* ===== Step 1: Account info ===== */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-5" autoComplete="off">
            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="อย่างน้อย 11 ตัวอักษร"
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

              {/* Password strength indicator */}
              {form.password.length > 0 && (
                <div className="mt-2.5 space-y-2">
                  {/* Strength bar */}
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor:
                            bar <= passwordStrength.score
                              ? passwordStrength.color
                              : '#e5e7eb',
                        }}
                      />
                    ))}
                    <span
                      className="text-xs font-medium ml-1 w-16 flex-shrink-0"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>

                  {/* Checks */}
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { key: 'minLength', label: 'อย่างน้อย 11 ตัวอักษร' },
                      { key: 'hasUpper', label: 'มีตัวพิมพ์ใหญ่ (A-Z)' },
                      { key: 'hasLower', label: 'มีตัวพิมพ์เล็ก (a-z)' },
                      { key: 'hasNumber', label: 'มีตัวเลข (0-9)' },
                    ].map((check) => {
                      const passed =
                        passwordStrength.checks[check.key as keyof typeof passwordStrength.checks];
                      return (
                        <div key={check.key} className="flex items-center gap-1.5 text-xs">
                          <span style={{ color: passed ? '#22c55e' : '#9ca3af' }}>
                            {passed ? '✓' : '○'}
                          </span>
                          <span style={{ color: passed ? '#16a34a' : '#9ca3af' }}>
                            {check.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                required
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border text-gray-800 text-sm outline-none transition focus:ring-2 focus:ring-[#493584]/10 placeholder:text-gray-400"
                style={{
                  borderColor: !passwordMatch ? '#ef4444' : '#e5e7eb',
                  ...(passwordMatch && form.confirmPassword.length > 0
                    ? { borderColor: '#22c55e' }
                    : {}),
                }}
              />
              {form.confirmPassword.length > 0 && !passwordMatch && (
                <p className="text-xs text-red-500 mt-1">รหัสผ่านไม่ตรงกัน</p>
              )}
              {form.confirmPassword.length > 0 && passwordMatch && (
                <p className="text-xs text-green-500 mt-1">รหัสผ่านตรงกัน ✓</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: '#f15a22' }}
            >
              ถัดไป →
            </button>
          </form>
        )}

        {/* ===== Step 2: Personal info ===== */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ-นามสกุล</label>
              <input
                type="text"
                required
                placeholder="กรอกชื่อ-นามสกุล"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none transition focus:border-[#493584] focus:ring-2 focus:ring-[#493584]/10 placeholder:text-gray-400"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                เบอร์โทรศัพท์{' '}
                <span className="text-gray-400 font-normal text-xs">- ไม่บังคับ</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                  🇹🇭
                </span>
                <input
                  type="tel"
                  placeholder="0812345678"
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm({ ...form, phone: val });
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border text-gray-800 text-sm outline-none transition focus:ring-2 focus:ring-[#493584]/10 placeholder:text-gray-400"
                  style={{
                    borderColor:
                      form.phone.length > 0
                        ? phoneValid
                          ? '#22c55e'
                          : '#ef4444'
                        : '#e5e7eb',
                  }}
                />
              </div>
              {form.phone.length > 0 && !phoneValid && (
                <p className="text-xs text-red-500 mt-1">
                  เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 หลัก
                </p>
              )}
              {form.phone.length === 10 && phoneValid && (
                <p className="text-xs text-green-500 mt-1">เบอร์โทรถูกต้อง ✓</p>
              )}
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ฉันต้องการ</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'JOBSEEKER', label: '🔍 หางาน', desc: 'ค้นหางานและสมัครงาน' },
                  { value: 'EMPLOYER', label: '🏢 ประกาศงาน', desc: 'รับสมัครพนักงาน' },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value as UserRole })}
                    className="p-4 rounded-xl border-2 text-left transition-all"
                    style={
                      form.role === r.value
                        ? { borderColor: '#493584', backgroundColor: '#493584' + '10' }
                        : { borderColor: '#e5e7eb', backgroundColor: 'white' }
                    }
                  >
                    <div className="font-semibold text-sm text-gray-800">{r.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Company name */}
            {form.role === 'EMPLOYER' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อบริษัท</label>
                <input
                  type="text"
                  required
                  placeholder="กรอกชื่อบริษัท"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none transition focus:border-[#493584] focus:ring-2 focus:ring-[#493584]/10 placeholder:text-gray-400"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-full text-gray-600 font-semibold text-sm border border-gray-200 transition-all hover:bg-gray-50"
              >
                ← ย้อนกลับ
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#f15a22' }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    กำลังสมัคร...
                  </span>
                ) : (
                  'สมัครสมาชิก'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Google register button */}
        <div className="relative mt-4 mb-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">หรือ</span>
          </div>
        </div>

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
          สมัครด้วย Google
        </button>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">มีบัญชีอยู่แล้ว?</span>
          </div>
        </div>

        <Link
          href="/login"
          className="block w-full py-3 rounded-full text-center font-semibold text-sm border-2 transition-all hover:bg-gray-50"
          style={{ borderColor: '#493584', color: '#493584' }}
        >
          เข้าสู่ระบบ
        </Link>
      </div>

      {/* Back to home */}
      <p className="text-center text-xs text-gray-400 mt-6">
        <Link href="/" className="hover:text-gray-600 transition">
          ← กลับหน้าหลัก
        </Link>
      </p>
    </section>
  );
}
