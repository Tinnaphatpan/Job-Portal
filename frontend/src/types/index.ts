export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
export type JobStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'EXPIRED';
export type ApplicationStatus = 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote: boolean;
  jobType: JobType;
  description?: string;
  requirements?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  category?: string;
  tags?: string[];
  status: JobStatus;
  deadline?: string;
  viewCount: number;
  createdAt: string;
  applicationCount?: number;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  resumeUrl?: string;
  resumeFileName?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  timeline: TimelineEntry[];
  createdAt: string;
}

export interface TimelineEntry {
  status: ApplicationStatus;
  message: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: 'งานประจำ',
  PART_TIME: 'งานพาร์ทไทม์',
  CONTRACT: 'สัญญาจ้าง',
  INTERNSHIP: 'ฝึกงาน',
  FREELANCE: 'ฟรีแลนซ์',
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: 'รอพิจารณา',
  REVIEWING: 'กำลังพิจารณา',
  SHORTLISTED: 'ผ่านการคัดกรอง',
  REJECTED: 'ไม่ผ่านการพิจารณา',
  HIRED: 'ได้รับการคัดเลือก',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  REVIEWING: 'bg-blue-100 text-blue-600',
  SHORTLISTED: 'bg-yellow-100 text-yellow-600',
  REJECTED: 'bg-red-100 text-red-600',
  HIRED: 'bg-green-100 text-green-600',
};
