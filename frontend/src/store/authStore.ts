/**
 * [EN] authStore.ts — Global authentication state management using Zustand.
 *
 *      This store manages:
 *        - Current user data (id, name, email, role, avatar)
 *        - JWT access/refresh tokens
 *        - Login, register, and logout actions
 *        - Partial user updates without full re-login (updateUser)
 *
 *      Storage strategy:
 *        - Tokens: sessionStorage (cleared on browser/tab close = more secure)
 *        - User data: sessionStorage via Zustand persist (survives page refresh)
 *
 *      RBAC roles in this app:
 *        - JOBSEEKER: can browse and apply for jobs, edit profile
 *        - EMPLOYER:  can post jobs, review applications
 *        - ADMIN:     can manage all users and jobs via admin dashboard
 *
 * [TH] authStore.ts — จัดการ state การ authenticate ระดับ global ด้วย Zustand
 *
 *      Store นี้จัดการ:
 *        - ข้อมูล user ปัจจุบัน (id, ชื่อ, email, บทบาท, avatar)
 *        - JWT access/refresh tokens
 *        - action สำหรับ login, register, logout
 *        - อัปเดตข้อมูล user บางส่วนโดยไม่ต้อง login ใหม่ (updateUser)
 *
 *      กลยุทธ์เก็บข้อมูล:
 *        - Token: sessionStorage (หายเมื่อปิด browser/tab = ปลอดภัยกว่า)
 *        - ข้อมูล user: sessionStorage ผ่าน Zustand persist (อยู่รอดหลัง refresh หน้า)
 *
 *      บทบาท RBAC ในระบบนี้:
 *        - JOBSEEKER: ดูงานและสมัครงานได้, แก้ไขโปรไฟล์
 *        - EMPLOYER:  โพสต์งานได้, ดูใบสมัคร
 *        - ADMIN:     จัดการ user และงานทั้งหมดผ่าน admin dashboard
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';

// [EN] Possible user roles in the system
// [TH] บทบาทผู้ใช้ที่เป็นไปได้ในระบบ
export type UserRole = 'JOBSEEKER' | 'EMPLOYER' | 'ADMIN';

/**
 * [EN] User data structure returned from the backend after login/register.
 * [TH] โครงสร้างข้อมูล user ที่ได้จาก backend หลัง login/register
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  companyName?: string;           // [EN] Only for EMPLOYER role | [TH] สำหรับ EMPLOYER เท่านั้น
  mustChangePassword?: boolean;  // [EN] True when admin creates/resets a user's password | [TH] เป็น true เมื่อ admin สร้าง/reset รหัสผ่าน
}

/**
 * [EN] Shape of the auth state and its actions in Zustand
 * [TH] รูปแบบของ state และ action ทั้งหมดใน Zustand store
 */
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ mustChangePassword: boolean }>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setTokens: (access: string, refresh: string, user: User) => void;
  updateUser: (updates: Partial<User>) => void;
}

/**
 * [EN] Data required to register a new user account
 * [TH] ข้อมูลที่จำเป็นสำหรับสร้าง account ใหม่
 */
interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyName?: string;  // [EN] Required only when role = EMPLOYER | [TH] จำเป็นเฉพาะเมื่อ role = EMPLOYER
  phone?: string;
}

