package com.jobportal.api.config;

import com.jobportal.api.model.Job;
import com.jobportal.api.model.User;
import com.jobportal.api.repository.JobRepository;
import com.jobportal.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(JobRepository jobRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // สร้าง Admin user ถ้ายังไม่มี
        if (!userRepository.existsByEmail("admin@jobportal.com")) {
            User admin = new User();
            admin.setEmail("admin@jobportal.com");
            admin.setName("Admin");
            admin.setPassword(passwordEncoder.encode("Admin1234567"));
            admin.setRole(User.Role.ADMIN);
            admin.setProvider(User.AuthProvider.LOCAL);
            admin.setEmailVerified(true);
            userRepository.save(admin);
        }

        if (jobRepository.count() > 0) return;

        // --- Seed 3 employer users ---
        User scbUser = createEmployer("scb@jobportal.test", "SCB ธนาคารไทยพาณิชย์", "SCBBank");
        User trueCorp = createEmployer("true@jobportal.test", "True Corporation", "TrueCorp");
        User grab = createEmployer("grab@jobportal.test", "Grab Thailand", "GrabTH");

        userRepository.saveAll(Arrays.asList(scbUser, trueCorp, grab));

        // --- Seed 50+ jobs ---
        List<Job> jobs = Arrays.asList(
            // ===== เทคโนโลยี =====
            buildJob(scbUser, "นักพัฒนาซอฟต์แวร์ Backend (Java)", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 60000, 100000, "เทคโนโลยี",
                Arrays.asList("Java", "Spring Boot", "PostgreSQL", "Microservices"),
                "ร่วมพัฒนาระบบธนาคารดิจิทัล SCB Easy ที่มีผู้ใช้งานกว่า 17 ล้านคน ทำงานในทีม Engineering ขนาดใหญ่ด้วย Java Spring Boot และ Microservices Architecture ในสภาพแวดล้อมที่เน้น Agile",
                "ปริญญาตรีด้านวิทยาการคอมพิวเตอร์หรือสาขาที่เกี่ยวข้อง\nมีประสบการณ์ Java/Spring Boot อย่างน้อย 3 ปี\nเข้าใจ RESTful API, SQL, Git\nหากมีประสบการณ์ Kubernetes/Docker จะพิจารณาเป็นพิเศษ",
                LocalDate.now().plusMonths(2)),

            buildJob(scbUser, "นักพัฒนา Frontend (React/TypeScript)", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", true, Job.JobType.FULL_TIME, 55000, 90000, "เทคโนโลยี",
                Arrays.asList("React", "TypeScript", "Next.js", "Tailwind CSS"),
                "พัฒนา UI/UX สำหรับแอปพลิเคชันธนาคาร SCB Easy และระบบ Internal ด้วย React และ TypeScript ทำงานร่วมกับ Designer และ Product Manager เพื่อสร้างประสบการณ์ผู้ใช้ที่ดีที่สุด",
                "ประสบการณ์ React/TypeScript อย่างน้อย 2 ปี\nเข้าใจ HTML, CSS, JavaScript อย่างดี\nมีความรู้ด้าน Performance Optimization\nรู้จัก Testing (Jest, React Testing Library)",
                LocalDate.now().plusMonths(2)),

            buildJob(trueCorp, "Data Engineer", "True Corporation",
                "กรุงเทพมหานคร", true, Job.JobType.FULL_TIME, 65000, 110000, "เทคโนโลยี",
                Arrays.asList("Python", "Spark", "Kafka", "Airflow", "BigQuery"),
                "ออกแบบและพัฒนา Data Pipeline สำหรับระบบ Big Data ของ True ที่มีข้อมูลหลาย Petabyte ต่อวัน ทำงานร่วมกับทีม Data Science และ Analytics",
                "ประสบการณ์ Data Engineering 3+ ปี\nรู้จัก Python, SQL, Spark\nมีประสบการณ์ Cloud (GCP/AWS/Azure)\nเข้าใจ ETL/ELT Pipeline",
                LocalDate.now().plusMonths(3)),

            buildJob(grab, "Senior iOS Developer", "Grab Thailand",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 80000, 130000, "เทคโนโลยี",
                Arrays.asList("Swift", "SwiftUI", "Xcode", "iOS"),
                "พัฒนาแอป Grab บน iOS ที่มีผู้ใช้งานหลายสิบล้านคนในเอเชียตะวันออกเฉียงใต้ ร่วมกำหนด Architecture และ Best Practice ให้ทีม",
                "ประสบการณ์ iOS Development 5+ ปี\nเชี่ยวชาญ Swift, SwiftUI, UIKit\nเข้าใจ Design Pattern (MVVM, Clean Architecture)\nมีแอปบน App Store จะได้รับการพิจารณาเป็นพิเศษ",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "DevOps Engineer (Kubernetes)", "Grab Thailand",
                "กรุงเทพมหานคร", true, Job.JobType.FULL_TIME, 70000, 120000, "เทคโนโลยี",
                Arrays.asList("Kubernetes", "Docker", "Terraform", "CI/CD", "AWS"),
                "ดูแลโครงสร้างพื้นฐาน Cloud และ Kubernetes Cluster ของ Grab ในระดับ Production ที่ต้องรองรับ Traffic สูงสุดหลายล้าน Request ต่อนาที",
                "ประสบการณ์ DevOps/SRE 4+ ปี\nเชี่ยวชาญ Kubernetes, Docker\nรู้จัก Terraform, Ansible\nมีประสบการณ์ AWS/GCP",
                LocalDate.now().plusMonths(2)),

            buildJob(trueCorp, "Android Developer (Kotlin)", "True Corporation",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 55000, 90000, "เทคโนโลยี",
                Arrays.asList("Kotlin", "Android", "Jetpack Compose", "MVVM"),
                "พัฒนาแอปพลิเคชัน True ID บน Android ให้มีประสิทธิภาพสูงและ User Experience ที่ดีที่สุด ร่วมงานกับทีม Product 50+ คน",
                "ประสบการณ์ Android Development 3+ ปี\nเชี่ยวชาญ Kotlin, Jetpack Compose\nเข้าใจ MVVM, Clean Architecture\nมีความรู้ Unit Testing",
                LocalDate.now().plusMonths(2)),

            buildJob(scbUser, "AI/ML Engineer", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", true, Job.JobType.FULL_TIME, 80000, 140000, "เทคโนโลยี",
                Arrays.asList("Python", "TensorFlow", "PyTorch", "ML", "NLP"),
                "พัฒนาโมเดล AI/ML สำหรับระบบ Fraud Detection, Credit Scoring และ Personalization ในแอป SCB Easy ทำงานกับ Data ขนาดใหญ่จาก Transaction หลายสิบล้านรายการต่อวัน",
                "ปริญญาโทหรือปริญญาเอกด้าน Computer Science, Statistics หรือสาขาที่เกี่ยวข้อง\nประสบการณ์ ML Engineering 3+ ปี\nเชี่ยวชาญ Python, TensorFlow/PyTorch\nมีประสบการณ์ deploy model บน Production",
                LocalDate.now().plusMonths(3)),

            buildJob(grab, "นักพัฒนา Full Stack (Node.js + React)", "Grab Thailand",
                "กรุงเทพมหานคร", true, Job.JobType.CONTRACT, 70000, 100000, "เทคโนโลยี",
                Arrays.asList("Node.js", "React", "TypeScript", "MongoDB", "Redis"),
                "พัฒนาระบบ Internal Tool สำหรับทีม Operations ของ Grab ด้วย Node.js และ React งานสัญญาระยะเวลา 1 ปี พร้อมโอกาสเป็นพนักงานประจำ",
                "ประสบการณ์ Full Stack Development 3+ ปี\nเชี่ยวชาญ Node.js, React, TypeScript\nรู้จัก MongoDB, Redis\nทำงานเป็นทีมได้ดี",
                LocalDate.now().plusMonths(1)),

            buildJob(trueCorp, "Cybersecurity Analyst", "True Corporation",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 60000, 100000, "เทคโนโลยี",
                Arrays.asList("SIEM", "SOC", "Penetration Testing", "ISO 27001"),
                "ดูแลความปลอดภัยของระบบ IT ของ True Corporation ตรวจสอบ Threat, ทำ Penetration Testing และรักษามาตรฐาน ISO 27001",
                "ประสบการณ์ Cybersecurity 3+ ปี\nมี Certificate (CISSP, CEH, CompTIA Security+)\nรู้จัก SIEM Tools (Splunk, QRadar)\nเข้าใจ Network Security",
                LocalDate.now().plusMonths(2)),

            // ===== การตลาด =====
            buildJob(trueCorp, "Digital Marketing Manager", "True Corporation",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 55000, 90000, "การตลาด",
                Arrays.asList("Digital Marketing", "SEO", "SEM", "Google Ads", "Analytics"),
                "วางแผนและบริหารแคมเปญ Digital Marketing สำหรับแบรนด์ True ทุกช่องทาง Online ครอบคลุม SEO, SEM, Social Media, Email Marketing และ Influencer Marketing",
                "ประสบการณ์ Digital Marketing 5+ ปี\nเชี่ยวชาญ Google Ads, Facebook Ads\nรู้จัก SEO/SEM อย่างดี\nมีประสบการณ์บริหารทีม",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "Content Marketing Specialist", "Grab Thailand",
                "กรุงเทพมหานคร", true, Job.JobType.FULL_TIME, 35000, 55000, "การตลาด",
                Arrays.asList("Content Marketing", "Copywriting", "Social Media", "SEO"),
                "สร้าง Content ที่น่าสนใจสำหรับ Social Media, Blog และ Website ของ Grab Thailand เพื่อเพิ่ม Brand Awareness และ Engagement",
                "ประสบการณ์ Content Marketing 2+ ปี\nเขียนภาษาไทยได้ดีเยี่ยม\nรู้จัก SEO พื้นฐาน\nมีพอร์ตโฟลิโอผลงาน",
                LocalDate.now().plusMonths(2)),

            buildJob(scbUser, "Brand Marketing Manager", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 60000, 95000, "การตลาด",
                Arrays.asList("Brand Management", "Marketing Strategy", "ATL/BTL", "Research"),
                "บริหารแบรนด์ SCB ให้แข็งแกร่งทั้ง Online และ Offline วางแผนแคมเปญการตลาดประจำปี ดูแลงบประมาณ และวัดผล KPI",
                "ปริญญาตรีด้านการตลาดหรือสาขาที่เกี่ยวข้อง\nประสบการณ์ Brand Management 5+ ปี\nมีประสบการณ์ Financial Services จะพิจารณาเป็นพิเศษ",
                LocalDate.now().plusMonths(3)),

            buildJob(trueCorp, "Social Media Coordinator (Part-time)", "True Corporation",
                "กรุงเทพมหานคร", true, Job.JobType.PART_TIME, 15000, 25000, "การตลาด",
                Arrays.asList("Social Media", "TikTok", "Instagram", "Facebook"),
                "ดูแล Social Media ของ True Corporation บน Facebook, Instagram และ TikTok สร้าง Content วางแผน Content Calendar และตอบ Comment",
                "มีความสนใจด้าน Social Media\nรู้จัก Platform ต่างๆ ดี\nสามารถทำงาน Part-time ได้\nมีไอเดียสร้างสรรค์",
                LocalDate.now().plusMonths(1)),

            // ===== ดีไซน์ =====
            buildJob(grab, "Senior UX/UI Designer", "Grab Thailand",
                "กรุงเทพมหานคร", true, Job.JobType.FULL_TIME, 65000, 110000, "ดีไซน์",
                Arrays.asList("Figma", "UX Research", "Prototyping", "Design System"),
                "ออกแบบ User Experience สำหรับแอป Grab ที่มีผู้ใช้งานหลายสิบล้านคน ทำ User Research, ออกแบบ Prototype และสร้าง Design System",
                "ประสบการณ์ UX/UI Design 5+ ปี\nเชี่ยวชาญ Figma\nมีประสบการณ์ทำ User Research\nมีพอร์ตโฟลิโอที่แข็งแกร่ง",
                LocalDate.now().plusMonths(2)),

            buildJob(trueCorp, "Motion Graphic Designer", "True Corporation",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 40000, 65000, "ดีไซน์",
                Arrays.asList("After Effects", "Premiere Pro", "Illustrator", "Motion Design"),
                "สร้าง Motion Graphic และ Video Content สำหรับแคมเปญโฆษณา True ทั้ง Online และ TV",
                "ประสบการณ์ Motion Design 3+ ปี\nเชี่ยวชาญ After Effects, Premiere Pro\nมีพอร์ตโฟลิโอ Video/Motion",
                LocalDate.now().plusMonths(2)),

            buildJob(scbUser, "Product Designer (Fintech)", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", true, Job.JobType.FULL_TIME, 60000, 100000, "ดีไซน์",
                Arrays.asList("Product Design", "Figma", "User Testing", "Accessibility"),
                "ออกแบบ Product ให้กับ SCB Easy App โดยเน้น User-Centric Design ทำ Usability Testing และวิเคราะห์ Data เพื่อปรับปรุง UX",
                "ประสบการณ์ Product Design 4+ ปี\nเชี่ยวชาญ Figma, Prototyping\nเข้าใจ Accessibility Standards\nมีประสบการณ์ Fintech/Banking จะได้รับการพิจารณาเป็นพิเศษ",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "Graphic Designer (Internship)", "Grab Thailand",
                "กรุงเทพมหานคร", false, Job.JobType.INTERNSHIP, 12000, 18000, "ดีไซน์",
                Arrays.asList("Photoshop", "Illustrator", "Canva", "Design"),
                "โอกาสสำหรับนักศึกษาที่สนใจด้านกราฟิก ฝึกงานกับทีม Design ของ Grab Thailand เรียนรู้การสร้าง Visual Content จริง",
                "กำลังศึกษาปริญญาตรีสาขาออกแบบ นิเทศศิลป์ หรือสาขาที่เกี่ยวข้อง\nรู้จัก Adobe Suite\nมีพอร์ตโฟลิโอผลงาน",
                LocalDate.now().plusMonths(1)),

            // ===== การเงิน =====
            buildJob(scbUser, "Investment Banking Analyst", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 65000, 100000, "การเงิน",
                Arrays.asList("Financial Modeling", "DCF", "M&A", "Excel", "Bloomberg"),
                "ทำงานใน Investment Banking Division วิเคราะห์ Financial Model, ทำ Due Diligence และให้คำแนะนำด้านการควบรวมกิจการและระดมทุน",
                "ปริญญาตรี/โทด้านการเงิน บัญชี เศรษฐศาสตร์\nมีความรู้ด้าน Financial Modeling, DCF\nเชี่ยวชาญ Excel, PowerPoint\nภาษาอังกฤษระดับดีเยี่ยม",
                LocalDate.now().plusMonths(2)),

            buildJob(scbUser, "Risk Management Officer", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 55000, 85000, "การเงิน",
                Arrays.asList("Risk Management", "Basel III", "Credit Risk", "Market Risk"),
                "ดูแลและบริหารความเสี่ยงด้านสินเชื่อ ตลาด และการดำเนินงาน ตามมาตรฐาน Basel III วิเคราะห์และรายงานความเสี่ยงให้ผู้บริหาร",
                "ปริญญาตรีด้านการเงิน สถิติ หรือสาขาที่เกี่ยวข้อง\nประสบการณ์ Risk Management 3+ ปี\nเข้าใจ Basel III, IFRS 9\nมี FRM Certificate จะได้รับการพิจารณาเป็นพิเศษ",
                LocalDate.now().plusMonths(3)),

            buildJob(trueCorp, "Financial Planning Analyst", "True Corporation",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 50000, 80000, "การเงิน",
                Arrays.asList("FP&A", "Financial Forecasting", "Excel", "SAP", "Budgeting"),
                "จัดทำงบประมาณประจำปี วิเคราะห์ผลประกอบการ และทำ Financial Forecasting สำหรับธุรกิจ Telecom ของ True",
                "ปริญญาตรีด้านการเงินหรือบัญชี\nประสบการณ์ FP&A 3+ ปี\nเชี่ยวชาญ Excel, SAP\nวิเคราะห์ข้อมูลเก่ง",
                LocalDate.now().plusMonths(2)),

            buildJob(scbUser, "นักวิเคราะห์สินเชื่อ (Internship)", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", false, Job.JobType.INTERNSHIP, 13000, 16000, "การเงิน",
                Arrays.asList("Credit Analysis", "Financial Statement", "Excel"),
                "ฝึกงานในทีม Credit Analysis เรียนรู้การวิเคราะห์งบการเงิน ประเมินความสามารถในการชำระหนี้ของธุรกิจ",
                "กำลังศึกษาปริญญาตรีด้านการเงิน บัญชี หรือเศรษฐศาสตร์\nมีความสนใจด้าน Banking\nGPA 3.00 ขึ้นไป",
                LocalDate.now().plusMonths(1)),

            // ===== สาธารณสุข =====
            buildJob(scbUser, "แพทย์ประจำ (พนักงาน)", "บริษัท บีดีเอ็มเอส เวลเนส คลินิก จำกัด",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 80000, 150000, "สาธารณสุข",
                Arrays.asList("แพทย์", "เวชกรรม", "ผู้ป่วยนอก"),
                "แพทย์ประจำคลินิกสุขภาพเอกชน ตรวจรักษาผู้ป่วยทั่วไป ให้คำปรึกษาด้านสุขภาพ และดูแลโปรแกรม Health Checkup",
                "ใบอนุญาตประกอบวิชาชีพเวชกรรม\nประสบการณ์ทำงาน 2+ ปี\nทักษะการสื่อสารที่ดี\nมีความสนใจด้าน Preventive Medicine",
                LocalDate.now().plusMonths(2)),

            buildJob(trueCorp, "พยาบาลวิชาชีพ (ICU)", "โรงพยาบาลกรุงเทพ",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 35000, 55000, "สาธารณสุข",
                Arrays.asList("พยาบาล", "ICU", "Critical Care"),
                "พยาบาลประจำ ICU ดูแลผู้ป่วยวิกฤตขั้นสูง ให้การพยาบาลตามมาตรฐานวิชาชีพ",
                "ใบอนุญาตประกอบวิชาชีพพยาบาล\nประสบการณ์ ICU 1+ ปี\nสามารถทำงานเป็นกะได้\nมีความรับผิดชอบสูง",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "เภสัชกร", "เครือโรงพยาบาลพระรามเก้า",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 40000, 65000, "สาธารณสุข",
                Arrays.asList("เภสัชกร", "จ่ายยา", "ให้คำปรึกษา"),
                "เภสัชกรประจำโรงพยาบาล จ่ายยาตามใบสั่งแพทย์ ให้คำปรึกษาการใช้ยา และตรวจสอบความปลอดภัยของยา",
                "ใบอนุญาตประกอบวิชาชีพเภสัชกรรม\nประสบการณ์ 0-3 ปี (รับนักศึกษาจบใหม่)\nมีความละเอียดรอบคอบสูง",
                LocalDate.now().plusMonths(2)),

            buildJob(scbUser, "นักกายภาพบำบัด (Part-time)", "คลินิกกายภาพบำบัด เชียงใหม่",
                "เชียงใหม่", false, Job.JobType.PART_TIME, 25000, 40000, "สาธารณสุข",
                Arrays.asList("กายภาพบำบัด", "Rehabilitation", "Sport Injury"),
                "นักกายภาพบำบัด Part-time ดูแลผู้ป่วยด้านฟื้นฟูสมรรถภาพ บาดเจ็บจากการกีฬา และปัญหากระดูกและกล้ามเนื้อ",
                "ใบอนุญาตประกอบวิชาชีพกายภาพบำบัด\nสามารถทำงาน Part-time ได้\nมีประสบการณ์ Outpatient",
                LocalDate.now().plusMonths(2)),

            // ===== การศึกษา =====
            buildJob(trueCorp, "อาจารย์ภาษาอังกฤษ", "โรงเรียนนานาชาติ NIST",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 50000, 80000, "การศึกษา",
                Arrays.asList("Teaching", "English", "Curriculum", "IB Program"),
                "สอนภาษาอังกฤษในระดับมัธยมศึกษา โรงเรียนนานาชาติ หลักสูตร IB Programme มีนักเรียนจากหลายสัญชาติ",
                "ปริญญาตรีขึ้นไปด้านการศึกษาหรือภาษาอังกฤษ\nใบอนุญาตสอน (Teaching Certificate)\nประสบการณ์สอน 2+ ปี\nภาษาอังกฤษ Native หรือระดับดีเยี่ยม",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "ครูวิทยาศาสตร์", "โรงเรียนสาธิตจุฬาลงกรณ์มหาวิทยาลัย",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 35000, 55000, "การศึกษา",
                Arrays.asList("วิทยาศาสตร์", "ฟิสิกส์", "เคมี", "การสอน"),
                "สอนวิชาวิทยาศาสตร์ระดับมัธยมศึกษา ออกแบบแผนการสอน จัดกิจกรรม Lab และดูแลนักเรียน",
                "ปริญญาตรีด้านวิทยาศาสตร์ศึกษา\nมีใบประกอบวิชาชีพครู\nมีความรักในการสอน",
                LocalDate.now().plusMonths(2)),

            buildJob(scbUser, "นักวิชาการศึกษา (E-Learning)", "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี",
                "กรุงเทพมหานคร", true, Job.JobType.FULL_TIME, 30000, 45000, "การศึกษา",
                Arrays.asList("E-Learning", "LMS", "Instructional Design", "Moodle"),
                "พัฒนาหลักสูตร E-Learning และจัดการระบบ LMS ของมหาวิทยาลัย ออกแบบ Content Online ร่วมกับอาจารย์",
                "ปริญญาตรีด้านเทคโนโลยีการศึกษาหรือสาขาที่เกี่ยวข้อง\nรู้จัก LMS (Moodle, Canvas)\nมีทักษะ Instructional Design",
                LocalDate.now().plusMonths(3)),

            buildJob(trueCorp, "โปรแกรมเมอร์ฝึกงาน (Tech Education)", "True Education",
                "กรุงเทพมหานคร", false, Job.JobType.INTERNSHIP, 12000, 15000, "การศึกษา",
                Arrays.asList("Python", "Web Development", "Education Technology"),
                "ฝึกงานพัฒนาระบบ Learning Management System และ Coding Education Platform สำหรับโรงเรียน",
                "กำลังศึกษาสาขาวิทยาการคอมพิวเตอร์\nรู้จัก Python หรือ JavaScript\nสนใจ EdTech",
                LocalDate.now().plusMonths(1)),

            // ===== วิศวกรรม =====
            buildJob(scbUser, "วิศวกรโยธา (Site Engineer)", "บริษัท อิตาเลียนไทย ดีเวล๊อปเมนต์ จำกัด",
                "ชลบุรี", false, Job.JobType.FULL_TIME, 40000, 65000, "วิศวกรรม",
                Arrays.asList("Civil Engineering", "AutoCAD", "Construction", "Project Management"),
                "วิศวกรโยธาประจำไซต์งาน โครงการก่อสร้างนิคมอุตสาหกรรม ควบคุมงานก่อสร้างให้เป็นไปตามแบบและมาตรฐาน",
                "วิศวกรรมศาสตรบัณฑิต สาขาโยธา\nใบอนุญาตวิศวกร (กว.)\nประสบการณ์ Site Engineer 2+ ปี\nรู้จัก AutoCAD",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "วิศวกรเครื่องกล", "บริษัท ปตท. จำกัด (มหาชน)",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 45000, 80000, "วิศวกรรม",
                Arrays.asList("Mechanical Engineering", "HVAC", "Preventive Maintenance", "AutoCAD"),
                "ดูแลระบบเครื่องจักรกลและอุปกรณ์ในโรงกลั่น วางแผน Maintenance ป้องกันและแก้ไขความขัดข้อง",
                "วิศวกรรมศาสตรบัณฑิต สาขาเครื่องกล\nประสบการณ์ 3+ ปีในอุตสาหกรรม Oil & Gas\nมีใบอนุญาตวิศวกร",
                LocalDate.now().plusMonths(2)),

            buildJob(trueCorp, "วิศวกรไฟฟ้า (Electrical Engineer)", "การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย",
                "นนทบุรี", false, Job.JobType.FULL_TIME, 40000, 70000, "วิศวกรรม",
                Arrays.asList("Electrical Engineering", "Power System", "PLC", "SCADA"),
                "วิศวกรไฟฟ้าประจำสถานีไฟฟ้า ดูแลระบบจำหน่ายไฟฟ้า ซ่อมบำรุงอุปกรณ์ไฟฟ้าและระบบควบคุม",
                "วิศวกรรมศาสตรบัณฑิต สาขาไฟฟ้า\nใบอนุญาตวิศวกร (กว.)\nมีประสบการณ์ระบบไฟฟ้ากำลัง",
                LocalDate.now().plusMonths(3)),

            buildJob(scbUser, "วิศวกรเคมี (Process Engineer)", "บริษัท เอสซีจี เคมิคอลส์",
                "ระยอง", false, Job.JobType.FULL_TIME, 45000, 75000, "วิศวกรรม",
                Arrays.asList("Chemical Engineering", "Process Optimization", "Safety", "Lean"),
                "วิศวกรกระบวนการผลิต ดูแลและปรับปรุงกระบวนการผลิตสารเคมีให้มีประสิทธิภาพและปลอดภัย",
                "วิศวกรรมศาสตรบัณฑิต สาขาเคมี\nประสบการณ์ Process Engineering 2+ ปี\nรู้จัก Lean Manufacturing",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "วิศวกรสิ่งแวดล้อม (Internship)", "บริษัท สยามซีเมนต์กรุ๊ป",
                "กรุงเทพมหานคร", false, Job.JobType.INTERNSHIP, 13000, 16000, "วิศวกรรม",
                Arrays.asList("Environmental Engineering", "ISO 14001", "Sustainability"),
                "ฝึกงานด้านวิศวกรรมสิ่งแวดล้อม เรียนรู้การจัดการสิ่งแวดล้อมในโรงงานอุตสาหกรรม ระบบบำบัดน้ำเสีย และมาตรฐาน ISO 14001",
                "กำลังศึกษาวิศวกรรมศาสตร์ สาขาสิ่งแวดล้อม\nสนใจด้าน Sustainability\nGPA 3.00 ขึ้นไป",
                LocalDate.now().plusMonths(1)),

            // ===== ค้าปลีก =====
            buildJob(trueCorp, "Store Manager (เซ็นทรัล)", "บริษัท เซ็นทรัล รีเทล คอร์ปอเรชั่น",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 45000, 70000, "ค้าปลีก",
                Arrays.asList("Retail Management", "Team Management", "Inventory", "P&L"),
                "บริหาร Store ห้างเซ็นทรัล ดูแลยอดขาย การบริการลูกค้า บริหารทีมพนักงาน และจัดการสต็อกสินค้า",
                "ประสบการณ์ Retail Management 5+ ปี\nมีประสบการณ์บริหารทีม 10+ คน\nเชี่ยวชาญ P&L Management\nทักษะการแก้ปัญหาเฉพาะหน้า",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "พนักงานขาย (Part-time)", "บริษัท เซ็นทรัล รีเทล คอร์ปอเรชั่น",
                "เชียงใหม่", false, Job.JobType.PART_TIME, 12000, 18000, "ค้าปลีก",
                Arrays.asList("Sales", "Customer Service", "Retail"),
                "พนักงานขายในห้างสรรพสินค้า บริการลูกค้า แนะนำสินค้า และจัดการ Cashier",
                "มนุษย์สัมพันธ์ดี\nบุคลิกภาพดี\nสามารถทำงาน Part-time เสาร์-อาทิตย์ได้\nไม่จำเป็นต้องมีประสบการณ์",
                LocalDate.now().plusMonths(1)),

            buildJob(scbUser, "E-Commerce Manager", "บริษัท เซ็นทรัล รีเทล คอร์ปอเรชั่น",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 55000, 90000, "ค้าปลีก",
                Arrays.asList("E-Commerce", "Lazada", "Shopee", "Digital Marketing", "Analytics"),
                "บริหารช่องทาง E-Commerce ของ Central บน Lazada, Shopee และ Website ตัวเอง วางแผนแคมเปญ Online Sales และวิเคราะห์ Data",
                "ประสบการณ์ E-Commerce 4+ ปี\nเข้าใจ Marketplace Platform\nวิเคราะห์ Data ได้\nมีประสบการณ์ Retail",
                LocalDate.now().plusMonths(2)),

            buildJob(trueCorp, "Merchandiser (Contract)", "บริษัท เซ็นทรัล รีเทล คอร์ปอเรชั่น",
                "ขอนแก่น", false, Job.JobType.CONTRACT, 20000, 30000, "ค้าปลีก",
                Arrays.asList("Merchandising", "Visual Display", "Inventory"),
                "จัดวางสินค้าบน Shelf ตามมาตรฐาน ตรวจสอบสต็อก ติดป้ายราคา และรายงานสถานการณ์สินค้า",
                "ประสบการณ์ Merchandising 1+ ปี\nสามารถเดินทางได้\nทำงานสัญญา 6 เดือน มีโอกาสต่อสัญญา",
                LocalDate.now().plusMonths(1)),

            // ===== ทรัพยากรบุคคล =====
            buildJob(scbUser, "HR Business Partner", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 55000, 90000, "ทรัพยากรบุคคล",
                Arrays.asList("HR", "Talent Management", "OD", "Labor Law"),
                "เป็น HR Partner ให้กับ Business Unit ดูแลตั้งแต่ Recruitment, Performance Management, Employee Relations จนถึง Organizational Development",
                "ปริญญาตรีด้าน HR หรือสาขาที่เกี่ยวข้อง\nประสบการณ์ HR 5+ ปี\nรู้กฎหมายแรงงานไทย\nทักษะการสื่อสารที่ดีเยี่ยม",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "Recruiter (Tech Hiring)", "Grab Thailand",
                "กรุงเทพมหานคร", true, Job.JobType.FULL_TIME, 45000, 70000, "ทรัพยากรบุคคล",
                Arrays.asList("Recruitment", "Tech Hiring", "LinkedIn", "Talent Acquisition"),
                "Recruiter ด้าน Tech เฟ้นหาผู้สมัครสาย Software Engineer, Data, Product ให้กับ Grab Thailand ใช้ LinkedIn, Job Board และ Network",
                "ประสบการณ์ Tech Recruitment 3+ ปี\nเข้าใจ Technical Role\nมีเครือข่าย Tech Community\nภาษาอังกฤษดี",
                LocalDate.now().plusMonths(2)),

            buildJob(trueCorp, "Training & Development Specialist", "True Corporation",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 40000, 65000, "ทรัพยากรบุคคล",
                Arrays.asList("L&D", "Training", "E-Learning", "Facilitation"),
                "ออกแบบและดำเนินโปรแกรม Training ให้พนักงาน True กว่า 20,000 คน ครอบคลุม Leadership Development, Technical Training และ Onboarding",
                "ปริญญาตรีด้าน HR, จิตวิทยา หรือสาขาที่เกี่ยวข้อง\nประสบการณ์ Training 3+ ปี\nมีทักษะ Facilitation\nรู้จัก E-Learning Platform",
                LocalDate.now().plusMonths(3)),

            // ===== บัญชี =====
            buildJob(scbUser, "ผู้ตรวจสอบบัญชีภายใน (Internal Auditor)", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 50000, 80000, "บัญชี",
                Arrays.asList("Internal Audit", "COSO", "Risk Based Audit", "SQL", "CPA"),
                "ตรวจสอบการดำเนินงานและการควบคุมภายในของธนาคาร ทำ Risk Assessment และรายงานผลต่อ Audit Committee",
                "ปริญญาตรีด้านบัญชีหรือการเงิน\nมี CPA หรือ CIA Certificate จะได้รับการพิจารณาเป็นพิเศษ\nประสบการณ์ Audit 3+ ปี",
                LocalDate.now().plusMonths(2)),

            buildJob(trueCorp, "นักบัญชี (Accountant)", "True Corporation",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 30000, 50000, "บัญชี",
                Arrays.asList("Accounting", "SAP", "IFRS", "Tax", "Financial Reporting"),
                "จัดทำรายงานทางบัญชีการเงิน ปิดบัญชีประจำเดือน ดูแลภาษี และจัดทำรายงานตามมาตรฐาน IFRS",
                "ปริญญาตรีด้านบัญชี\nรู้จัก SAP\nเข้าใจ IFRS\nประสบการณ์บัญชี 2+ ปี",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "Tax Manager", "Grab Thailand",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 70000, 110000, "บัญชี",
                Arrays.asList("Tax", "Transfer Pricing", "Tax Planning", "CPA"),
                "บริหารงานด้านภาษีของ Grab Thailand ครอบคลุม Corporate Tax, VAT, Withholding Tax และ Transfer Pricing",
                "ปริญญาตรีด้านบัญชีหรือกฎหมาย\nมี CPA\nประสบการณ์ Tax 8+ ปี\nรู้กฎหมายภาษีไทยและ International Tax",
                LocalDate.now().plusMonths(2)),

            // ===== กฎหมาย =====
            buildJob(scbUser, "Corporate Lawyer (In-house)", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 70000, 120000, "กฎหมาย",
                Arrays.asList("Corporate Law", "Banking Law", "Contract", "Regulatory"),
                "ทนายความ In-house ดูแลงานด้านกฎหมายของธนาคาร ร่างและตรวจสอบสัญญา ให้คำปรึกษากฎหมายธุรกิจและกฎหมายธนาคาร",
                "ปริญญาตรีด้านกฎหมาย\nใบอนุญาตทนายความ\nประสบการณ์กฎหมายธุรกิจ/ธนาคาร 5+ ปี\nภาษาอังกฤษดีเยี่ยม",
                LocalDate.now().plusMonths(3)),

            buildJob(trueCorp, "Compliance Officer", "True Corporation",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 60000, 95000, "กฎหมาย",
                Arrays.asList("Compliance", "PDPA", "Regulatory", "Risk Management"),
                "ดูแล Compliance ของ True Corporation ให้เป็นไปตามกฎหมายและกฎระเบียบที่เกี่ยวข้อง โดยเฉพาะ PDPA และ Telecom Regulations",
                "ปริญญาตรีด้านกฎหมายหรือสาขาที่เกี่ยวข้อง\nประสบการณ์ Compliance 4+ ปี\nรู้จัก PDPA\nภาษาอังกฤษดี",
                LocalDate.now().plusMonths(2)),

            // ===== โลจิสติกส์ =====
            buildJob(grab, "Logistics Operations Manager", "Grab Thailand",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 65000, 100000, "โลจิสติกส์",
                Arrays.asList("Logistics", "Supply Chain", "Last Mile", "Operations"),
                "บริหารงาน Logistics ของ GrabExpress ในประเทศไทย ดูแล Last Mile Delivery, Fleet Management และพัฒนาประสิทธิภาพการส่งสินค้า",
                "ประสบการณ์ Logistics/Supply Chain 5+ ปี\nเข้าใจระบบ Last Mile Delivery\nทักษะ Data Analysis\nบริหารทีมได้ดี",
                LocalDate.now().plusMonths(2)),

            buildJob(scbUser, "Supply Chain Analyst", "บริษัท สยามซีเมนต์กรุ๊ป",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 45000, 70000, "โลจิสติกส์",
                Arrays.asList("Supply Chain", "SAP", "Demand Planning", "Excel"),
                "วิเคราะห์และปรับปรุง Supply Chain ของ SCG วางแผนการผลิตและสต็อก ทำ Demand Forecasting",
                "ปริญญาตรีด้านโลจิสติกส์, วิศวกรรม หรือสาขาที่เกี่ยวข้อง\nประสบการณ์ Supply Chain 3+ ปี\nรู้จัก SAP\nวิเคราะห์ Data ได้",
                LocalDate.now().plusMonths(2)),

            buildJob(trueCorp, "Warehouse Supervisor", "บริษัท เจมาร์ท",
                "สมุทรปราการ", false, Job.JobType.FULL_TIME, 30000, 45000, "โลจิสติกส์",
                Arrays.asList("Warehouse", "WMS", "Inventory Management", "Team Management"),
                "ดูแล Warehouse Operations ควบคุมสต็อก บริหารทีมพนักงาน 20+ คน และปรับปรุงประสิทธิภาพการทำงาน",
                "ประสบการณ์ Warehouse 3+ ปี\nมีประสบการณ์บริหารทีม\nรู้จัก WMS\nทำงานเป็นกะได้",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "พนักงานขับรถส่งสินค้า (Contract)", "Grab Thailand",
                "กรุงเทพมหานคร", false, Job.JobType.CONTRACT, 20000, 35000, "โลจิสติกส์",
                Arrays.asList("Delivery", "ขับรถ", "GrabExpress"),
                "ขับรถส่งสินค้าให้กับ GrabExpress ในเขตกรุงเทพฯ ตรงเวลา บริการดี มีรายได้เสริมจากค่า Bonus",
                "มีใบขับขี่รถยนต์\nรู้เส้นทางในกรุงเทพฯ\nมีสมาร์ทโฟน\nบุคลิกดี ตรงต่อเวลา",
                LocalDate.now().plusMonths(1)),

            // === Extra jobs to fill 50+ ===
            buildJob(scbUser, "Product Manager (Fintech)", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", true, Job.JobType.FULL_TIME, 75000, 130000, "เทคโนโลยี",
                Arrays.asList("Product Management", "Agile", "Roadmap", "OKR", "Fintech"),
                "บริหารและพัฒนา Product ของ SCB Easy App กำหนด Roadmap ทำงานร่วมกับ Engineering, Design และ Business",
                "ประสบการณ์ Product Management 5+ ปี\nมีประสบการณ์ Fintech/Banking\nเข้าใจ Agile/Scrum\nวิเคราะห์ Data ได้ดี",
                LocalDate.now().plusMonths(2)),

            buildJob(trueCorp, "Network Engineer (5G)", "True Corporation",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 50000, 85000, "วิศวกรรม",
                Arrays.asList("5G", "Network", "Cisco", "RF Planning", "LTE"),
                "วิศวกรเครือข่ายดูแลและพัฒนาโครงข่าย 5G ของ True ครอบคลุม Radio Planning, Optimization และ Troubleshooting",
                "วิศวกรรมศาสตรบัณฑิต สาขาสื่อสาร\nประสบการณ์ Network 3+ ปี\nรู้จัก 5G/LTE Standards\nมี Cisco Certificate จะได้รับการพิจารณาเป็นพิเศษ",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "Marketing Analytics Manager", "Grab Thailand",
                "กรุงเทพมหานคร", true, Job.JobType.FULL_TIME, 65000, 100000, "การตลาด",
                Arrays.asList("Marketing Analytics", "SQL", "Python", "Tableau", "A/B Testing"),
                "วิเคราะห์ประสิทธิภาพแคมเปญ Marketing ของ Grab ด้วย Data ทำ A/B Testing และให้ Insight แก่ทีม Marketing",
                "ประสบการณ์ Analytics 4+ ปี\nเชี่ยวชาญ SQL, Python\nรู้จัก Tableau/Looker\nเข้าใจ Marketing Metrics",
                LocalDate.now().plusMonths(2)),

            buildJob(scbUser, "IT Security Consultant", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 80000, 130000, "เทคโนโลยี",
                Arrays.asList("IT Security", "OWASP", "Penetration Testing", "CISSP"),
                "ให้คำปรึกษาด้าน IT Security ทำ Security Assessment และ Penetration Testing สำหรับระบบของธนาคาร",
                "ประสบการณ์ IT Security 6+ ปี\nมี CISSP, CEH\nเชี่ยวชาญ Penetration Testing\nรู้จัก Banking Security Standards",
                LocalDate.now().plusMonths(3)),

            buildJob(trueCorp, "Customer Success Manager", "True Corporation",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 50000, 80000, "การตลาด",
                Arrays.asList("Customer Success", "CRM", "Retention", "NPS", "B2B"),
                "ดูแลลูกค้าองค์กร B2B ของ True Corporation สร้างความสัมพันธ์ระยะยาว ลด Churn Rate และเพิ่ม Upsell",
                "ประสบการณ์ Customer Success/Account Management 4+ ปี\nทักษะการสื่อสารและเจรจาต่อรองดี\nรู้จัก CRM Tools",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "Operations Analyst (Internship)", "Grab Thailand",
                "กรุงเทพมหานคร", false, Job.JobType.INTERNSHIP, 13000, 17000, "โลจิสติกส์",
                Arrays.asList("Operations", "Excel", "SQL", "Data Analysis"),
                "ฝึกงานทีม Operations วิเคราะห์ข้อมูลการส่งสินค้า หาโอกาสปรับปรุงประสิทธิภาพ และจัดทำ Dashboard",
                "กำลังศึกษาสาขาวิศวกรรมอุตสาหการ, โลจิสติกส์ หรือสาขาที่เกี่ยวข้อง\nรู้จัก Excel, SQL\nสนใจ Operations",
                LocalDate.now().plusMonths(1)),

            buildJob(scbUser, "UX Researcher", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", true, Job.JobType.FULL_TIME, 55000, 85000, "ดีไซน์",
                Arrays.asList("UX Research", "User Interview", "Usability Testing", "Qualitative Research"),
                "ทำ User Research สำหรับ SCB Easy App ทั้ง Qualitative และ Quantitative เพื่อนำ Insight ไปพัฒนา Product",
                "ประสบการณ์ UX Research 3+ ปี\nเชี่ยวชาญ User Interview, Usability Testing\nวิเคราะห์ข้อมูลได้ดี\nมีพอร์ตโฟลิโอผลงานวิจัย",
                LocalDate.now().plusMonths(2)),

            buildJob(trueCorp, "Finance Manager", "True Corporation",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 80000, 130000, "การเงิน",
                Arrays.asList("Finance", "IFRS", "Treasury", "Fund Management", "FX"),
                "บริหารงานการเงินของ True Corporation ดูแล Treasury, Cash Management, FX Hedging และรายงานการเงินตาม IFRS",
                "ปริญญาตรี/โทด้านการเงิน\nประสบการณ์ Finance Manager 8+ ปี\nรู้จัก IFRS\nมี CFA จะได้รับการพิจารณาเป็นพิเศษ",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "HR Operations Specialist", "Grab Thailand",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 35000, 55000, "ทรัพยากรบุคคล",
                Arrays.asList("HR Operations", "HRIS", "Payroll", "Workday"),
                "ดูแลงาน HR Operations ระบบ HRIS, Payroll, สวัสดิการพนักงาน และ Onboarding/Offboarding",
                "ประสบการณ์ HR Operations 3+ ปี\nรู้จัก HRIS (Workday, SuccessFactors)\nเข้าใจกฎหมายแรงงาน\nละเอียดรอบคอบ",
                LocalDate.now().plusMonths(2)),

            buildJob(scbUser, "Legal Counsel (Banking)", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 80000, 130000, "กฎหมาย",
                Arrays.asList("Banking Law", "Litigation", "Legal Advisory", "Contract"),
                "ให้คำปรึกษากฎหมายแก่ฝ่ายงานต่างๆ ของธนาคาร ดูแลคดีความ ร่างสัญญา และปฏิบัติตามกฎหมายธนาคาร",
                "ปริญญาตรีด้านกฎหมาย\nใบอนุญาตทนายความ\nประสบการณ์กฎหมายธนาคาร 6+ ปี",
                LocalDate.now().plusMonths(3)),

            buildJob(trueCorp, "Procurement Specialist", "True Corporation",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 40000, 65000, "โลจิสติกส์",
                Arrays.asList("Procurement", "Vendor Management", "SAP", "Negotiation"),
                "จัดซื้อจัดหาสินค้าและบริการสำหรับ True Corporation บริหาร Vendor ต่อรองราคาและเงื่อนไขสัญญา",
                "ปริญญาตรีสาขาที่เกี่ยวข้อง\nประสบการณ์ Procurement 3+ ปี\nทักษะการเจรจาต่อรอง\nรู้จัก SAP",
                LocalDate.now().plusMonths(2)),

            buildJob(grab, "Senior Accountant", "Grab Thailand",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 50000, 75000, "บัญชี",
                Arrays.asList("Accounting", "IFRS", "Month-end Close", "SAP", "Big4"),
                "จัดทำและตรวจสอบรายงานการเงิน ปิดบัญชีรายเดือน ดูแลภาษีและรายงานตาม IFRS สำหรับ Grab Thailand",
                "ปริญญาตรีด้านบัญชี\nมี CPA จะได้รับการพิจารณาเป็นพิเศษ\nประสบการณ์บัญชี 4+ ปี\nรู้จัก SAP",
                LocalDate.now().plusMonths(2)),

            buildJob(scbUser, "นักพัฒนา Mobile (React Native)", "ธนาคารไทยพาณิชย์ (SCB)",
                "กรุงเทพมหานคร", true, Job.JobType.FULL_TIME, 60000, 100000, "เทคโนโลยี",
                Arrays.asList("React Native", "TypeScript", "iOS", "Android", "Mobile"),
                "พัฒนาแอป SCB Easy บน React Native สำหรับ iOS และ Android ปรับปรุงประสิทธิภาพและ User Experience",
                "ประสบการณ์ React Native 3+ ปี\nเชี่ยวชาญ TypeScript\nเข้าใจ Native Module\nมีแอปใน Store จะได้รับการพิจารณาเป็นพิเศษ",
                LocalDate.now().plusMonths(2)),

            buildJob(trueCorp, "Customer Service Representative (Part-time)", "True Corporation",
                "กรุงเทพมหานคร", false, Job.JobType.PART_TIME, 12000, 18000, "ค้าปลีก",
                Arrays.asList("Customer Service", "CRM", "Communication"),
                "ให้บริการลูกค้าทางโทรศัพท์และ Chat แก้ปัญหาการใช้งานบริการ True ด้วยความเป็นมืออาชีพ",
                "มนุษย์สัมพันธ์ดี\nพูดจาชัดเจน\nสามารถทำงาน Part-time ได้\nมีความอดทน",
                LocalDate.now().plusMonths(1)),

            buildJob(grab, "Business Development Manager", "Grab Thailand",
                "กรุงเทพมหานคร", false, Job.JobType.FULL_TIME, 70000, 110000, "การตลาด",
                Arrays.asList("Business Development", "Partnership", "B2B", "Negotiation"),
                "พัฒนา Partnership และหาโอกาสทางธุรกิจใหม่สำหรับ Grab ไทย เจรจาสัญญา บริหาร Key Accounts",
                "ประสบการณ์ BD/Partnerships 5+ ปี\nทักษะการเจรจาต่อรองสูง\nภาษาอังกฤษดีเยี่ยม\nมี Network ในธุรกิจ",
                LocalDate.now().plusMonths(2)),

            buildJob(scbUser, "เจ้าหน้าที่บริการลูกค้า (ธนาคาร)", "ธนาคารไทยพาณิชย์ (SCB)",
                "นครราชสีมา", false, Job.JobType.FULL_TIME, 20000, 30000, "ค้าปลีก",
                Arrays.asList("Bank Teller", "Customer Service", "Banking"),
                "ให้บริการลูกค้าที่เคาน์เตอร์ธนาคาร รับ-จ่ายเงิน เปิดบัญชี และให้คำแนะนำบริการทางการเงิน",
                "ปริญญาตรีทุกสาขา\nบุคลิกภาพดี มนุษย์สัมพันธ์ดี\nมีความละเอียดรอบคอบ",
                LocalDate.now().plusMonths(2)),

            buildJob(trueCorp, "Scrum Master", "True Corporation",
                "กรุงเทพมหานคร", true, Job.JobType.FULL_TIME, 60000, 95000, "เทคโนโลยี",
                Arrays.asList("Scrum Master", "Agile", "Jira", "Coaching", "SAFe"),
                "ดูแลและ Coach ทีม Agile ของ True ให้ทำงานได้อย่างมีประสิทธิภาพ จัดการ Ceremonies และแก้ Impediments",
                "มีใบรับรอง CSM หรือ PSM\nประสบการณ์ Scrum Master 3+ ปี\nเข้าใจ Agile Frameworks\nทักษะ Facilitation ดี",
                LocalDate.now().plusMonths(2))
        );

        jobRepository.saveAll(jobs);
        System.out.println("DataSeeder: Seeded " + jobs.size() + " jobs successfully.");
    }

    private User createEmployer(String email, String companyName, String name) {
        User u = new User();
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode("Password@123"));
        u.setName(name);
        u.setRole(User.Role.EMPLOYER);
        u.setProvider(User.AuthProvider.LOCAL);
        u.setCompanyName(companyName);
        return u;
    }

    private Job buildJob(User employer, String title, String company,
                          String location, boolean remote, Job.JobType jobType,
                          int salaryMin, int salaryMax, String category,
                          List<String> tags, String description, String requirements,
                          LocalDate deadline) {
        Job job = new Job();
        job.setEmployer(employer);
        job.setTitle(title);
        job.setCompany(company);
        job.setLocation(location);
        job.setRemote(remote);
        job.setJobType(jobType);
        job.setSalaryMin(salaryMin);
        job.setSalaryMax(salaryMax);
        job.setSalaryCurrency("THB");
        job.setCategory(category);
        job.setTags(tags);
        job.setDescription(description);
        job.setRequirements(requirements);
        job.setDeadline(deadline);
        job.setStatus(Job.JobStatus.ACTIVE);
        return job;
    }
}
