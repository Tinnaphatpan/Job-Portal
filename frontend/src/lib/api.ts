/**
 * [EN] api.ts — Axios HTTP client configuration for Job Portal frontend.
 *
 *      Sets up a pre-configured Axios instance with:
 *        1. Base URL pointing to the Spring Boot backend
 *        2. Request interceptor: automatically attaches JWT Bearer token
 *        3. Response interceptor: automatically refreshes expired tokens
 *           and retries the original request (silent token refresh)
 *
 * [TH] api.ts — การตั้งค่า Axios HTTP client สำหรับ Job Portal frontend
 *
 *      ตั้งค่า Axios instance ที่กำหนดค่าล่วงหน้าพร้อม:
 *        1. Base URL ที่ชี้ไปยัง Spring Boot backend
 *        2. Request interceptor: แนบ JWT Bearer token อัตโนมัติทุก request
 *        3. Response interceptor: refresh token ที่หมดอายุอัตโนมัติ
 *           แล้ว retry request เดิม (silent token refresh)
 */
import axios from 'axios';

// [EN] Backend API base URL from environment variable, fallback to localhost for development
// [TH] URL ของ backend จาก environment variable, fallback เป็น localhost สำหรับพัฒนา
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * [EN] Main Axios instance used throughout the application.
 *      All API calls go through this instance to benefit from interceptors.
 *      baseURL: all requests are relative to /api/v1
 * [TH] Axios instance หลักที่ใช้ทั่วทั้ง application
 *      ทุก API call ผ่าน instance นี้เพื่อได้รับประโยชน์จาก interceptors
 *      baseURL: ทุก request จะ relative กับ /api/v1
 */
export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * [EN] REQUEST INTERCEPTOR — Auto-attach JWT Bearer token.
 *      Before every request is sent, check if there's a JWT token
 *      stored in sessionStorage. If found, add it to the Authorization header.
 *      Uses sessionStorage (not localStorage) — token is cleared when browser/tab closes.
 *
 * [TH] REQUEST INTERCEPTOR — แนบ JWT Bearer token อัตโนมัติ
 *      ก่อนส่ง request ทุกครั้ง ตรวจสอบว่ามี JWT token ใน sessionStorage หรือไม่
 *      ถ้าพบ ให้เพิ่มลงใน Authorization header
 *      ใช้ sessionStorage (ไม่ใช่ localStorage) — token หายเมื่อปิด browser/tab
 */
api.interceptors.request.use((config) => {
  // [EN] Check typeof window to avoid SSR errors (Next.js runs on server too)
  // [TH] ตรวจสอบ typeof window เพื่อป้องกัน error ตอน server-side render (Next.js ทำงานทั้ง server และ client)
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * [EN] RESPONSE INTERCEPTOR — Silent token refresh (auto-retry on 401).
 *      When a request fails with HTTP 401 (Unauthorized/Token Expired):
 *        1. Check if there's a refresh token available
 *        2. Call /auth/refresh to get a new access token
 *        3. Save the new access token to sessionStorage
 *        4. Retry the original failed request with the new token
 *      If refresh also fails → clear all tokens → redirect to /login
 *
 * [TH] RESPONSE INTERCEPTOR — Silent token refresh (auto-retry เมื่อ 401)
 *      เมื่อ request ล้มเหลวด้วย HTTP 401 (token หมดอายุ):
 *        1. ตรวจสอบว่ามี refresh token หรือไม่
 *        2. เรียก /auth/refresh เพื่อขอ access token ใหม่
 *        3. บันทึก access token ใหม่ลง sessionStorage
 *        4. ส่ง request เดิมซ้ำอีกครั้งด้วย token ใหม่
 *      ถ้า refresh ล้มเหลวด้วย → ล้าง token ทั้งหมด → redirect ไป /login
 */
api.interceptors.response.use(
  // [EN] Pass through successful responses unchanged
  // [TH] ส่ง response ที่สำเร็จผ่านไปโดยไม่แก้ไข
  (res) => res,
  async (error) => {
    const original = error.config; // [EN] The original request config | [TH] config ของ request เดิม
    const refreshToken = typeof window !== 'undefined' ? sessionStorage.getItem('refresh_token') : null;

    // [EN] Conditions to attempt token refresh:
    //      - Error is 401 (Unauthorized)
    //      - Haven't already tried to refresh for this request (_retry flag)
    //      - A refresh token exists
    // [TH] เงื่อนไขสำหรับ refresh token:
    //      - Error เป็น 401 (ไม่ได้รับอนุญาต / token หมดอายุ)
    //      - ยังไม่เคย retry request นี้มาก่อน (flag _retry)
    //      - มี refresh token อยู่
    if (error.response?.status === 401 && !original._retry && refreshToken) {
      original._retry = true; // [EN] Mark as retried to prevent infinite loop | [TH] ทำ mark ว่า retry แล้วเพื่อป้องกัน loop ไม่สิ้นสุด
      try {
        // [EN] Request a new access token using the refresh token
        // [TH] ขอ access token ใหม่โดยใช้ refresh token
        const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refreshToken });

        // [EN] Save the new access token and update the original request header
        // [TH] บันทึก access token ใหม่ และอัปเดต header ของ request เดิม
        sessionStorage.setItem('access_token', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;

        // [EN] Retry the original request with the new token
        // [TH] ส่ง request เดิมซ้ำอีกครั้งด้วย token ใหม่
        return api(original);
      } catch {
        // [EN] Refresh failed (refresh token also expired or invalid) → force logout
        // [TH] Refresh ล้มเหลว (refresh token หมดอายุหรือไม่ถูกต้องด้วย) → บังคับ logout
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    // [EN] For all other errors, reject the promise so the calling code can handle it
    // [TH] สำหรับ error อื่นๆ ปฏิเสธ promise เพื่อให้โค้ดที่เรียกจัดการเอง
    return Promise.reject(error);
  }
);
