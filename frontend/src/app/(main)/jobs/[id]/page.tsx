'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  MapPin, Briefcase, Building2, Clock, Wifi, ArrowLeft,
  Calendar, Eye, Tag, CheckCircle, X
} from 'lucide-react';

// ===== Types =====
interface JobDetail {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote: boolean;
  jobType: string;
  description: string;
  requirements?: string;
  benefits?: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  category: string;
  tags: string[];
  status: string;
  deadline?: string;
  createdAt: string;
  viewCount: number;
}

interface RelatedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salaryMin: number | null;
  salaryMax: number | null;
}

// ===== Constants =====
const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'เต็มเวลา',
  PART_TIME: 'พาร์ทไทม์',
  CONTRACT: 'สัญญาจ้าง',
  INTERNSHIP: 'ฝึกงาน',
  FREELANCE: 'ฟรีแลนซ์',
};

const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME: '#493584',
  PART_TIME: '#f15a22',
  CONTRACT: '#0ea5e9',
  INTERNSHIP: '#10b981',
  FREELANCE: '#f59e0b',
};

// ===== Helpers =====
function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return 'ตามตกลง';
  const fmt = (n: number) => n.toLocaleString('th-TH');
  if (min && max) return `฿${fmt(min)} - ฿${fmt(max)} / เดือน`;
  if (min) return `฿${fmt(min)}+ / เดือน`;
  if (max) return `ถึง ฿${fmt(max)} / เดือน`;
  return 'ตามตกลง';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'วันนี้';
  if (days === 1) return 'เมื่อวาน';
  if (days < 7) return `${days} วันที่แล้ว`;
  if (days < 30) return `${Math.floor(days / 7)} สัปดาห์ที่แล้ว`;
  return `${Math.floor(days / 30)} เดือนที่แล้ว`;
}

// ===== Apply Modal =====
interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
}