/**
 * [EN] Main auth store created with Zustand.
 *      Uses `persist` middleware to save user state to sessionStorage.
 *      `partialize` limits what gets persisted — only `user`, not tokens
 *      (tokens are stored separately in sessionStorage directly).
 * [TH] Auth store หลักที่สร้างด้วย Zustand
 *      ใช้ middleware `persist` เพื่อบันทึก state ลง sessionStorage
 *      `partialize` จำกัดสิ่งที่ persist — แค่ `user` ไม่บันทึก token
 *      (token เก็บแยกใน sessionStorage โดยตรง)
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // [EN] Initial state — all null/false
      // [TH] State เริ่มต้น — ทุกอย่างเป็น null/false
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      /**
       * [EN] login — Authenticate with email and password.
       *      Calls POST /auth/login, saves tokens to sessionStorage,
       *      and updates the Zustand store with user data.
       *      Returns `mustChangePassword` flag so the calling component
       *      can redirect to /change-password if needed.
       * [TH] login — ยืนยันตัวตนด้วย email และ password
       *      เรียก POST /auth/login, บันทึก token ลง sessionStorage
       *      และอัปเดต Zustand store ด้วยข้อมูล user
       *      คืน flag `mustChangePassword` เพื่อให้ component ที่เรียก
       *      redirect ไป /change-password ได้ถ้าจำเป็น
       *
       * @param email    - User's email address
       * @param password - User's password
       * @returns { mustChangePassword: boolean } — whether the user must change their password
       */
      login: async (email, password) => {
        set({ isLoading: true }); // [EN] Show loading state in UI | [TH] แสดงสถานะ loading ใน UI
        try {
          const { data } = await api.post('/auth/login', { email, password });

          // [EN] Save tokens to sessionStorage for the Axios interceptor to use
          // [TH] บันทึก token ลง sessionStorage เพื่อให้ Axios interceptor ใช้
          sessionStorage.setItem('access_token', data.accessToken);
          sessionStorage.setItem('refresh_token', data.refreshToken);

          // [EN] Update Zustand store with user data and tokens
          // [TH] อัปเดต Zustand store ด้วยข้อมูล user และ token
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });

          // [EN] Return mustChangePassword so the login page can redirect accordingly
          // [TH] คืน mustChangePassword เพื่อให้หน้า login redirect ได้ตามเงื่อนไข
          return { mustChangePassword: data.user.mustChangePassword || false };
        } finally {
          set({ isLoading: false }); // [EN] Always turn off loading | [TH] ปิด loading เสมอไม่ว่าจะสำเร็จหรือล้มเหลว
        }
      },

      /**
       * [EN] register — Create a new user account.
       *      Calls POST /auth/register, then automatically logs in the new user
       *      by saving their tokens and updating the store.
       * [TH] register — สร้าง account ผู้ใช้ใหม่
       *      เรียก POST /auth/register แล้ว login อัตโนมัติโดย
       *      บันทึก token และอัปเดต store
       *
       * @param registerData - User's registration data (email, password, name, role, etc.)
       */
      register: async (registerData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', registerData);
          sessionStorage.setItem('access_token', data.accessToken);
          sessionStorage.setItem('refresh_token', data.refreshToken);
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * [EN] logout — Clear all authentication data.
       *      Removes tokens from sessionStorage and resets the Zustand store.
       *      After this, all API requests will fail (no token) and user
       *      will be redirected to login by the Axios interceptor.
       * [TH] logout — ล้างข้อมูล authentication ทั้งหมด
       *      ลบ token ออกจาก sessionStorage และ reset Zustand store
       *      หลังจากนี้ ทุก API request จะล้มเหลว (ไม่มี token)
       *      และ Axios interceptor จะ redirect ไป login
       */
      logout: () => {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        set({ user: null, accessToken: null, refreshToken: null });
      },

      /**
       * [EN] setTokens — Inject tokens directly (e.g. after token refresh).
       * [TH] setTokens — ฉีด token โดยตรง (เช่น หลัง refresh token)
       *
       * @param access  - New JWT access token
       * @param refresh - New JWT refresh token
       * @param user    - User data from backend
       */
      setTokens: (access, refresh, user) => {
        sessionStorage.setItem('access_token', access);
        sessionStorage.setItem('refresh_token', refresh);
        set({ user, accessToken: access, refreshToken: refresh });
      },

      /**
       * [EN] updateUser — Update partial user data in the store.
       *      Used to update profile info (name, avatar, etc.) without re-logging in.
       *      Uses spread operator to merge updates into existing user data.
       * [TH] updateUser — อัปเดตข้อมูล user บางส่วนใน store
       *      ใช้อัปเดตข้อมูลโปรไฟล์ (ชื่อ, avatar ฯลฯ) โดยไม่ต้อง login ใหม่
       *      ใช้ spread operator เพื่อรวม updates เข้ากับข้อมูล user ที่มีอยู่
       *
       * @param updates - Partial user object with only the fields to update
       */
      updateUser: (updates) => {
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null }));
      },
    }),
    {
      name: 'auth-storage', // [EN] Key in sessionStorage | [TH] key ใน sessionStorage

      // [EN] Use sessionStorage instead of localStorage — cleared when browser/tab closes
      // [TH] ใช้ sessionStorage แทน localStorage — ถูกลบเมื่อปิด browser/tab
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : localStorage
      ),

      // [EN] Only persist `user` — tokens are separately managed in sessionStorage
      //      This prevents tokens from being double-stored
      // [TH] Persist เฉพาะ `user` — token จัดการแยกใน sessionStorage
      //      เพื่อป้องกันการ store token ซ้ำซ้อน
      partialize: (state) => ({ user: state.user }),
    }
  )
);
