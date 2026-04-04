'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Briefcase, Users, Plus, Eye, Clock, CheckCircle,
  XCircle, AlertCircle, MapPin, Trash2, ChevronRight,
} from 'lucide-react';

// ===== Types (matches backend DTO) =====
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  status: string;
  createdAt: string;
  applicationCount?: number;
}

interface ApplicationDto {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  status: 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'HIRED';
  createdAt: string;
}

interface PageResponse<T> { content: T[]; totalElements: number; }

// ===== Constants =====
const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'เต็มเวลา',
  PART_TIME: 'พาร์ทไทม์',
  CONTRACT: 'สัญญาจ้าง',
  INTERNSHIP: 'ฝึกงาน',
  FREELANCE: 'ฟรีแลนซ์',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: { label: 'รอพิจารณา', color: '#f59e0b', bg: '#fef3c7', icon: <Clock className="w-3.5 h-3.5" /> },
  REVIEWING: { label: 'กำลังพิจารณา', color: '#3b82f6', bg: '#dbeafe', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  ACCEPTED: { label: 'ผ่านการคัดเลือก', color: '#10b981', bg: '#d1fae5', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  REJECTED: { label: 'ไม่ผ่าน', color: '#ef4444', bg: '#fee2e2', icon: <XCircle className="w-3.5 h-3.5" /> },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ===== Create Job Modal =====
interface CreateJobModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateJobModal({ onClose, onSuccess }: CreateJobModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    location: '',
    jobType: 'FULL_TIME',
    remote: false,
    salaryMin: '',
    salaryMax: '',
    category: 'เทคโนโลยี',
    description: '',
    requirements: '',
    benefits: '',
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/jobs', {
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'เกิดข้อผิดพลาด';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm outline-none transition focus:border-[#493584] focus:ring-2 focus:ring-[#493584]/10 placeholder:text-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-bold text-gray-900 text-lg">ประกาศตำแหน่งงานใหม่</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อตำแหน่ง *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="เช่น Software Engineer, Marketing Manager" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">จังหวัด *</label>
              <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="เช่น กรุงเทพมหานคร" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภทงาน</label>
              <select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} className={inputClass}>
                {Object.entries(JOB_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">หมวดหมู่</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                {['เทคโนโลยี','การตลาด','ดีไซน์','การเงิน','สาธารณสุข','การศึกษา','วิศวกรรม','ค้าปลีก','ทรัพยากรบุคคล','บัญชี','กฎหมาย','โลจิสติกส์'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="remote" checked={form.remote} onChange={(e) => setForm({ ...form, remote: e.target.checked })} className="w-4 h-4 accent-[#493584]" />
              <label htmlFor="remote" className="text-sm text-gray-700 font-medium">รองรับ Remote</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เงินเดือนต่ำสุด (บาท)</label>
              <input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} placeholder="เช่น 30000" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เงินเดือนสูงสุด (บาท)</label>
              <input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} placeholder="เช่น 60000" className={inputClass} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียดงาน *</label>
              <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="อธิบายลักษณะงาน หน้าที่ความรับผิดชอบ..." className={`${inputClass} resize-none`} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">คุณสมบัติที่ต้องการ</label>
              <textarea rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="แต่ละข้อขึ้นบรรทัดใหม่..." className={`${inputClass} resize-none`} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ทักษะที่ต้องการ (คั่นด้วย ,)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="เช่น React, TypeScript, Node.js" className={inputClass} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">สวัสดิการ</label>
              <textarea rows={2} value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} placeholder="ประกันสุขภาพ, โบนัส, ทำงานที่บ้านได้..." className={`${inputClass} resize-none`} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-full font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
              ยกเลิก
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-full font-semibold text-sm text-white hover:opacity-90 transition-all disabled:opacity-60" style={{ backgroundColor: '#f15a22' }}>
              {isSubmitting ? 'กำลังสร้าง...' : 'ประกาศงาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== Main Page =====
export default function EmployerDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<ApplicationDto[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/dashboard/employer');
      return;
    }
    if (user.role !== 'EMPLOYER') {
      router.push(user.role === 'JOBSEEKER' ? '/dashboard' : '/');
      return;
    }
    fetchMyJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMyJobs = async (): Promise<void> => {
    setIsLoadingJobs(true);
    try {
      const { data } = await api.get<PageResponse<Job>>('/jobs/my');
      setJobs(data.content || []);
    } catch {
      setJobs([]);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const fetchApplicationsForJob = async (jobId: string): Promise<void> => {
    try {
      const { data } = await api.get<PageResponse<ApplicationDto>>(`/applications/jobs/${jobId}`);
      setRecentApplications(data.content || []);
    } catch {
      setRecentApplications([]);
    }
  };

  const handleDeleteJob = async (jobId: string): Promise<void> => {
    if (!confirm('ต้องการลบตำแหน่งงานนี้?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch {
      alert('ไม่สามารถลบได้');
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, status: string): Promise<void> => {
    try {
      await api.patch(`/applications/${appId}/status`, { status });
      setRecentApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: status as ApplicationDto['status'] } : a))
      );
    } catch {
      alert('เกิดข้อผิดพลาด');
    }
  };

  if (!user) return null;

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j) => j.status === 'ACTIVE').length,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {showCreateModal && (
        <CreateJobModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchMyJobs();
          }}
        />
      )}

      {/* Header */}
      <div
        className="text-white py-8 px-4"
        style={{ background: 'linear-gradient(135deg, #493584 0%, #2f3592 50%, #1a237e 100%)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
                style={{ backgroundColor: '#f15a22' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold">สวัสดี, {user.name} 👋</h1>
                <p className="text-white/70 text-sm">{user.companyName || user.email}</p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-all flex-shrink-0"
              style={{ backgroundColor: '#f15a22' }}
            >
              <Plus className="w-4 h-4" />
              ประกาศงานใหม่
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
            {[
              { label: 'ตำแหน่งทั้งหมด', value: stats.totalJobs, icon: <Briefcase className="w-5 h-5" /> },
              { label: 'กำลังเปิดรับ', value: stats.activeJobs, icon: <Eye className="w-5 h-5" /> },
              { label: 'ใบสมัครล่าสุด', value: recentApplications.length, icon: <Users className="w-5 h-5" /> },
            ].map((stat) => (
              <div key={stat.label} className="reveal-scale bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                  {stat.icon}
                  {stat.label}
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-6 w-fit">
          {[
            { key: 'jobs', label: 'ตำแหน่งงานของฉัน', icon: <Briefcase className="w-4 h-4" /> },
            { key: 'applications', label: 'ใบสมัครที่ได้รับ', icon: <Users className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                activeTab === tab.key
                  ? { backgroundColor: '#493584', color: 'white' }
                  : { color: '#6b7280' }
              }
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div>
            {isLoadingJobs ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">ยังไม่มีตำแหน่งงาน</h3>
                <p className="text-gray-400 text-sm mb-6">เริ่มประกาศตำแหน่งงานแรกของคุณได้เลย</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all text-sm"
                  style={{ backgroundColor: '#f15a22' }}
                >
                  <Plus className="w-4 h-4" />
                  ประกาศงานใหม่
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="reveal bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="font-semibold text-gray-900 hover:underline text-base block truncate"
                        >
                          {job.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location}
                          </span>
                          <span>{JOB_TYPE_LABELS[job.jobType] || job.jobType}</span>
                          <span>ลงประกาศ {formatDate(job.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => { setActiveTab('applications'); fetchApplicationsForJob(job.id); }}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                          style={{ backgroundColor: '#493584' + '15', color: '#493584' }}
                        >
                          <Users className="w-3.5 h-3.5" />
                          ใบสมัคร
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            {jobs.length > 0 && recentApplications.length === 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700 font-medium mb-2">เลือกตำแหน่งงานเพื่อดูใบสมัคร</p>
                <div className="flex flex-wrap gap-2">
                  {jobs.slice(0, 5).map((job) => (
                    <button
                      key={job.id}
                      onClick={() => fetchApplicationsForJob(job.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                      style={{ backgroundColor: '#493584', color: 'white' }}
                    >
                      {job.title}
                      <ChevronRight className="w-3 h-3 inline ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recentApplications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">ยังไม่มีใบสมัคร</h3>
                <p className="text-gray-400 text-sm">เลือกตำแหน่งงานจากแท็บ &quot;ตำแหน่งงานของฉัน&quot;</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => {
                  const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
                  return (
                    <div
                      key={app.id}
                      className="reveal bg-white rounded-2xl border border-gray-100 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-base">{app.applicantName}</p>
                          <p className="text-gray-500 text-sm">{app.applicantEmail}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            สมัครตำแหน่ง: {app.jobTitle} · {formatDate(app.createdAt)}
                          </p>
                        </div>

                        <span
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
                          style={{ backgroundColor: status.bg, color: status.color }}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </div>

                      {/* Actions */}
                      {app.status === 'PENDING' && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.id, 'REVIEWING')}
                            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                            style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}
                          >
                            กำลังพิจารณา
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.id, 'ACCEPTED')}
                            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                            style={{ backgroundColor: '#d1fae5', color: '#10b981' }}
                          >
                            รับเข้าทำงาน
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.id, 'REJECTED')}
                            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                            style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}
                          >
                            ไม่ผ่าน
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
