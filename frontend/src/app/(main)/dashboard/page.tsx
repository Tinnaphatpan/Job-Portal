'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import {
  Briefcase, User, Upload, FileText, Clock, CheckCircle, XCircle,
  AlertCircle, ChevronRight, Edit3, Save, X, Plus, Trash2,
  GraduationCap, Award, Languages, Settings, Eye, Shield,
  Building2, MapPin, Calendar, ChevronDown,
} from 'lucide-react';

// ===== Types =====
interface ApplicationDto {
  id: string; jobId: string; jobTitle: string; company: string;
  status: 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'HIRED';
  createdAt: string;
}
interface PageResponse<T> { content: T[]; totalElements: number; }
interface UserProfile {
  id: string; name: string; email: string; phone?: string; avatar?: string;
  headline?: string; bio?: string; resumeUrl?: string; resumeFileName?: string;
  role: string; gender?: string; birthDate?: string; nationality?: string;
  religion?: string; militaryStatus?: string; weight?: number; height?: number;
}
interface WorkExp { id: string; company: string; position: string; startDate?: string; endDate?: string; isCurrent: boolean; description?: string; }
interface Education { id: string; institution: string; degree?: string; field?: string; startYear?: number; endYear?: number; gpa?: number; }
interface Certificate { id: string; name: string; issuer?: string; issueDate?: string; expireDate?: string; }
interface Language { id: string; language: string; level: string; }

// ===== Constants =====
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING:     { label: 'รอพิจารณา',         color: '#f59e0b', bg: '#fef3c7', icon: <Clock className="w-4 h-4" /> },
  REVIEWING:   { label: 'กำลังพิจารณา',      color: '#3b82f6', bg: '#dbeafe', icon: <AlertCircle className="w-4 h-4" /> },
  SHORTLISTED: { label: 'ผ่านการคัดกรอง',    color: '#8b5cf6', bg: '#ede9fe', icon: <CheckCircle className="w-4 h-4" /> },
  ACCEPTED:    { label: 'ผ่านการคัดเลือก',   color: '#10b981', bg: '#d1fae5', icon: <CheckCircle className="w-4 h-4" /> },
  HIRED:       { label: 'ได้รับการคัดเลือก', color: '#10b981', bg: '#d1fae5', icon: <CheckCircle className="w-4 h-4" /> },
  REJECTED:    { label: 'ไม่ผ่านการคัดเลือก',color: '#ef4444', bg: '#fee2e2', icon: <XCircle className="w-4 h-4" /> },
};

const MILITARY_OPTIONS = [
  { value: 'EXEMPTED', label: 'ได้รับการยกเว้น/จบหลักสูตร รด.' },
  { value: 'SERVED', label: 'ผ่านการเกณฑ์ทหารแล้ว' },
  { value: 'NOT_YET', label: 'ยังไม่ได้เกณฑ์ทหาร' },
  { value: 'EXEMPTED_BY_CERT', label: 'ได้รับการยกเว้น (ใบรับรอง)' },
];

const LANGUAGE_LEVELS = [
  { value: 'BASIC', label: 'พื้นฐาน', color: '#94a3b8' },
  { value: 'INTERMEDIATE', label: 'ปานกลาง', color: '#f59e0b' },
  { value: 'ADVANCED', label: 'ดี', color: '#3b82f6' },
  { value: 'NATIVE', label: 'เจ้าของภาษา', color: '#10b981' },
];

const DEGREE_OPTIONS = ['มัธยมศึกษา', 'ปวช.', 'ปวส.', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}
function formatYear(year?: number) { return year ? `${year + 543}` : '-'; }
function formatMonthYear(dateStr?: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short' });
}

