'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import {
  Users, Briefcase, FileText, ShieldCheck, Plus, X, RefreshCw,
  ToggleLeft, ToggleRight, Trash2, ChevronDown,
} from 'lucide-react';

// ===== Types =====
interface AdminStats {
  totalJobseekers: number;
  totalEmployers: number;
  totalActiveJobs: number;
  totalJobs: number;
  totalApplications: number;
  pendingApplications: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  role: 'JOBSEEKER' | 'EMPLOYER' | 'ADMIN';
  active: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

interface AdminJob {
  id: string;
  title: string;
  company: string;
  location: string;
  category?: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'EXPIRED';
  employerName: string;
  createdAt: string;
}

interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; }

// ===== Helpers =====
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}

const ROLE_LABEL: Record<string, string> = { JOBSEEKER: 'ผู้หางาน', EMPLOYER: 'นายจ้าง', ADMIN: 'Admin' };
const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'เปิดรับสมัคร', color: '#10b981' },
  CLOSED: { label: 'ปิดรับแล้ว', color: '#6b7280' },
  DRAFT: { label: 'แบบร่าง', color: '#f59e0b' },
  EXPIRED: { label: 'หมดอายุ', color: '#ef4444' },
};

// ===== Main =====
export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [tab, setTab] = useState<'overview' | 'users' | 'jobs'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [userFilter, setUserFilter] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Create user modal
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', name: '', password: '', phone: '', companyName: '', role: 'JOBSEEKER' });
  const [isCreating, setIsCreating] = useState(false);

  // Reset password modal
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [newPw, setNewPw] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }
    fetchStats();
    fetchUsers();
    fetchJobs();
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [userFilter]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get<AdminStats>('/admin/stats');
      setStats(data);
    } catch { toast.error('โหลด stats ไม่สำเร็จ'); }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: '0', size: '50' });
      if (userFilter) params.set('role', userFilter);
      const { data } = await api.get<PageResponse<AdminUser>>(`/admin/users?${params}`);
      setUsers(data.content);
      setTotalUsers(data.totalElements);
    } catch { } finally { setIsLoading(false); }
  };

  const fetchJobs = async () => {
    try {
      const { data } = await api.get<PageResponse<AdminJob>>('/admin/jobs?size=50');
      setJobs(data.content);
      setTotalJobs(data.totalElements);
    } catch { }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post('/admin/users', createForm);
      toast.success('สร้างผู้ใช้สำเร็จ — รหัสผ่านจะต้องเปลี่ยนเมื่อ login ครั้งแรก');
      setShowCreateUser(false);
      setCreateForm({ email: '', name: '', password: '', phone: '', companyName: '', role: 'JOBSEEKER' });
      fetchUsers();
      fetchStats();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'เกิดข้อผิดพลาด';
      toast.error(msg);
    } finally { setIsCreating(false); }
  };

  const handleToggleActive = async (u: AdminUser) => {
    try {
      await api.patch(`/admin/users/${u.id}/toggle-active`);
      toast.success(u.active ? 'ปิดใช้งานบัญชีแล้ว' : 'เปิดใช้งานบัญชีแล้ว');
      fetchUsers();
    } catch { toast.error('เกิดข้อผิดพลาด'); }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || !newPw) return;
    setIsResetting(true);
    try {
      await api.post(`/admin/users/${resetTarget.id}/reset-password`, { newPassword: newPw });
      toast.success(`รีเซ็ตรหัสผ่านของ ${resetTarget.name} สำเร็จ`);
      setResetTarget(null);
      setNewPw('');
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    finally { setIsResetting(false); }
  };

  const handleDeleteJob = async (job: AdminJob) => {
    if (!confirm(`ลบงาน "${job.title}" ?`)) return;
    try {
      await api.delete(`/admin/jobs/${job.id}`);
      toast.success('ลบงานสำเร็จ');
      fetchJobs();
      fetchStats();
    } catch { toast.error('เกิดข้อผิดพลาด'); }
  };

  const handleJobStatus = async (job: AdminJob, status: string) => {
    try {
      await api.patch(`/admin/jobs/${job.id}/status`, { status });
      toast.success('อัปเดตสถานะงานสำเร็จ');
      fetchJobs();
    } catch { toast.error('เกิดข้อผิดพลาด'); }
  };

  if (!user || user.role !== 'ADMIN') return null;

  const inputClass = "w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none focus:border-[#493584] focus:ring-2 focus:ring-[#493584]/10";

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="text-white py-6 px-4" style={{ background: 'linear-gradient(135deg, #493584 0%, #2f3592 50%, #1a237e 100%)' }}>
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-white/60 text-sm">จัดการระบบทั้งหมด</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-6 w-fit">
          {[
            { key: 'overview', label: 'ภาพรวม', icon: <ShieldCheck className="w-4 h-4" /> },
            { key: 'users', label: `ผู้ใช้ (${totalUsers})`, icon: <Users className="w-4 h-4" /> },
            { key: 'jobs', label: `งาน (${totalJobs})`, icon: <Briefcase className="w-4 h-4" /> },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={tab === t.key ? { backgroundColor: '#493584', color: 'white' } : { color: '#6b7280' }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ===== Overview Tab ===== */}
        {tab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'ผู้หางาน', value: stats?.totalJobseekers ?? '—', icon: <Users className="w-5 h-5" />, color: '#493584' },
              { label: 'นายจ้าง', value: stats?.totalEmployers ?? '—', icon: <ShieldCheck className="w-5 h-5" />, color: '#2f3592' },
              { label: 'งานเปิดรับ', value: stats?.totalActiveJobs ?? '—', icon: <Briefcase className="w-5 h-5" />, color: '#10b981' },
              { label: 'งานทั้งหมด', value: stats?.totalJobs ?? '—', icon: <Briefcase className="w-5 h-5" />, color: '#6b7280' },
              { label: 'ใบสมัครทั้งหมด', value: stats?.totalApplications ?? '—', icon: <FileText className="w-5 h-5" />, color: '#f59e0b' },
              { label: 'รอพิจารณา', value: stats?.pendingApplications ?? '—', icon: <FileText className="w-5 h-5" />, color: '#f15a22' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.color + '15', color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== Users Tab ===== */}
        {tab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="flex gap-2">
                {['', 'JOBSEEKER', 'EMPLOYER', 'ADMIN'].map((r) => (
                  <button key={r} onClick={() => setUserFilter(r)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                    style={userFilter === r
                      ? { backgroundColor: '#493584', color: 'white', borderColor: '#493584' }
                      : { backgroundColor: 'white', color: '#6b7280', borderColor: '#e5e7eb' }}>
                    {r === '' ? 'ทั้งหมด' : ROLE_LABEL[r]}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowCreateUser(true)}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg text-white hover:opacity-90"
                style={{ backgroundColor: '#f15a22' }}>
                <Plus className="w-4 h-4" />สร้างผู้ใช้
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['ชื่อ / อีเมล', 'บทบาท', 'สถานะ', 'วันที่สมัคร', 'จัดการ'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isLoading ? (
                      <tr><td colSpan={5} className="text-center py-8 text-gray-400">กำลังโหลด...</td></tr>
                    ) : users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-gray-400 text-xs">{u.email}</p>
                          {u.mustChangePassword && <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">ต้องเปลี่ยนรหัสผ่าน</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#493584' + '15', color: '#493584' }}>
                            {ROLE_LABEL[u.role]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            {u.active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleToggleActive(u)} title={u.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                              className="text-gray-400 hover:text-gray-700 transition-colors">
                              {u.active ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                            <button onClick={() => { setResetTarget(u); setNewPw(''); }} title="รีเซ็ตรหัสผ่าน"
                              className="text-gray-400 hover:text-[#493584] transition-colors">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== Jobs Tab ===== */}
        {tab === 'jobs' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['ตำแหน่ง / บริษัท', 'นายจ้าง', 'สถานะ', 'วันที่สร้าง', 'จัดการ'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {jobs.map((job) => {
                    const st = STATUS_LABEL[job.status] || { label: job.status, color: '#6b7280' };
                    return (
                      <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 truncate max-w-xs">{job.title}</p>
                          <p className="text-gray-400 text-xs">{job.company} • {job.location}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{job.employerName}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: st.color + '15', color: st.color }}>
                              {st.label}
                            </span>
                            <div className="relative group">
                              <button className="text-gray-400 hover:text-gray-600 ml-1"><ChevronDown className="w-3 h-3" /></button>
                              <div className="absolute left-0 top-6 bg-white border border-gray-100 rounded-xl shadow-lg z-10 hidden group-hover:block min-w-[120px]">
                                {['ACTIVE', 'CLOSED', 'EXPIRED'].map((s) => (
                                  <button key={s} onClick={() => handleJobStatus(job, s)}
                                    className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">
                                    {STATUS_LABEL[s]?.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(job.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteJob(job)} title="ลบงาน"
                            className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ===== Create User Modal ===== */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">สร้างผู้ใช้ใหม่</h3>
              <button onClick={() => setShowCreateUser(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <input required placeholder="ชื่อ-นามสกุล" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className={inputClass} />
              <input required type="email" placeholder="อีเมล" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className={inputClass} />
              <input required type="password" placeholder="รหัสผ่านชั่วคราว" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className={inputClass} />
              <input placeholder="เบอร์โทร" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} className={inputClass} />
              <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className={inputClass}>
                <option value="JOBSEEKER">ผู้หางาน</option>
                <option value="EMPLOYER">นายจ้าง</option>
                <option value="ADMIN">Admin</option>
              </select>
              {createForm.role === 'EMPLOYER' && (
                <input placeholder="ชื่อบริษัท" value={createForm.companyName} onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })} className={inputClass} />
              )}
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">ผู้ใช้จะต้องเปลี่ยนรหัสผ่านเมื่อ login ครั้งแรก</p>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateUser(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">ยกเลิก</button>
                <button type="submit" disabled={isCreating} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60" style={{ backgroundColor: '#f15a22' }}>
                  {isCreating ? 'กำลังสร้าง...' : 'สร้างผู้ใช้'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Reset Password Modal ===== */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">รีเซ็ตรหัสผ่าน</h3>
              <button onClick={() => setResetTarget(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">ตั้งรหัสผ่านชั่วคราวให้ <span className="font-medium text-gray-800">{resetTarget.name}</span></p>
            <input type="password" placeholder="รหัสผ่านใหม่" value={newPw} onChange={(e) => setNewPw(e.target.value)} className={inputClass + ' mb-2'} />
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">ผู้ใช้จะต้องเปลี่ยนรหัสผ่านเมื่อ login ครั้งถัดไป</p>
            <div className="flex gap-2">
              <button onClick={() => setResetTarget(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">ยกเลิก</button>
              <button onClick={handleResetPassword} disabled={isResetting || !newPw} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60" style={{ backgroundColor: '#493584' }}>
                {isResetting ? 'กำลังรีเซ็ต...' : 'รีเซ็ตรหัสผ่าน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
