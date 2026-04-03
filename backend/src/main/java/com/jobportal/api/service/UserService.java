package com.jobportal.api.service;

import com.jobportal.api.dto.user.*;
import com.jobportal.api.model.*;
import com.jobportal.api.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StorageService storageService;
    private final WorkExperienceRepository workExperienceRepository;
    private final EducationHistoryRepository educationHistoryRepository;
    private final CertificateRepository certificateRepository;
    private final LanguageSkillRepository languageSkillRepository;

    public UserService(UserRepository userRepository, StorageService storageService,
                       WorkExperienceRepository workExperienceRepository,
                       EducationHistoryRepository educationHistoryRepository,
                       CertificateRepository certificateRepository,
                       LanguageSkillRepository languageSkillRepository) {
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.workExperienceRepository = workExperienceRepository;
        this.educationHistoryRepository = educationHistoryRepository;
        this.certificateRepository = certificateRepository;
        this.languageSkillRepository = languageSkillRepository;
    }

    public UserProfileDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        return new UserProfileDto(user);
    }

    @Transactional
    public UserProfileDto updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));

        if (request.getName() != null && !request.getName().isBlank()) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getHeadline() != null) user.setHeadline(request.getHeadline());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getCompanyName() != null) user.setCompanyName(request.getCompanyName());
        if (request.getCompanyWebsite() != null) user.setCompanyWebsite(request.getCompanyWebsite());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getBirthDate() != null) user.setBirthDate(request.getBirthDate());
        if (request.getNationality() != null) user.setNationality(request.getNationality());
        if (request.getReligion() != null) user.setReligion(request.getReligion());
        if (request.getMilitaryStatus() != null) user.setMilitaryStatus(request.getMilitaryStatus());
        if (request.getWeight() != null) user.setWeight(request.getWeight());
        if (request.getHeight() != null) user.setHeight(request.getHeight());

        return new UserProfileDto(userRepository.save(user));
    }

    @Transactional
    public UserProfileDto uploadAvatar(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        if (file.getSize() > 2 * 1024 * 1024) throw new IllegalArgumentException("ขนาดรูปต้องไม่เกิน 2MB");
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) throw new IllegalArgumentException("อัปโหลดได้เฉพาะไฟล์รูปภาพ");
        try {
            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            user.setAvatar("data:" + contentType + ";base64," + base64);
            return new UserProfileDto(userRepository.save(user));
        } catch (Exception e) { throw new RuntimeException("ไม่สามารถอัปโหลดรูปได้"); }
    }

    @Transactional
    public UserProfileDto uploadResume(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        String resumeUrl = storageService.uploadResume(file, user.getId());
        user.setResumeUrl(resumeUrl);
        user.setResumeFileName(file.getOriginalFilename());
        return new UserProfileDto(userRepository.save(user));
    }

    // ===== Work Experience =====
    public List<WorkExperience> getWorkExperiences(String email) {
        User user = getUser(email);
        return workExperienceRepository.findByUserIdOrderByStartDateDesc(user.getId());
    }

    @Transactional
    public WorkExperience addWorkExperience(String email, WorkExperienceRequest req) {
        User user = getUser(email);
        WorkExperience we = new WorkExperience();
        we.setUserId(user.getId());
        we.setCompany(req.getCompany());
        we.setPosition(req.getPosition());
        we.setStartDate(req.getStartDate());
        we.setEndDate(req.isCurrent() ? null : req.getEndDate());
        we.setCurrent(req.isCurrent());
        we.setDescription(req.getDescription());
        return workExperienceRepository.save(we);
    }

    @Transactional
    public WorkExperience updateWorkExperience(String email, String id, WorkExperienceRequest req) {
        User user = getUser(email);
        WorkExperience we = workExperienceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบข้อมูล"));
        if (!we.getUserId().equals(user.getId())) throw new IllegalArgumentException("ไม่มีสิทธิ์");
        we.setCompany(req.getCompany());
        we.setPosition(req.getPosition());
        we.setStartDate(req.getStartDate());
        we.setEndDate(req.isCurrent() ? null : req.getEndDate());
        we.setCurrent(req.isCurrent());
        we.setDescription(req.getDescription());
        return workExperienceRepository.save(we);
    }

    @Transactional
    public void deleteWorkExperience(String email, String id) {
        User user = getUser(email);
        workExperienceRepository.deleteByIdAndUserId(id, user.getId());
    }

    // ===== Education =====
    public List<EducationHistory> getEducationHistories(String email) {
        User user = getUser(email);
        return educationHistoryRepository.findByUserIdOrderByStartYearDesc(user.getId());
    }

    @Transactional
    public EducationHistory addEducationHistory(String email, EducationHistoryRequest req) {
        User user = getUser(email);
        EducationHistory ed = new EducationHistory();
        ed.setUserId(user.getId());
        ed.setInstitution(req.getInstitution());
        ed.setDegree(req.getDegree());
        ed.setField(req.getField());
        ed.setStartYear(req.getStartYear());
        ed.setEndYear(req.getEndYear());
        ed.setGpa(req.getGpa());
        return educationHistoryRepository.save(ed);
    }

    @Transactional
    public EducationHistory updateEducationHistory(String email, String id, EducationHistoryRequest req) {
        User user = getUser(email);
        EducationHistory ed = educationHistoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบข้อมูล"));
        if (!ed.getUserId().equals(user.getId())) throw new IllegalArgumentException("ไม่มีสิทธิ์");
        ed.setInstitution(req.getInstitution());
        ed.setDegree(req.getDegree());
        ed.setField(req.getField());
        ed.setStartYear(req.getStartYear());
        ed.setEndYear(req.getEndYear());
        ed.setGpa(req.getGpa());
        return educationHistoryRepository.save(ed);
    }

    @Transactional
    public void deleteEducationHistory(String email, String id) {
        User user = getUser(email);
        educationHistoryRepository.deleteByIdAndUserId(id, user.getId());
    }

    // ===== Certificates =====
    public List<Certificate> getCertificates(String email) {
        User user = getUser(email);
        return certificateRepository.findByUserIdOrderByIssueDateDesc(user.getId());
    }

    @Transactional
    public Certificate addCertificate(String email, CertificateRequest req) {
        User user = getUser(email);
        Certificate cert = new Certificate();
        cert.setUserId(user.getId());
        cert.setName(req.getName());
        cert.setIssuer(req.getIssuer());
        cert.setIssueDate(req.getIssueDate());
        cert.setExpireDate(req.getExpireDate());
        return certificateRepository.save(cert);
    }

    @Transactional
    public Certificate updateCertificate(String email, String id, CertificateRequest req) {
        User user = getUser(email);
        Certificate cert = certificateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบข้อมูล"));
        if (!cert.getUserId().equals(user.getId())) throw new IllegalArgumentException("ไม่มีสิทธิ์");
        cert.setName(req.getName());
        cert.setIssuer(req.getIssuer());
        cert.setIssueDate(req.getIssueDate());
        cert.setExpireDate(req.getExpireDate());
        return certificateRepository.save(cert);
    }

    @Transactional
    public void deleteCertificate(String email, String id) {
        User user = getUser(email);
        certificateRepository.deleteByIdAndUserId(id, user.getId());
    }

    // ===== Language Skills =====
    public List<LanguageSkill> getLanguageSkills(String email) {
        User user = getUser(email);
        return languageSkillRepository.findByUserId(user.getId());
    }

    @Transactional
    public LanguageSkill addLanguageSkill(String email, LanguageSkillRequest req) {
        User user = getUser(email);
        LanguageSkill lang = new LanguageSkill();
        lang.setUserId(user.getId());
        lang.setLanguage(req.getLanguage());
        lang.setLevel(req.getLevel());
        return languageSkillRepository.save(lang);
    }

    @Transactional
    public LanguageSkill updateLanguageSkill(String email, String id, LanguageSkillRequest req) {
        User user = getUser(email);
        LanguageSkill lang = languageSkillRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบข้อมูล"));
        if (!lang.getUserId().equals(user.getId())) throw new IllegalArgumentException("ไม่มีสิทธิ์");
        lang.setLanguage(req.getLanguage());
        lang.setLevel(req.getLevel());
        return languageSkillRepository.save(lang);
    }

    @Transactional
    public void deleteLanguageSkill(String email, String id) {
        User user = getUser(email);
        languageSkillRepository.deleteByIdAndUserId(id, user.getId());
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
    }
}
