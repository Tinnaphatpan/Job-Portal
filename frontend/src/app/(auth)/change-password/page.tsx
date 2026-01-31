'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  const passwordValid = (pw: string) =>
    pw.length >= 11 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid(form.newPassword)) {
      toast.error('รหัสผ่านใหม่ต้องมีอย่างน้อย 11 ตัว มีพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่');
      logout();
      router.push('/login');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'เกิดข้อผิดพลาด กรุณาลองใหม่';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none transition focus:border-[#493584] focus:ring-2 focus:ring-[#493584]/10 placeholder:text-gray-400 pr-12";

  const PasswordInput = ({
    label, field, value, showKey,
  }: { label: string; field: 'currentPassword' | 'newPassword' | 'confirmPassword'; value: string; showKey: 'current' | 'new' | 'confirm' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? 'text' : 'password'}
          required
          placeholder="••••••••"
          value={value}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setShow({ ...show, [showKey]: !show[showKey] })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
        >
          {show[showKey] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div>
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#f15a22' }}>J</div>
        <span className="font-bold text-lg" style={{ color: '#493584' }}>JobPortal</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#493584' + '15' }}>
            <Shield className="w-5 h-5" style={{ color: '#493584' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">ตั้งรหัสผ่านใหม่</h2>
            <p className="text-gray-400 text-sm">Admin ได้รีเซ็ตรหัสผ่านให้คุณ กรุณาตั้งรหัสผ่านใหม่</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-amber-700 text-sm font-medium">⚠️ คุณต้องตั้งรหัสผ่านใหม่ก่อนใช้งานระบบต่อ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          <PasswordInput label="รหัสผ่านปัจจุบัน (ที่ Admin ตั้งให้)" field="currentPassword" value={form.currentPassword} showKey="current" />
          <PasswordInput label="รหัสผ่านใหม่" field="newPassword" value={form.newPassword} showKey="new" />
          <PasswordInput label="ยืนยันรหัสผ่านใหม่" field="confirmPassword" value={form.confirmPassword} showKey="confirm" />

          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
            <p className={form.newPassword.length >= 11 ? 'text-green-600' : ''}>✓ อย่างน้อย 11 ตัวอักษร</p>
            <p className={/[A-Z]/.test(form.newPassword) ? 'text-green-600' : ''}>✓ มีตัวพิมพ์ใหญ่ (A-Z)</p>
            <p className={/[a-z]/.test(form.newPassword) ? 'text-green-600' : ''}>✓ มีตัวพิมพ์เล็ก (a-z)</p>
            <p className={/[0-9]/.test(form.newPassword) ? 'text-green-600' : ''}>✓ มีตัวเลข (0-9)</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#f15a22' }}
          >
            {isLoading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
          </button>
        </form>
      </div>
    </div>
  );
}
