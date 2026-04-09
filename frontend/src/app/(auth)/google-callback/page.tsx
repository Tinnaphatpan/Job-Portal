'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuthStore();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const providerId = searchParams.get('provider_id');
    const avatar = searchParams.get('avatar');

    if (!email || !providerId) {
      toast.error('เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
      router.push('/login');
      return;
    }

    handled.current = true;

    api
      .post('/auth/google', {
        email,
        name: name || email,
        providerId,
        avatar: avatar || null,
      })
      .then(({ data }) => {
        setTokens(data.accessToken, data.refreshToken, data.user);
        toast.success('เข้าสู่ระบบสำเร็จ');
        router.push('/');
      })
      .catch(() => {
        toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
        router.push('/login');
      });
  }, [router, searchParams, setTokens]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div
        className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: '#493584', borderTopColor: 'transparent' }}
      />
      <p className="mt-4 text-gray-500 text-sm">กำลังเข้าสู่ระบบ...</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: '#493584', borderTopColor: 'transparent' }}
        />
        <p className="mt-4 text-gray-500 text-sm">กำลังเข้าสู่ระบบ...</p>
      </div>
    }>
      <GoogleCallbackInner />
    </Suspense>
  );
}
