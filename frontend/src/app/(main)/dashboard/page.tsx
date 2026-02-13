'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import {
  Briefcase, User, Upload, FileText, Clock, CheckCircle,
  XCircle, AlertCircle, ChevronRight, Building2, Edit3, Save, X
} from 'lucide-react';

// ===== Types =====
interface ApplicationDto {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'HIRED';
  createdAt: string;
}

interface PageResponse<T> { content: T[]; totalElements: number; }

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  role: string;
}

// ===== Constants =====
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING:     { label: 'รอพิจารณา',          color: '#f59e0b', bg: '#fef3c7', icon: <Clock className="w-4 h-4" /> },
  REVIEWING:   { label: 'กำลังพิจารณา',       color: '#3b82f6', bg: '#dbeafe', icon: <AlertCircle className="w-4 h-4" /> },
  SHORTLISTED: { label: 'ผ่านการคัดกรอง',     color: '#8b5cf6', bg: '#ede9fe', icon: <CheckCircle className="w-4 h-4" /> },
  ACCEPTED:    { label: 'ผ่านการคัดเลือก',    color: '#10b981', bg: '#d1fae5', icon: <CheckCircle className="w-4 h-4" /> },
  HIRED:       { label: 'ได้รับการคัดเลือก',  color: '#10b981', bg: '#d1fae5', icon: <CheckCircle className="w-4 h-4" /> },
  REJECTED:    { label: 'ไม่ผ่านการคัดเลือก', color: '#ef4444', bg: '#fee2e2', icon: <XCircle className="w-4 h-4" /> },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ===== Avatar Component =====
