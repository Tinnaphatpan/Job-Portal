'use client';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, Briefcase, Users, Building2, Star } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';

const CATEGORIES = [
  { icon: '💻', label: 'เทคโนโลยี', count: 234 },
  { icon: '📊', label: 'การตลาด', count: 156 },
  { icon: '🎨', label: 'ดีไซน์', count: 98 },
  { icon: '💰', label: 'การเงิน', count: 187 },
  { icon: '🏥', label: 'สาธารณสุข', count: 143 },
  { icon: '📚', label: 'การศึกษา', count: 89 },
  { icon: '🏗️', label: 'วิศวกรรม', count: 212 },
  { icon: '🛒', label: 'ค้าปลีก', count: 175 },
];

const STATS = [
  { icon: <Briefcase className="w-6 h-6" />, value: '10,000+', label: 'ตำแหน่งงาน' },
  { icon: <Users className="w-6 h-6" />, value: '50,000+', label: 'ผู้ใช้งาน' },
  { icon: <Building2 className="w-6 h-6" />, value: '5,000+', label: 'บริษัทชั้นนำ' },
  { icon: <Star className="w-6 h-6" />, value: '95%', label: 'ความพึงพอใจ' },
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('location', location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section
        className="text-white py-24 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #493584 0%, #2f3592 50%, #1a237e 100%)' }}
      >
        {/* BG decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10 bg-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5 bg-white" />
        </div>

        {/* Background character image */}
        <div className="absolute right-0 bottom-0 h-full pointer-events-none hidden lg:flex items-end justify-end">
          <img
            src="/bg-jobs.png"
            alt=""
            className="h-[90%] max-h-[500px] object-contain object-bottom opacity-20 animate-float"
            style={{ filter: 'brightness(1.4) saturate(0)' }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6 border border-white/20 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            มีตำแหน่งงานใหม่กว่า 500 ตำแหน่งวันนี้
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold mb-4 leading-tight opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            หางานที่<span style={{ color: '#f15a22' }}>ใช่</span>สำหรับคุณ
          </h1>
          <p
            className="text-white/70 text-lg mb-10 max-w-2xl mx-auto opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.35s' }}
          >
            แพลตฟอร์มหางานชั้นนำ เชื่อมต่อผู้หางานกับบริษัทชั้นนำกว่า 5,000 แห่ง
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl max-w-3xl mx-auto opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ตำแหน่งงาน, ทักษะ, หรือบริษัท"
                className="flex-1 outline-none text-gray-900 text-sm py-2"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 px-3 border-t md:border-t-0 md:border-l border-gray-100">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="จังหวัด หรือ Remote"
                className="flex-1 outline-none text-gray-900 text-sm py-2"
              />
            </div>
            <button
              type="submit"
              className="text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex-shrink-0"
              style={{ backgroundColor: '#f15a22' }}
            >
              ค้นหางาน
            </button>
          </form>

          {/* Popular tags */}
          <div
            className="flex flex-wrap justify-center gap-2 mt-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.65s' }}
          >
            <span className="text-white/50 text-sm">ยอดนิยม:</span>
            {[
              { label: 'Developer', href: '/jobs?q=developer' },
              { label: 'Marketing', href: '/jobs?category=%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94' },
              { label: 'Remote', href: '/jobs?remote=true' },
              { label: 'Part-time', href: '/jobs?jobType=PART_TIME' },
              { label: 'Finance', href: '/jobs?category=%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%80%E0%B8%87%E0%B8%B4%E0%B8%99' },
            ].map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                className="text-white/80 text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all border border-white/20"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center flex flex-col items-center gap-2 reveal"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform hover:scale-110 hover:shadow-md" style={{ backgroundColor: '#493584' + '15', color: '#493584' }}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 reveal">
            <h2 className="text-3xl font-bold text-gray-900">สำรวจตามหมวดหมู่</h2>
            <p className="text-gray-500 mt-2">เลือกสายงานที่คุณสนใจ</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.label}
                href={`/jobs?category=${encodeURIComponent(cat.label)}`}
                className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 border border-gray-100 group reveal-scale"
                style={{ transitionDelay: `${i * 0.07}s` }}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <p className="font-semibold text-gray-900">{cat.label}</p>
                <p className="text-sm text-gray-400">{cat.count} ตำแหน่ง</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 font-semibold hover:opacity-80 transition-all"
              style={{ color: '#f15a22' }}
            >
              ดูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA for Employers */}
      <section
        className="py-16 px-4 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f15a22 0%, #e04010 100%)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 bg-white" />
        </div>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="reveal-left">
            <h2 className="text-3xl font-bold mb-2">คุณเป็นนายจ้าง?</h2>
            <p className="text-white/80">โพสต์ตำแหน่งงานและค้นหาผู้สมัครที่ใช่ได้ทันที ฟรี!</p>
          </div>
          <Link
            href="/register?role=EMPLOYER"
            className="bg-white font-semibold px-8 py-4 rounded-full hover:bg-gray-50 transition-colors flex items-center gap-2 flex-shrink-0 reveal-right"
            style={{ color: '#f15a22' }}
          >
            โพสต์งานฟรี <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