// ===== Avatar =====
function Avatar({ src, name, size = 56 }: { src?: string | null; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover border-2 border-white/20" style={{ width: size, height: size }} />;
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 border-2 border-white/20"
      style={{ width: size, height: size, background: 'linear-gradient(135deg,#f15a22,#ff8c4b)', fontSize: size * 0.38 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ===== Completion Score =====
function calcCompletion(profile: UserProfile | null, works: WorkExp[], educations: Education[], certs: Certificate[], langs: Language[]): number {
  if (!profile) return 0;
  let score = 0;
  if (profile.name) score += 10;
  if (profile.phone) score += 10;
  if (profile.headline) score += 10;
  if (profile.bio) score += 10;
  if (profile.gender) score += 5;
  if (profile.birthDate) score += 5;
  if (profile.nationality) score += 5;
  if (profile.resumeFileName) score += 15;
  if (works.length > 0) score += 10;
  if (educations.length > 0) score += 10;
  if (certs.length > 0) score += 5;
  if (langs.length > 0) score += 5;
  return Math.min(score, 100);
}

function CircleProgress({ value }: { value: number }) {
  const r = 40; const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 80 ? '#10b981' : value >= 50 ? '#f59e0b' : '#f15a22';
  return (
    <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className="font-bold text-xl" style={{ color }}>{value}%</div>
      </div>
    </div>
  );
}

// ===== Shared Input style =====
const inp = "w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none transition focus:border-[#493584] focus:ring-2 focus:ring-[#493584]/10 placeholder:text-gray-400";

// ===== Main =====
export default function DashboardPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  type Sidebar = 'applications' | 'edit-profile' | 'work' | 'education' | 'certificates' | 'languages' | 'resume' | 'account';
  const [sidebar, setSidebar] = useState<Sidebar>('edit-profile');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [works, setWorks] = useState<WorkExp[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [langs, setLangs] = useState<Language[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  // Profile edit
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', phone: '', headline: '', bio: '', gender: '', birthDate: '',
    nationality: 'ไทย', religion: 'พุทธ', militaryStatus: '', weight: '', height: '',
  });

  // Modal state for sub-resources
  const [workModal, setWorkModal] = useState<{ open: boolean; editing?: WorkExp }>({ open: false });
  const [eduModal, setEduModal] = useState<{ open: boolean; editing?: Education }>({ open: false });
  const [certModal, setCertModal] = useState<{ open: boolean; editing?: Certificate }>({ open: false });
  const [langModal, setLangModal] = useState<{ open: boolean; editing?: Language }>({ open: false });

  const [workForm, setWorkForm] = useState({ company: '', position: '', startDate: '', endDate: '', isCurrent: false, description: '' });
  const [eduForm, setEduForm] = useState({ institution: '', degree: 'ปริญญาตรี', field: '', startYear: '', endYear: '', gpa: '' });
  const [certForm, setCertForm] = useState({ name: '', issuer: '', issueDate: '', expireDate: '' });
  const [langForm, setLangForm] = useState({ language: '', level: 'INTERMEDIATE' });

  useEffect(() => {
    if (!user) { router.push('/login?redirect=/dashboard'); return; }
    if (user.role !== 'JOBSEEKER') { router.push(user.role === 'EMPLOYER' ? '/dashboard/employer' : '/'); return; }
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchAll() {
    try {
      const [pRes, wRes, eRes, cRes, lRes] = await Promise.all([
        api.get<UserProfile>('/users/me'),
        api.get<WorkExp[]>('/users/me/work-experiences'),
        api.get<Education[]>('/users/me/educations'),
        api.get<Certificate[]>('/users/me/certificates'),
        api.get<Language[]>('/users/me/languages'),
      ]);
      setProfile(pRes.data);
      setEditForm({
        name: pRes.data.name || '', phone: pRes.data.phone || '', headline: pRes.data.headline || '',
        bio: pRes.data.bio || '', gender: pRes.data.gender || '', birthDate: pRes.data.birthDate || '',
        nationality: pRes.data.nationality || 'ไทย', religion: pRes.data.religion || 'พุทธ',
        militaryStatus: pRes.data.militaryStatus || '', weight: pRes.data.weight?.toString() || '',
        height: pRes.data.height?.toString() || '',
      });
      setWorks(wRes.data || []);
      setEducations(eRes.data || []);
      setCerts(cRes.data || []);
      setLangs(lRes.data || []);
    } catch {}
  }

  async function fetchApplications() {
    setIsLoadingApps(true);
    try {
      const { data } = await api.get<PageResponse<ApplicationDto>>('/applications/my');
      setApplications(data.content || []);
    } catch { setApplications([]); } finally { setIsLoadingApps(false); }
  }

  async function handleSaveProfile() {
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: editForm.name, phone: editForm.phone, headline: editForm.headline,
        bio: editForm.bio, nationality: editForm.nationality, religion: editForm.religion,
      };
      if (editForm.gender) payload.gender = editForm.gender;
      if (editForm.birthDate) payload.birthDate = editForm.birthDate;
      if (editForm.militaryStatus) payload.militaryStatus = editForm.militaryStatus;
      if (editForm.weight) payload.weight = parseInt(editForm.weight);
      if (editForm.height) payload.height = parseInt(editForm.height);
      const { data } = await api.put<UserProfile>('/users/me', payload);
      setProfile(data);
      updateUser({ name: data.name });
      toast.success('บันทึกข้อมูลสำเร็จ');
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    finally { setIsSaving(false); }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('กรุณาเลือกไฟล์รูปภาพ'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('ขนาดรูปต้องไม่เกิน 2MB'); return; }
    setIsUploadingAvatar(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const { data } = await api.post<UserProfile>('/users/me/avatar', fd, { headers: { 'Content-Type': undefined } });
      setProfile(data); updateUser({ avatar: data.avatar }); toast.success('อัปโหลดรูปสำเร็จ');
    } catch { toast.error('อัปโหลดรูปไม่สำเร็จ'); } finally { setIsUploadingAvatar(false); }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('PDF เท่านั้น'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('ไม่เกิน 5MB'); return; }
    setIsUploadingResume(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const { data } = await api.post<UserProfile>('/users/me/resume', fd, { headers: { 'Content-Type': undefined } });
      setProfile(data); toast.success('อัปโหลด Resume สำเร็จ');
    } catch { toast.error('อัปโหลดไม่สำเร็จ'); } finally { setIsUploadingResume(false); }
  }

  // Work CRUD
  async function saveWork() {
    try {
      const payload = { ...workForm, startDate: workForm.startDate || null, endDate: workForm.isCurrent ? null : (workForm.endDate || null) };
      if (workModal.editing) { const { data } = await api.put<WorkExp>(`/users/me/work-experiences/${workModal.editing.id}`, payload); setWorks(w => w.map(x => x.id === data.id ? data : x)); }
      else { const { data } = await api.post<WorkExp>('/users/me/work-experiences', payload); setWorks(w => [data, ...w]); }
      setWorkModal({ open: false }); toast.success('บันทึกสำเร็จ');
    } catch { toast.error('เกิดข้อผิดพลาด'); }
  }
  async function deleteWork(id: string) {
    await api.delete(`/users/me/work-experiences/${id}`); setWorks(w => w.filter(x => x.id !== id)); toast.success('ลบสำเร็จ');
  }

  // Education CRUD
  async function saveEdu() {
    try {
      const payload = { institution: eduForm.institution, degree: eduForm.degree, field: eduForm.field, startYear: eduForm.startYear ? parseInt(eduForm.startYear) : null, endYear: eduForm.endYear ? parseInt(eduForm.endYear) : null, gpa: eduForm.gpa ? parseFloat(eduForm.gpa) : null };
      if (eduModal.editing) { const { data } = await api.put<Education>(`/users/me/educations/${eduModal.editing.id}`, payload); setEducations(e => e.map(x => x.id === data.id ? data : x)); }
      else { const { data } = await api.post<Education>('/users/me/educations', payload); setEducations(e => [data, ...e]); }
      setEduModal({ open: false }); toast.success('บันทึกสำเร็จ');
    } catch { toast.error('เกิดข้อผิดพลาด'); }
  }
  async function deleteEdu(id: string) {
    await api.delete(`/users/me/educations/${id}`); setEducations(e => e.filter(x => x.id !== id)); toast.success('ลบสำเร็จ');
  }

  // Cert CRUD
  async function saveCert() {
    try {
      const payload = { name: certForm.name, issuer: certForm.issuer, issueDate: certForm.issueDate || null, expireDate: certForm.expireDate || null };
      if (certModal.editing) { const { data } = await api.put<Certificate>(`/users/me/certificates/${certModal.editing.id}`, payload); setCerts(c => c.map(x => x.id === data.id ? data : x)); }
      else { const { data } = await api.post<Certificate>('/users/me/certificates', payload); setCerts(c => [data, ...c]); }
      setCertModal({ open: false }); toast.success('บันทึกสำเร็จ');
    } catch { toast.error('เกิดข้อผิดพลาด'); }
  }
  async function deleteCert(id: string) {
    await api.delete(`/users/me/certificates/${id}`); setCerts(c => c.filter(x => x.id !== id)); toast.success('ลบสำเร็จ');
  }

  // Lang CRUD
  async function saveLang() {
    try {
      const payload = { language: langForm.language, level: langForm.level };
      if (langModal.editing) { const { data } = await api.put<Language>(`/users/me/languages/${langModal.editing.id}`, payload); setLangs(l => l.map(x => x.id === data.id ? data : x)); }
      else { const { data } = await api.post<Language>('/users/me/languages', payload); setLangs(l => [...l, data]); }
      setLangModal({ open: false }); toast.success('บันทึกสำเร็จ');
    } catch { toast.error('เกิดข้อผิดพลาด'); }
  }
  async function deleteLang(id: string) {
    await api.delete(`/users/me/languages/${id}`); setLangs(l => l.filter(x => x.id !== id)); toast.success('ลบสำเร็จ');
  }

  if (!user) return null;
  const completion = calcCompletion(profile, works, educations, certs, langs);

  const navItems: { key: Sidebar; icon: React.ReactNode; label: string; section?: string }[] = [
    { key: 'applications', icon: <Briefcase className="w-4 h-4" />, label: 'ใบสมัครของฉัน' },
    { key: 'edit-profile', icon: <User className="w-4 h-4" />, label: 'แก้ไขประวัติ', section: 'ประวัติ' },
    { key: 'work', icon: <Building2 className="w-4 h-4" />, label: 'ประวัติการทำงาน' },
    { key: 'education', icon: <GraduationCap className="w-4 h-4" />, label: 'ประวัติการศึกษา' },
    { key: 'certificates', icon: <Award className="w-4 h-4" />, label: 'ใบประกาศ / ทักษะ' },
    { key: 'languages', icon: <Languages className="w-4 h-4" />, label: 'ความสามารถทางภาษา' },
    { key: 'resume', icon: <FileText className="w-4 h-4" />, label: 'Resume / CV', section: 'เอกสาร' },
    { key: 'account', icon: <Settings className="w-4 h-4" />, label: 'ตั้งค่าบัญชี', section: 'บัญชี' },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Profile Header Banner */}
      <div className="text-white pt-20 pb-6 px-4" style={{ background: 'linear-gradient(135deg, #493584 0%, #2f3592 50%, #1a237e 100%)' }}>
        <div className="max-w-6xl mx-auto flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <Avatar src={profile?.avatar} name={user.name} size={72} />
            <button onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
              {isUploadingAvatar
                ? <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                : <Edit3 className="w-3.5 h-3.5 text-gray-600" />}
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{profile?.name || user.name}</h1>
            <p className="text-white/70 text-sm">{user.email}</p>
            {profile?.headline && <p className="text-white/60 text-xs mt-0.5">{profile.headline}</p>}
          </div>
          <div className="flex-shrink-0 hidden md:block">
            <CircleProgress value={completion} />
            <p className="text-white/60 text-xs text-center mt-1">ความสมบูรณ์</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">

        {/* ===== Sidebar ===== */}
        <aside className="w-60 flex-shrink-0 hidden md:block">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-20">
            {/* Completion (mobile) */}
            <div className="p-4 border-b border-gray-50 md:hidden flex items-center gap-3">
              <CircleProgress value={completion} />
            </div>
            <nav className="p-2">
              {navItems.map((item, i) => {
                const showSection = item.section && (i === 0 || navItems[i - 1].section !== item.section);
                return (
                  <div key={item.key}>
                    {showSection && (
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 pt-3 pb-1">{item.section}</p>
                    )}
                    <button onClick={() => { setSidebar(item.key); if (item.key === 'applications') fetchApplications(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                      style={sidebar === item.key
                        ? { background: 'linear-gradient(135deg,#f15a2215,#49358415)', color: '#493584' }
                        : { color: '#6b7280' }}>
                      <span style={sidebar === item.key ? { color: '#f15a22' } : {}}>{item.icon}</span>
                      {item.label}
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ===== Content ===== */}
        <div className="flex-1 min-w-0">

          {/* Mobile nav tabs */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4">
            {navItems.map(item => (
              <button key={item.key} onClick={() => { setSidebar(item.key); if (item.key === 'applications') fetchApplications(); }}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all"
                style={sidebar === item.key ? { backgroundColor: '#493584', color: 'white' } : { backgroundColor: 'white', color: '#6b7280', border: '1px solid #e5e7eb' }}>
                {item.icon}{item.label}
              </button>
            ))}
          </div>

          {/* ===== Applications ===== */}
          {sidebar === 'applications' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">ใบสมัครของฉัน</h2>
              {isLoadingApps ? (
                <div className="space-y-3">{[1,2,3].map(i=>(
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"/><div className="h-4 bg-gray-100 rounded w-1/3"/>
                  </div>
                ))}</div>
              ) : applications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">ยังไม่มีใบสมัคร</h3>
                  <p className="text-gray-400 text-sm mb-6">เริ่มค้นหางานที่ใช่สำหรับคุณได้เลย</p>
                  <Link href="/jobs" className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full font-semibold text-sm" style={{ backgroundColor: '#f15a22' }}>
                    ค้นหางาน <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map(app => {
                    const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
                    return (
                      <div key={app.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <Link href={`/jobs/${app.jobId}`} className="font-semibold text-gray-900 hover:underline block truncate">{app.jobTitle}</Link>
                            <p className="text-sm text-gray-500 mt-0.5">{app.company}</p>
                          </div>
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0" style={{ backgroundColor: status.bg, color: status.color }}>
                            {status.icon}{status.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                          <span className="text-xs text-gray-400">สมัครเมื่อ {formatDate(app.createdAt)}</span>
                          <Link href={`/jobs/${app.jobId}`} className="text-xs font-medium hover:underline" style={{ color: '#493584' }}>ดูตำแหน่ง →</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== Edit Profile ===== */}
          {sidebar === 'edit-profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">ข้อมูลส่วนบุคคล</h2>
                  <p className="text-sm text-gray-500 mt-0.5">กรอกข้อมูลให้ครบเพื่อเพิ่มโอกาสได้รับการติดต่อ</p>
                </div>
                <button onClick={handleSaveProfile} disabled={isSaving}
                  className="flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
                  style={{ backgroundColor: '#f15a22' }}>
                  {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  บันทึก
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                  <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className={inp} placeholder="ชื่อ นามสกุล" />
                </div>
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">เบอร์โทรศัพท์</label>
                  <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g,'').slice(0,10) })} className={inp} placeholder="0812345678" />
                </div>
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">เพศ <span className="text-red-500">*</span></label>
                  <div className="flex gap-3">
                    {[{v:'MALE',l:'ชาย'},{v:'FEMALE',l:'หญิง'}].map(g=>(
                      <button key={g.v} onClick={() => setEditForm({...editForm, gender: g.v})}
                        className="flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
                        style={editForm.gender===g.v ? {borderColor:'#493584',background:'#49358415',color:'#493584'} : {borderColor:'#e5e7eb',color:'#9ca3af'}}>
                        {g.l}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Birth Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">วันเกิด</label>
                  <input type="date" value={editForm.birthDate} onChange={e => setEditForm({...editForm, birthDate: e.target.value})} className={inp} />
                </div>
                {/* Nationality */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">สัญชาติ</label>
                  <input value={editForm.nationality} onChange={e => setEditForm({...editForm, nationality: e.target.value})} className={inp} placeholder="ไทย" />
                </div>
                {/* Religion */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">ศาสนา</label>
                  <input value={editForm.religion} onChange={e => setEditForm({...editForm, religion: e.target.value})} className={inp} placeholder="พุทธ" />
                </div>
                {/* Military */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">สถานภาพทางการทหาร</label>
                  <div className="relative">
                    <select value={editForm.militaryStatus} onChange={e => setEditForm({...editForm, militaryStatus: e.target.value})} className={`${inp} appearance-none pr-8`}>
                      <option value="">-- เลือก --</option>
                      {MILITARY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                {/* Weight / Height */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">น้ำหนัก (กก.)</label>
                    <input type="number" value={editForm.weight} onChange={e => setEditForm({...editForm, weight: e.target.value})} className={inp} placeholder="70" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">ส่วนสูง (ซม.)</label>
                    <input type="number" value={editForm.height} onChange={e => setEditForm({...editForm, height: e.target.value})} className={inp} placeholder="170" />
                  </div>
                </div>
                {/* Headline */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">ตำแหน่ง / สาขาที่สนใจ</label>
                  <input value={editForm.headline} onChange={e => setEditForm({...editForm, headline: e.target.value})} className={inp} placeholder="เช่น Full-Stack Developer" />
                </div>
                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">แนะนำตัว</label>
                  <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows={4} className={`${inp} resize-none`} placeholder="แนะนำตัวสั้นๆ..." />
                </div>
              </div>
            </div>
          )}

          {/* ===== Work Experience ===== */}
          {sidebar === 'work' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">ประวัติการทำงาน / ฝึกงาน</h2>
                <button onClick={() => { setWorkForm({company:'',position:'',startDate:'',endDate:'',isCurrent:false,description:''}); setWorkModal({open:true}); }}
                  className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl" style={{backgroundColor:'#f15a22'}}>
                  <Plus className="w-4 h-4" /> เพิ่ม
                </button>
              </div>
              {works.length === 0 ? (
                <EmptyState icon={<Building2 className="w-10 h-10 text-gray-300"/>} title="ยังไม่มีประวัติการทำงาน" desc="เพิ่มประวัติการทำงานเพื่อให้นายจ้างรู้จักคุณมากขึ้น" />
              ) : (
                <div className="space-y-3">
                  {works.map(w => (
                    <div key={w.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'#49358415'}}>
                            <Building2 className="w-5 h-5" style={{color:'#493584'}}/>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{w.position}</p>
                            <p className="text-sm text-gray-600">{w.company}</p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatMonthYear(w.startDate)} — {w.isCurrent ? <span className="text-green-500 font-medium">ปัจจุบัน</span> : formatMonthYear(w.endDate)}
                            </p>
                            {w.description && <p className="text-sm text-gray-500 mt-2 leading-relaxed">{w.description}</p>}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => { setWorkForm({company:w.company,position:w.position,startDate:w.startDate?.slice(0,10)||'',endDate:w.endDate?.slice(0,10)||'',isCurrent:w.isCurrent,description:w.description||''}); setWorkModal({open:true,editing:w}); }} className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600"><Edit3 className="w-4 h-4"/></button>
                          <button onClick={() => deleteWork(w.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== Education ===== */}
          {sidebar === 'education' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">ประวัติการศึกษา</h2>
                <button onClick={() => { setEduForm({institution:'',degree:'ปริญญาตรี',field:'',startYear:'',endYear:'',gpa:''}); setEduModal({open:true}); }}
                  className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl" style={{backgroundColor:'#f15a22'}}>
                  <Plus className="w-4 h-4" /> เพิ่ม
                </button>
              </div>
              {educations.length === 0 ? (
                <EmptyState icon={<GraduationCap className="w-10 h-10 text-gray-300"/>} title="ยังไม่มีประวัติการศึกษา" desc="เพิ่มวุฒิการศึกษาของคุณ" />
              ) : (
                <div className="space-y-3">
                  {educations.map(e => (
                    <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'#3b82f615'}}>
                            <GraduationCap className="w-5 h-5 text-blue-500"/>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{e.institution}</p>
                            <p className="text-sm text-gray-600">{[e.degree, e.field].filter(Boolean).join(' — ')}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatYear(e.startYear)} — {formatYear(e.endYear)}{e.gpa ? ` · GPA ${e.gpa}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => { setEduForm({institution:e.institution,degree:e.degree||'ปริญญาตรี',field:e.field||'',startYear:e.startYear?.toString()||'',endYear:e.endYear?.toString()||'',gpa:e.gpa?.toString()||''}); setEduModal({open:true,editing:e}); }} className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600"><Edit3 className="w-4 h-4"/></button>
                          <button onClick={() => deleteEdu(e.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== Certificates ===== */}
          {sidebar === 'certificates' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">อบรม / ประกาศนียบัตร</h2>
                <button onClick={() => { setCertForm({name:'',issuer:'',issueDate:'',expireDate:''}); setCertModal({open:true}); }}
                  className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl" style={{backgroundColor:'#f15a22'}}>
                  <Plus className="w-4 h-4" /> เพิ่ม
                </button>
              </div>
              {certs.length === 0 ? (
                <EmptyState icon={<Award className="w-10 h-10 text-gray-300"/>} title="ยังไม่มีใบประกาศ" desc="เพิ่มใบรับรองและประกาศนียบัตรของคุณ" />
              ) : (
                <div className="space-y-3">
                  {certs.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'#f59e0b15'}}>
                            <Award className="w-5 h-5 text-yellow-500"/>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{c.name}</p>
                            {c.issuer && <p className="text-sm text-gray-600">{c.issuer}</p>}
                            <p className="text-xs text-gray-400 mt-1">{c.issueDate ? formatMonthYear(c.issueDate) : ''}{c.expireDate ? ` — หมดอายุ ${formatMonthYear(c.expireDate)}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => { setCertForm({name:c.name,issuer:c.issuer||'',issueDate:c.issueDate?.slice(0,10)||'',expireDate:c.expireDate?.slice(0,10)||''}); setCertModal({open:true,editing:c}); }} className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600"><Edit3 className="w-4 h-4"/></button>
                          <button onClick={() => deleteCert(c.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== Languages ===== */}
          {sidebar === 'languages' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">ความสามารถทางภาษา</h2>
                <button onClick={() => { setLangForm({language:'',level:'INTERMEDIATE'}); setLangModal({open:true}); }}
                  className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl" style={{backgroundColor:'#f15a22'}}>
                  <Plus className="w-4 h-4" /> เพิ่ม
                </button>
              </div>
              {langs.length === 0 ? (
                <EmptyState icon={<Languages className="w-10 h-10 text-gray-300"/>} title="ยังไม่มีข้อมูลภาษา" desc="เพิ่มความสามารถทางภาษาของคุณ" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {langs.map(l => {
                    const lvl = LANGUAGE_LEVELS.find(x => x.value === l.level) || LANGUAGE_LEVELS[1];
                    return (
                      <div key={l.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${lvl.color}20`}}>
                            <Languages className="w-4 h-4" style={{color:lvl.color}}/>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{l.language}</p>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{background:`${lvl.color}20`,color:lvl.color}}>{lvl.label}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setLangForm({language:l.language,level:l.level}); setLangModal({open:true,editing:l}); }} className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600"><Edit3 className="w-4 h-4"/></button>
                          <button onClick={() => deleteLang(l.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== Resume ===== */}
          {sidebar === 'resume' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Resume / CV</h2>
              <p className="text-sm text-gray-500 mb-6">อัปโหลดไฟล์ PDF ขนาดไม่เกิน 5MB</p>
              {profile?.resumeFileName && (
                <div className="mb-5 flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100">
                  <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-700">Resume ปัจจุบัน</p>
                    <p className="text-xs text-green-500 truncate">{profile.resumeFileName}</p>
                  </div>
                  {profile.resumeUrl && (
                    <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg" style={{background:'#d1fae5',color:'#10b981'}}>
                      <Eye className="w-3 h-3" /> ดู
                    </a>
                  )}
                </div>
              )}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-[#493584] transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                {isUploadingResume ? (
                  <div><div className="w-10 h-10 border-4 border-gray-200 border-t-[#493584] rounded-full animate-spin mx-auto mb-3"/><p className="text-gray-500 text-sm">กำลังอัปโหลด...</p></div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="font-semibold text-gray-700 mb-1">{profile?.resumeFileName ? 'คลิกเพื่ออัปโหลดใหม่' : 'คลิกเพื่อเลือกไฟล์'}</p>
                    <p className="text-sm text-gray-400">PDF เท่านั้น ไม่เกิน 5MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== Account ===== */}
          {sidebar === 'account' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">ตั้งค่าบัญชี</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-sm font-medium text-gray-600 mb-0.5">อีเมล</p>
                  <p className="font-semibold text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">ไม่สามารถเปลี่ยนอีเมลได้ในขณะนี้</p>
                </div>
                <Link href="/change-password"
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#493584] hover:bg-[#49358408] transition-all">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-800 text-sm">เปลี่ยนรหัสผ่าน</p>
                      <p className="text-xs text-gray-400">อัปเดตรหัสผ่านเพื่อความปลอดภัย</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Modals ===== */}
      {workModal.open && (
        <Modal title={workModal.editing ? 'แก้ไขประวัติการทำงาน' : 'เพิ่มประวัติการทำงาน'} onClose={() => setWorkModal({open:false})} onSave={saveWork}>
          <div className="grid grid-cols-1 gap-4">
            <div><label className="label">บริษัท / องค์กร *</label><input className={inp} value={workForm.company} onChange={e=>setWorkForm({...workForm,company:e.target.value})} placeholder="ชื่อบริษัท" /></div>
            <div><label className="label">ตำแหน่ง *</label><input className={inp} value={workForm.position} onChange={e=>setWorkForm({...workForm,position:e.target.value})} placeholder="ตำแหน่งงาน" /></div>
            <div className="flex gap-3">
              <div className="flex-1"><label className="label">เริ่ม</label><input type="date" className={inp} value={workForm.startDate} onChange={e=>setWorkForm({...workForm,startDate:e.target.value})} /></div>
              {!workForm.isCurrent && <div className="flex-1"><label className="label">สิ้นสุด</label><input type="date" className={inp} value={workForm.endDate} onChange={e=>setWorkForm({...workForm,endDate:e.target.value})} /></div>}
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={workForm.isCurrent} onChange={e=>setWorkForm({...workForm,isCurrent:e.target.checked})} className="w-4 h-4 accent-[#493584]" />
              <span className="text-gray-700">ทำงานที่นี่อยู่ในปัจจุบัน</span>
            </label>
            <div><label className="label">รายละเอียด</label><textarea className={`${inp} resize-none`} rows={3} value={workForm.description} onChange={e=>setWorkForm({...workForm,description:e.target.value})} placeholder="หน้าที่ความรับผิดชอบ..." /></div>
          </div>
        </Modal>
      )}

      {eduModal.open && (
        <Modal title={eduModal.editing ? 'แก้ไขประวัติการศึกษา' : 'เพิ่มประวัติการศึกษา'} onClose={() => setEduModal({open:false})} onSave={saveEdu}>
          <div className="grid grid-cols-1 gap-4">
            <div><label className="label">สถาบัน *</label><input className={inp} value={eduForm.institution} onChange={e=>setEduForm({...eduForm,institution:e.target.value})} placeholder="ชื่อมหาวิทยาลัย / โรงเรียน" /></div>
            <div>
              <label className="label">ระดับการศึกษา</label>
              <div className="relative">
                <select value={eduForm.degree} onChange={e=>setEduForm({...eduForm,degree:e.target.value})} className={`${inp} appearance-none pr-8`}>
                  {DEGREE_OPTIONS.map(d=><option key={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
              </div>
            </div>
            <div><label className="label">สาขาวิชา</label><input className={inp} value={eduForm.field} onChange={e=>setEduForm({...eduForm,field:e.target.value})} placeholder="วิทยาการคอมพิวเตอร์" /></div>
            <div className="flex gap-3">
              <div className="flex-1"><label className="label">ปีเริ่ม (ค.ศ.)</label><input type="number" className={inp} value={eduForm.startYear} onChange={e=>setEduForm({...eduForm,startYear:e.target.value})} placeholder="2022" /></div>
              <div className="flex-1"><label className="label">ปีจบ (ค.ศ.)</label><input type="number" className={inp} value={eduForm.endYear} onChange={e=>setEduForm({...eduForm,endYear:e.target.value})} placeholder="2026" /></div>
            </div>
            <div><label className="label">เกรดเฉลี่ย (GPA)</label><input type="number" step="0.01" min="0" max="4" className={inp} value={eduForm.gpa} onChange={e=>setEduForm({...eduForm,gpa:e.target.value})} placeholder="3.50" /></div>
          </div>
        </Modal>
      )}

      {certModal.open && (
        <Modal title={certModal.editing ? 'แก้ไขใบประกาศ' : 'เพิ่มใบประกาศ'} onClose={() => setCertModal({open:false})} onSave={saveCert}>
          <div className="grid grid-cols-1 gap-4">
            <div><label className="label">ชื่อประกาศนียบัตร *</label><input className={inp} value={certForm.name} onChange={e=>setCertForm({...certForm,name:e.target.value})} placeholder="AWS Certified Developer" /></div>
            <div><label className="label">ผู้ออกใบรับรอง</label><input className={inp} value={certForm.issuer} onChange={e=>setCertForm({...certForm,issuer:e.target.value})} placeholder="Amazon Web Services" /></div>
            <div className="flex gap-3">
              <div className="flex-1"><label className="label">วันที่ออก</label><input type="date" className={inp} value={certForm.issueDate} onChange={e=>setCertForm({...certForm,issueDate:e.target.value})} /></div>
              <div className="flex-1"><label className="label">วันหมดอายุ</label><input type="date" className={inp} value={certForm.expireDate} onChange={e=>setCertForm({...certForm,expireDate:e.target.value})} /></div>
            </div>
          </div>
        </Modal>
      )}

      {langModal.open && (
        <Modal title={langModal.editing ? 'แก้ไขภาษา' : 'เพิ่มภาษา'} onClose={() => setLangModal({open:false})} onSave={saveLang}>
          <div className="grid grid-cols-1 gap-4">
            <div><label className="label">ภาษา *</label><input className={inp} value={langForm.language} onChange={e=>setLangForm({...langForm,language:e.target.value})} placeholder="ภาษาอังกฤษ, English, Japanese..." /></div>
            <div>
              <label className="label">ระดับความสามารถ</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {LANGUAGE_LEVELS.map(l => (
                  <button key={l.value} onClick={() => setLangForm({...langForm, level: l.value})}
                    className="py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all text-left"
                    style={langForm.level === l.value ? {borderColor:l.color, background:`${l.color}15`, color:l.color} : {borderColor:'#e5e7eb',color:'#9ca3af'}}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      <footer className="bg-gray-900 text-gray-400 py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center text-sm"><p>© 2025 JobPortal. สงวนลิขสิทธิ์</p></div>
      </footer>
    </main>
  );
}

// ===== Helper Components =====
function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="text-center py-14 bg-white rounded-2xl border border-gray-100">
      <div className="flex justify-center mb-3">{icon}</div>
      <h3 className="text-base font-semibold text-gray-600 mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
}

function Modal({ title, onClose, onSave, children }: { title: string; onClose: () => void; onSave: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.4)'}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-5">{children}</div>
        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">ยกเลิก</button>
          <button onClick={onSave} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold" style={{backgroundColor:'#f15a22'}}>บันทึก</button>
        </div>
      </div>
    </div>
  );
}