function Avatar({ src, name, size = 56 }: { src?: string | null; name: string; size?: number }) {
  if (src) {
    return <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: '#f15a22', fontSize: size * 0.4 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ===== Main Page =====
export default function DashboardPage() {
  const router = useRouter();
  const { user, setTokens, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'profile' | 'resume'>('applications');

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', headline: '', bio: '' });

  // Resume state
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login?redirect=/dashboard'); return; }
    if (user.role !== 'JOBSEEKER') { router.push(user.role === 'EMPLOYER' ? '/dashboard/employer' : '/'); return; }
    fetchApplications();
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchApplications = async () => {
    setIsLoadingApps(true);
    try {
      const { data } = await api.get<PageResponse<ApplicationDto>>('/applications/my');
      setApplications(data.content || []);
    } catch { setApplications([]); } finally { setIsLoadingApps(false); }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get<UserProfile>('/users/me');
      setProfile(data);
      setEditForm({ name: data.name || '', phone: data.phone || '', headline: data.headline || '', bio: data.bio || '' });
    } catch {}
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { data } = await api.put<UserProfile>('/users/me', editForm);
      setProfile(data);
      setIsEditing(false);
      toast.success('บันทึกข้อมูลสำเร็จ');
      updateUser({ name: data.name });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || (err as Error)?.message || 'เกิดข้อผิดพลาด';
      toast.error(msg);
    } finally { setIsSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('กรุณาเลือกไฟล์รูปภาพ'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('ขนาดรูปต้องไม่เกิน 2MB'); return; }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<UserProfile>('/users/me/avatar', formData, {
        headers: { 'Content-Type': undefined },
      });
      setProfile(data);
      updateUser({ avatar: data.avatar });
      toast.success('อัปโหลดรูปโปรไฟล์สำเร็จ');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || (err as Error)?.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูป';
      toast.error(msg);
    } finally { setIsUploadingAvatar(false); }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('กรุณาอัปโหลดไฟล์ PDF เท่านั้น'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB'); return; }

    setIsUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<UserProfile>('/users/me/resume', formData, {
        headers: { 'Content-Type': undefined },
      });
      setProfile(data);
      toast.success('อัปโหลด Resume สำเร็จ');
    } catch { toast.error('เกิดข้อผิดพลาดในการอัปโหลด'); }
    finally { setIsUploadingResume(false); }
  };

  if (!user) return null;

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'PENDING').length,
    accepted: applications.filter((a) => ['ACCEPTED', 'HIRED'].includes(a.status)).length,
    rejected: applications.filter((a) => a.status === 'REJECTED').length,
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none transition focus:border-[#493584] focus:ring-2 focus:ring-[#493584]/10 placeholder:text-gray-400";

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="text-white py-8 px-4" style={{ background: 'linear-gradient(135deg, #493584 0%, #2f3592 50%, #1a237e 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Avatar with upload button */}
            <div className="relative flex-shrink-0">
              <Avatar src={profile?.avatar} name={user.name} size={56} />
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                title="เปลี่ยนรูปโปรไฟล์"
              >
                {isUploadingAvatar
                  ? <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  : <Edit3 className="w-3 h-3 text-gray-600" />
                }
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div>
              <h1 className="text-xl font-bold">สวัสดี, {profile?.name || user.name} 👋</h1>
              <p className="text-white/70 text-sm">{user.email}</p>
              {profile?.headline && <p className="text-white/60 text-xs mt-0.5">{profile.headline}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'ใบสมัครทั้งหมด', value: stats.total, color: 'white' },
              { label: 'รอพิจารณา', value: stats.pending, color: '#fbbf24' },
              { label: 'ผ่านการคัดเลือก', value: stats.accepted, color: '#34d399' },
              { label: 'ไม่ผ่าน', value: stats.rejected, color: '#f87171' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-white/70 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-6 w-fit">
          {[
            { key: 'applications', label: 'ใบสมัครของฉัน', icon: <Briefcase className="w-4 h-4" /> },
            { key: 'profile', label: 'ข้อมูลส่วนตัว', icon: <User className="w-4 h-4" /> },
            { key: 'resume', label: 'Resume', icon: <FileText className="w-4 h-4" /> },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={activeTab === tab.key ? { backgroundColor: '#493584', color: 'white' } : { color: '#6b7280' }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* ===== Applications Tab ===== */}
        {activeTab === 'applications' && (
          <div>
            {isLoadingApps ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" /><div className="h-4 bg-gray-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">ยังไม่มีใบสมัครงาน</h3>
                <p className="text-gray-400 text-sm mb-6">เริ่มค้นหางานที่ใช่สำหรับคุณได้เลย</p>
                <Link href="/jobs" className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all text-sm" style={{ backgroundColor: '#f15a22' }}>
                  ค้นหางาน <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
                  return (
                    <div key={app.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <Link href={`/jobs/${app.jobId}`} className="font-semibold text-gray-900 hover:underline text-base block truncate">{app.jobTitle}</Link>
                          <p className="text-sm text-gray-500 mt-0.5">{app.company}</p>
                        </div>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0" style={{ backgroundColor: status.bg, color: status.color }}>
                          {status.icon}{status.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <span className="text-xs text-gray-400">สมัครเมื่อ {formatDate(app.createdAt)}</span>
                        <Link href={`/jobs/${app.jobId}`} className="text-xs font-medium hover:underline" style={{ color: '#493584' }}>ดูตำแหน่งงาน →</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== Profile Tab ===== */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900 text-lg">ข้อมูลส่วนตัว</h2>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all"
                  style={{ backgroundColor: '#493584' + '15', color: '#493584' }}>
                  <Edit3 className="w-4 h-4" />แก้ไข
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setIsEditing(false); setEditForm({ name: profile?.name || '', phone: profile?.phone || '', headline: profile?.headline || '', bio: profile?.bio || '' }); }}
                    className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                    <X className="w-3.5 h-3.5" />ยกเลิก
                  </button>
                  <button onClick={handleSaveProfile} disabled={isSaving}
                    className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg text-white hover:opacity-90 transition-all disabled:opacity-60"
                    style={{ backgroundColor: '#f15a22' }}>
                    {isSaving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    บันทึก
                  </button>
                </div>
              )}
            </div>

            {/* Avatar section */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <Avatar src={profile?.avatar} name={profile?.name || user.name} size={64} />
              <div>
                <p className="font-medium text-gray-900 mb-1">{profile?.name || user.name}</p>
                <button onClick={() => avatarInputRef.current?.click()}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                  style={{ backgroundColor: '#493584' + '15', color: '#493584' }}>
                  <Upload className="w-3 h-3" />
                  {isUploadingAvatar ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูปโปรไฟล์'}
                </button>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG ขนาดไม่เกิน 2MB</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">ชื่อ-นามสกุล</label>
                {isEditing
                  ? <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputClass} placeholder="ชื่อ-นามสกุล" />
                  : <p className="font-semibold text-gray-900">{profile?.name || user.name}</p>
                }
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">อีเมล</label>
                <p className="text-gray-800">{user.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">ไม่สามารถเปลี่ยนอีเมลได้</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">เบอร์โทรศัพท์</label>
                {isEditing
                  ? <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className={inputClass} placeholder="0812345678" type="tel" />
                  : <p className="text-gray-800">{profile?.phone || <span className="text-gray-400 text-sm">ยังไม่ได้ระบุ</span>}</p>
                }
              </div>

              {/* Headline */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">ตำแหน่ง / สาขา</label>
                {isEditing
                  ? <input value={editForm.headline} onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                      className={inputClass} placeholder="เช่น Frontend Developer, Marketing Specialist" />
                  : <p className="text-gray-800">{profile?.headline || <span className="text-gray-400 text-sm">ยังไม่ได้ระบุ</span>}</p>
                }
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">แนะนำตัว</label>
                {isEditing
                  ? <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3} className={`${inputClass} resize-none`} placeholder="แนะนำตัวสั้นๆ เพื่อให้นายจ้างรู้จักคุณ..." />
                  : <p className="text-gray-800 whitespace-pre-line">{profile?.bio || <span className="text-gray-400 text-sm">ยังไม่ได้ระบุ</span>}</p>
                }
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">บทบาท</label>
                <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ backgroundColor: '#493584' }}>ผู้หางาน</span>
              </div>
            </div>
          </div>
        )}

        {/* ===== Resume Tab ===== */}
        {activeTab === 'resume' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-2">Resume ของคุณ</h2>
            <p className="text-sm text-gray-500 mb-6">อัปโหลด Resume ในรูปแบบ PDF ขนาดไม่เกิน 5MB</p>

            {/* Current resume */}
            {profile?.resumeFileName && (
              <div className="mb-5 flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-700">Resume ปัจจุบัน</p>
                  <p className="text-xs text-green-500 truncate">{profile.resumeFileName}</p>
                </div>
                {profile.resumeUrl && (
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
                    ดู
                  </a>
                )}
              </div>
            )}

            {/* Upload area */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-[#493584] transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
              {isUploadingResume ? (
                <div>
                  <svg className="w-10 h-10 mx-auto mb-3 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-gray-500 text-sm">กำลังอัปโหลด...</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-700 mb-1">
                    {profile?.resumeFileName ? 'คลิกเพื่ออัปโหลด Resume ใหม่' : 'คลิกเพื่อเลือกไฟล์'}
                  </p>
                  <p className="text-sm text-gray-400">PDF เท่านั้น ขนาดไม่เกิน 5MB</p>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm font-medium text-blue-700 mb-1">คำแนะนำ</p>
              <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                <li>ใช้รูปแบบ PDF เพื่อความเข้ากันได้สูงสุด</li>
                <li>ตรวจสอบให้ Resume มีข้อมูลล่าสุดก่อนอัปโหลด</li>
                <li>Resume จะถูกแนบอัตโนมัติเมื่อสมัครงาน</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-gray-400 py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center text-sm"><p>© 2025 JobPortal. สงวนลิขสิทธิ์</p></div>
      </footer>
    </main>
  );
}