function ApplyModal({ jobId, jobTitle, onClose }: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      if (resume) formData.append('resume', resume);

      await api.post(`/applications/jobs/${jobId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'เกิดข้อผิดพลาด กรุณาลองใหม่';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {success ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#10b981' }} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">สมัครงานสำเร็จ!</h3>
            <p className="text-gray-500 mb-6">
              ส่งใบสมัครตำแหน่ง &quot;{jobTitle}&quot; เรียบร้อยแล้ว
            </p>
            <button
              onClick={onClose}
              className="text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-all"
              style={{ backgroundColor: '#f15a22' }}
            >
              ปิด
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">สมัครงาน</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <p className="text-sm text-gray-500 mb-1">ตำแหน่งที่สมัคร</p>
                <p className="font-semibold text-gray-800">{jobTitle}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  แนบ Resume (PDF) <span className="text-gray-400 font-normal">- ไม่เกิน 5MB</span>
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResume(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:text-white file:cursor-pointer hover:file:opacity-90"
                  style={{ '--file-bg': '#493584' } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  จดหมายสมัครงาน <span className="text-gray-400 font-normal">- ไม่บังคับ</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  placeholder="แนะนำตัวเองและเหตุผลที่สนใจตำแหน่งนี้..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none resize-none focus:border-[#493584] focus:ring-2 focus:ring-[#493584]/10 placeholder:text-gray-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-full font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full font-semibold text-sm text-white hover:opacity-90 transition-all disabled:opacity-60"
                  style={{ backgroundColor: '#f15a22' }}
                >
                  {isSubmitting ? 'กำลังส่ง...' : 'ส่งใบสมัคร'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ===== Main Page =====
export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<RelatedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get<JobDetail>(`/jobs/${jobId}`);
        setJob(data);

        // Fetch related jobs
        const { data: related } = await api.get<{ content: RelatedJob[] }>(
          `/jobs?category=${encodeURIComponent(data.category)}&size=4`
        );
        setRelatedJobs(related.content.filter((j) => j.id !== jobId).slice(0, 3));
      } catch {
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleApplyClick = () => {
    if (!user) {
      router.push(`/login?redirect=/jobs/${jobId}`);
      return;
    }
    if (user.role !== 'JOBSEEKER') {
      alert('เฉพาะผู้หางานเท่านั้นที่สมัครงานได้');
      return;
    }
    setShowApplyModal(true);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4" />
          <div className="h-6 bg-gray-100 rounded-lg w-1/4 mb-8" />
          <div className="bg-white rounded-2xl p-6 space-y-3">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-4/6" />
          </div>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบตำแหน่งงานนี้</h2>
          <p className="text-gray-500 mb-6">อาจถูกลบหรือปิดรับสมัครแล้ว</p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all"
            style={{ backgroundColor: '#f15a22' }}
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปค้นหางาน
          </Link>
        </div>
      </main>
    );
  }

  const typeColor = JOB_TYPE_COLORS[job.jobType] || '#493584';
  const typeLabel = JOB_TYPE_LABELS[job.jobType] || job.jobType;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {showApplyModal && (
        <ApplyModal
          jobId={job.id}
          jobTitle={job.title}
          onClose={() => setShowApplyModal(false)}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Job header card */}
            <div className="reveal bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start gap-4 mb-5">
                {/* Company logo placeholder */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                  style={{ backgroundColor: '#493584' }}
                >
                  {job.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 leading-tight">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{job.company}</span>
                  </div>
                </div>
                <span
                  className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                  style={{ backgroundColor: typeColor }}
                >
                  {typeLabel}
                </span>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {job.location}
                </span>
                {job.remote && (
                  <span className="flex items-center gap-1.5 text-green-600 font-medium">
                    <Wifi className="w-4 h-4" />
                    Remote ได้
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {timeAgo(job.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {job.viewCount} ครั้ง
                </span>
                {job.deadline && (
                  <span className="flex items-center gap-1.5 text-red-500">
                    <Calendar className="w-4 h-4" />
                    ปิดรับ {formatDate(job.deadline)}
                  </span>
                )}
              </div>

              {/* Tags */}
              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ backgroundColor: '#493584' + '15', color: '#493584' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Apply button */}
              <button
                onClick={handleApplyClick}
                className="w-full py-3.5 rounded-full font-semibold text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: '#f15a22' }}
              >
                สมัครงานตำแหน่งนี้
              </button>
            </div>

            {/* Description */}
            <div className="reveal bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">รายละเอียดงาน</h2>
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="reveal bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4">คุณสมบัติที่ต้องการ</h2>
                <div className="space-y-2">
                  {job.requirements.split('\n').filter(Boolean).map((req, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: '#493584' }}
                      />
                      <span>{req.replace(/^[-•*]\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="reveal bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4">สวัสดิการ</h2>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {job.benefits}
                </div>
              </div>
            )}

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="reveal bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4">งานที่คล้ายกัน</h2>
                <div className="space-y-3">
                  {relatedJobs.map((rj) => (
                    <Link
                      key={rj.id}
                      href={`/jobs/${rj.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{rj.title}</p>
                        <p className="text-gray-500 text-xs truncate">{rj.company} · {rj.location}</p>
                      </div>
                      <span
                        className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ml-3"
                        style={{
                          backgroundColor: (JOB_TYPE_COLORS[rj.jobType] || '#493584') + '20',
                          color: JOB_TYPE_COLORS[rj.jobType] || '#493584',
                        }}
                      >
                        {JOB_TYPE_LABELS[rj.jobType] || rj.jobType}
                      </span>
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/jobs?category=${encodeURIComponent(job.category)}`}
                  className="block text-center text-sm font-medium mt-4 hover:opacity-80 transition-all"
                  style={{ color: '#f15a22' }}
                >
                  ดูงานหมวด {job.category} ทั้งหมด →
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0 space-y-5">
            {/* Company info */}
            <div className="reveal-right bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">ข้อมูลบริษัท</h3>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: '#493584' }}
                >
                  {job.company.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{job.company}</p>
                  <p className="text-gray-400 text-xs">{job.category}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{job.location}</span>
                </div>
                {job.remote && (
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">รองรับการทำงาน Remote</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick summary */}
            <div className="reveal-right bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">ข้อมูลงาน</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ประเภทงาน</span>
                  <span
                    className="font-semibold px-2 py-0.5 rounded-full text-xs text-white"
                    style={{ backgroundColor: typeColor }}
                  >
                    {typeLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">เงินเดือน</span>
                  <span className="font-medium text-gray-800 text-xs text-right">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">หมวดหมู่</span>
                  <span className="font-medium text-gray-800">{job.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ลงประกาศ</span>
                  <span className="font-medium text-gray-800">{formatDate(job.createdAt)}</span>
                </div>
                {job.deadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">ปิดรับ</span>
                    <span className="font-medium text-red-500">{formatDate(job.deadline)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags sidebar */}
            {job.tags && job.tags.length > 0 && (
              <div className="reveal-right bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <h3 className="font-bold text-gray-900">ทักษะที่ต้องการ</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Apply CTA */}
            <div
              className="reveal-right rounded-2xl p-5 text-white"
              style={{ background: 'linear-gradient(135deg, #493584, #2f3592)' }}
            >
              <p className="font-bold mb-1">พร้อมสมัครงานแล้วหรือยัง?</p>
              <p className="text-white/70 text-xs mb-4">
                อย่าพลาดโอกาสดีๆ สมัครได้เลยตอนนี้
              </p>
              <button
                onClick={handleApplyClick}
                className="w-full py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-all"
                style={{ backgroundColor: '#f15a22' }}
              >
                สมัครงานเลย
              </button>
              {!user && (
                <p className="text-center text-white/60 text-xs mt-2">
                  ต้องเข้าสู่ระบบก่อนสมัครงาน
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
