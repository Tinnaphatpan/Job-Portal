'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Search, MapPin, Briefcase, Clock, Building2, ChevronLeft, ChevronRight, Wifi, X } from 'lucide-react';

// ===== Types =====
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  salaryMin: number | null;
  salaryMax: number | null;
  category: string;
  tags: string[];
  createdAt: string;
}

interface JobsPage {
  content: Job[];
  totalPages: number;
  totalElements: number;
  number: number;
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

const CATEGORIES = [
  'เทคโนโลยี', 'การตลาด', 'ดีไซน์', 'การเงิน', 'สาธารณสุข',
  'การศึกษา', 'วิศวกรรม', 'ค้าปลีก', 'ทรัพยากรบุคคล', 'กฎหมาย', 'บัญชี', 'โลจิสติกส์',
];

const THAI_PROVINCES = [
  'กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี',
  'ฉะเชิงเทรา','ชลบุรี','ชัยนาท','ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด',
  'ตาก','นครนายก','นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี',
  'นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี',
  'พระนครศรีอยุธยา','พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์',
  'แพร่','ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน','ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง',
  'ระยอง','ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร','สงขลา','สตูล',
  'สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี','สุโขทัย',
  'สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','หนองคาย','หนองบัวลำภู','อ่างทอง','อำนาจเจริญ',
  'อุดรธานี','อุตรดิตถ์','อุทัยธานี','อุบลราชธานี',
];

// ===== Helpers =====
function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return 'ตามตกลง';
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : `${n}`;
  if (min && max) return `฿${fmt(min)} - ฿${fmt(max)}`;
  if (min) return `฿${fmt(min)}+`;
  if (max) return `ถึง ฿${fmt(max)}`;
  return 'ตามตกลง';
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

// ===== JobCard =====
function JobCard({ job }: { job: Job }) {
  const typeColor = JOB_TYPE_COLORS[job.jobType] || '#493584';
  const typeLabel = JOB_TYPE_LABELS[job.jobType] || job.jobType;
  return (
    <Link href={`/jobs/${job.id}`} className="reveal block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">{job.title}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{job.company}</span>
          </div>
        </div>
        <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: typeColor }}>
          {typeLabel}
        </span>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
        {job.remote && <span className="flex items-center gap-1 text-green-600 font-medium"><Wifi className="w-3.5 h-3.5" />Remote</span>}
        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{formatSalary(job.salaryMin, job.salaryMax)}</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(job.createdAt)}</span>
      </div>
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{tag}</span>
          ))}
          {job.tags.length > 4 && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">+{job.tags.length - 4}</span>}
        </div>
      )}
    </Link>
  );
}

// ===== Main Page =====
function JobsContent() {
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [remoteOnly, setRemoteOnly] = useState(searchParams.get('remote') === 'true');
  const [page, setPage] = useState(0);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (category) params.set('category', category);
      if (location) params.set('location', location);
      if (jobType) params.set('jobType', jobType);
      if (remoteOnly) params.set('remote', 'true');
      params.set('page', String(page));
      params.set('size', '12');
      const { data } = await api.get<JobsPage>(`/jobs?${params.toString()}`);
      setJobs(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      toast.error('โหลดตำแหน่งงานไม่สำเร็จ กรุณาลองใหม่');
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, category, location, jobType, remoteOnly, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  const clearAll = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setJobType('');
    setRemoteOnly(false);
    setPage(0);
  };

  const hasFilter = category || location || jobType || remoteOnly;

  const selectClass = "h-9 pl-3 pr-8 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#493584] bg-white appearance-none cursor-pointer hover:border-gray-300 transition-colors";

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header — search only */}
      <div className="text-white py-8 px-4" style={{ background: 'linear-gradient(135deg, #493584 0%, #2f3592 50%, #1a237e 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 flex gap-2 shadow-lg">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ตำแหน่งงาน, ทักษะ, หรือบริษัท"
                className="flex-1 outline-none text-gray-900 text-sm py-2 placeholder:text-gray-400"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit" className="text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all text-sm flex-shrink-0" style={{ backgroundColor: '#f15a22' }}>
              ค้นหา
            </button>
          </form>
        </div>
      </div>

      {/* Filter bar — horizontal dropdowns */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-2">

          {/* จังหวัด */}
          <div className="relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <select value={location} onChange={(e) => { setLocation(e.target.value); setPage(0); }}
              className={`${selectClass} pl-8`}>
              <option value="">ทุกจังหวัด</option>
              {THAI_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* หมวดหมู่ */}
          <div className="relative">
            <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }}
              className={`${selectClass} pl-8`}>
              <option value="">ทุกหมวดหมู่</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* ประเภทงาน */}
          <select value={jobType} onChange={(e) => { setJobType(e.target.value); setPage(0); }}
            className={selectClass}>
            <option value="">ทุกประเภทงาน</option>
            <option value="FULL_TIME">เต็มเวลา</option>
            <option value="PART_TIME">พาร์ทไทม์</option>
            <option value="CONTRACT">สัญญาจ้าง</option>
            <option value="INTERNSHIP">ฝึกงาน</option>
            <option value="FREELANCE">ฟรีแลนซ์</option>
          </select>

          {/* Remote */}
          <button
            onClick={() => { setRemoteOnly(!remoteOnly); setPage(0); }}
            className="h-9 px-4 rounded-xl text-sm font-medium transition-all border"
            style={remoteOnly
              ? { backgroundColor: '#493584', color: 'white', borderColor: '#493584' }
              : { backgroundColor: 'white', color: '#6b7280', borderColor: '#e5e7eb' }}
          >
            <Wifi className="w-3.5 h-3.5 inline mr-1.5" />
            Remote
          </button>

          {/* ล้างตัวกรอง */}
          {hasFilter && (
            <button onClick={clearAll} className="h-9 px-3 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1">
              <X className="w-3.5 h-3.5" />ล้างทั้งหมด
            </button>
          )}

          {/* จำนวนผลลัพธ์ */}
          <span className="reveal ml-auto text-sm text-gray-400">
            พบ <span className="font-semibold text-gray-700">{totalElements}</span> ตำแหน่ง
          </span>
        </div>
      </div>

      {/* Job List */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded-lg mb-2 w-3/4" />
                <div className="h-4 bg-gray-100 rounded-lg mb-4 w-1/2" />
                <div className="h-3 bg-gray-100 rounded-lg mb-1 w-full" />
                <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบตำแหน่งงาน</h3>
            <p className="text-gray-400 text-sm mb-6">ลองเปลี่ยนคำค้นหาหรือปรับตัวกรอง</p>
            <button onClick={clearAll} className="text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-all" style={{ backgroundColor: '#f15a22' }}>
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum = i;
                  if (totalPages > 7) {
                    if (page < 4) pageNum = i;
                    else if (page > totalPages - 4) pageNum = totalPages - 7 + i;
                    else pageNum = page - 3 + i;
                  }
                  return (
                    <button key={pageNum} onClick={() => setPage(pageNum)}
                      className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
                      style={page === pageNum ? { backgroundColor: '#493584', color: 'white' } : { color: '#374151', border: '1px solid #e5e7eb' }}>
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">กำลังโหลด...</div></div>}>
      <JobsContent />
    </Suspense>
  );
}
