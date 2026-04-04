'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface BackendTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'JOBSEEKER' | 'EMPLOYER' | 'ADMIN';
    companyName?: string;
    mustChangePassword: boolean;
  };
}

export default function GoogleCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setTokens } = useAuthStore();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated') {
      const backendTokens = (session as Record<string, unknown>).backendTokens as BackendTokens | undefined;
      if (backendTokens) {
        const { accessToken, refreshToken, user } = backendTokens;
        sessionStorage.setItem('access_token', accessToken);
        sessionStorage.setItem('refresh_token', refreshToken);
        setTokens(accessToken, refreshToken, user);
        toast.success('เข้าสู่ระบบด้วย Google สำเร็จ');
        router.push('/');
      } else {
        toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
        router.push('/login');
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [session, status, router, setTokens]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#493584] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">กำลังเข้าสู่ระบบ...</p>
      </div>
    </main>
  );
}
