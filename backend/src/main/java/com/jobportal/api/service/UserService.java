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

    private static final long MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
    private static final String CONTENT_TYPE_IMAGE_PREFIX = "image/";

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

    // ===== Profile =====

    public UserProfileDto getProfile(String email) {
        return new UserProfileDto(findUserByEmail(email));
    }

    @Transactional
    public UserProfileDto updateProfile(String email, UpdateProfileRequest request) {
        User user = findUserByEmail(email);
        applyProfileChanges(user, request);
        return new UserProfileDto(userRepository.save(user));
    }

    @Transactional
    public UserProfileDto uploadAvatar(String email, MultipartFile file) {
        validateAvatarFile(file);
        User user = findUserByEmail(email);
        user.setAvatar(encodeFileToDataUrl(file));
        return new UserProfileDto(userRepository.save(user));
    }

    @Transactional
    public UserProfileDto uploadResume(String email, MultipartFile file) {
        User user = findUserByEmail(email);
        user.setResumeUrl(storageService.uploadResume(file, user.getId()));
        user.setResumeFileName(file.getOriginalFilename());
        return new UserProfileDto(userRepository.save(user));
    }

    // ===== Work Experience =====

    public List<WorkExperience> getWorkExperiences(String email) {
        return workExperienceRepository.findByUserIdOrderByStartDateDesc(findUserByEmail(email).getId());
    }

    @Transactional
    public WorkExperience addWorkExperience(String email, WorkExperienceRequest request) {
        WorkExperience workExperience = buildWorkExperience(findUserByEmail(email).getId(), request);
        return workExperienceRepository.save(workExperience);
    }

    @Transactional
    public WorkExperience updateWorkExperience(String email, String id, WorkExperienceRequest request) {
        WorkExperience workExperience = findWorkExperienceOwnedBy(id, findUserByEmail(email).getId());
        applyWorkExperienceChanges(workExperience, request);
        return workExperienceRepository.save(workExperience);
    }

    @Transactional
    public void deleteWorkExperience(String email, String id) {
        workExperienceRepository.deleteByIdAndUserId(id, findUserByEmail(email).getId());
    }

    // ===== Education =====

    public List<EducationHistory> getEducationHistories(String email) {
        return educationHistoryRepository.findByUserIdOrderByStartYearDesc(findUserByEmail(email).getId());
    }

    @Transactional
    public EducationHistory addEducationHistory(String email, EducationHistoryRequest request) {
        EducationHistory education = buildEducationHistory(findUserByEmail(email).getId(), request);
        return educationHistoryRepository.save(education);
    }

    @Transactional
    public EducationHistory updateEducationHistory(String email, String id, EducationHistoryRequest request) {
        EducationHistory education = findEducationOwnedBy(id, findUserByEmail(email).getId());
        applyEducationChanges(education, request);
        return educationHistoryRepository.save(education);
    }

    @Transactional
    public void deleteEducationHistory(String email, String id) {
        educationHistoryRepository.deleteByIdAndUserId(id, findUserByEmail(email).getId());
    }

    // ===== Certificates =====

    public List<Certificate> getCertificates(String email) {
        return certificateRepository.findByUserIdOrderByIssueDateDesc(findUserByEmail(email).getId());
    }

    @Transactional
    public Certificate addCertificate(String email, CertificateRequest request) {
        Certificate certificate = buildCertificate(findUserByEmail(email).getId(), request);
        return certificateRepository.save(certificate);
    }

    @Transactional
    public Certificate updateCertificate(String email, String id, CertificateRequest request) {
        Certificate certificate = findCertificateOwnedBy(id, findUserByEmail(email).getId());
        applyCertificateChanges(certificate, request);
        return certificateRepository.save(certificate);
    }

    @Transactional
    public void deleteCertificate(String email, String id) {
        certificateRepository.deleteByIdAndUserId(id, findUserByEmail(email).getId());
    }

    // ===== Language Skills =====

    public List<LanguageSkill> getLanguageSkills(String email) {
        return languageSkillRepository.findByUserId(findUserByEmail(email).getId());
    }

    @Transactional
    public LanguageSkill addLanguageSkill(String email, LanguageSkillRequest request) {
        LanguageSkill languageSkill = buildLanguageSkill(findUserByEmail(email).getId(), request);
        return languageSkillRepository.save(languageSkill);
    }

    @Transactional
    public LanguageSkill updateLanguageSkill(String email, String id, LanguageSkillRequest request) {
        LanguageSkill languageSkill = findLanguageSkillOwnedBy(id, findUserByEmail(email).getId());
        languageSkill.setLanguage(request.getLanguage());
        languageSkill.setLevel(request.getLevel());
        return languageSkillRepository.save(languageSkill);
    }

    @Transactional
    public void deleteLanguageSkill(String email, String id) {
        languageSkillRepository.deleteByIdAndUserId(id, findUserByEmail(email).getId());
    }

    // ===== Private Helpers =====

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
    }

    private void applyProfileChanges(User user, UpdateProfileRequest request) {
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
    }

    private void validateAvatarFile(MultipartFile file) {
        if (file.getSize() > MAX_AVATAR_SIZE_BYTES) {
            throw new IllegalArgumentException("ขนาดรูปต้องไม่เกิน 2MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith(CONTENT_TYPE_IMAGE_PREFIX)) {
            throw new IllegalArgumentException("อัปโหลดได้เฉพาะไฟล์รูปภาพเท่านั้น");
        }
    }

    private String encodeFileToDataUrl(MultipartFile file) {
        try {
            String base64 = Base64.getEncoder().encodeToString(file.getBytes());
            return "data:" + file.getContentType() + ";base64," + base64;
        } catch (Exception e) {
            throw new RuntimeException("ไม่สามารถอัปโหลดรูปได้");
        }
    }

    private WorkExperience buildWorkExperience(String userId, WorkExperienceRequest request) {
        WorkExperience workExperience = new WorkExperience();
        workExperience.setUserId(userId);
        workExperience.setCompany(request.getCompany());
        workExperience.setPosition(request.getPosition());
        workExperience.setStartDate(request.getStartDate());
        workExperience.setCurrent(request.isCurrent());
        workExperience.setEndDate(request.isCurrent() ? null : request.getEndDate());
        workExperience.setDescription(request.getDescription());
        return workExperience;
    }

    private void applyWorkExperienceChanges(WorkExperience workExperience, WorkExperienceRequest request) {
        workExperience.setCompany(request.getCompany());
        workExperience.setPosition(request.getPosition());
        workExperience.setStartDate(request.getStartDate());
        workExperience.setCurrent(request.isCurrent());
        workExperience.setEndDate(request.isCurrent() ? null : request.getEndDate());
        workExperience.setDescription(request.getDescription());
    }

    private EducationHistory buildEducationHistory(String userId, EducationHistoryRequest request) {
        EducationHistory education = new EducationHistory();
        education.setUserId(userId);
        education.setInstitution(request.getInstitution());
        education.setDegree(request.getDegree());
        education.setField(request.getField());
        education.setStartYear(request.getStartYear());
        education.setEndYear(request.getEndYear());
        education.setGpa(request.getGpa());
        return education;
    }

    private void applyEducationChanges(EducationHistory education, EducationHistoryRequest request) {
        education.setInstitution(request.getInstitution());
        education.setDegree(request.getDegree());
        education.setField(request.getField());
        education.setStartYear(request.getStartYear());
        education.setEndYear(request.getEndYear());
        education.setGpa(request.getGpa());
    }

    private Certificate buildCertificate(String userId, CertificateRequest request) {
        Certificate certificate = new Certificate();
        certificate.setUserId(userId);
        certificate.setName(request.getName());
        certificate.setIssuer(request.getIssuer());
        certificate.setIssueDate(request.getIssueDate());
        certificate.setExpireDate(request.getExpireDate());
        return certificate;
    }

    private void applyCertificateChanges(Certificate certificate, CertificateRequest request) {
        certificate.setName(request.getName());
        certificate.setIssuer(request.getIssuer());
        certificate.setIssueDate(request.getIssueDate());
        certificate.setExpireDate(request.getExpireDate());
    }

    private LanguageSkill buildLanguageSkill(String userId, LanguageSkillRequest request) {
        LanguageSkill languageSkill = new LanguageSkill();
        languageSkill.setUserId(userId);
        languageSkill.setLanguage(request.getLanguage());
        languageSkill.setLevel(request.getLevel());
        return languageSkill;
    }

    private WorkExperience findWorkExperienceOwnedBy(String id, String userId) {
        WorkExperience workExperience = workExperienceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบข้อมูลประวัติการทำงาน"));
        verifyOwnership(workExperience.getUserId(), userId);
        return workExperience;
    }

    private EducationHistory findEducationOwnedBy(String id, String userId) {
        EducationHistory education = educationHistoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบข้อมูลประวัติการศึกษา"));
        verifyOwnership(education.getUserId(), userId);
        return education;
    }

    private Certificate findCertificateOwnedBy(String id, String userId) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบข้อมูลใบประกาศ"));
        verifyOwnership(certificate.getUserId(), userId);
        return certificate;
    }

    private LanguageSkill findLanguageSkillOwnedBy(String id, String userId) {
        LanguageSkill languageSkill = languageSkillRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบข้อมูลภาษา"));
        verifyOwnership(languageSkill.getUserId(), userId);
        return languageSkill;
    }

    private void verifyOwnership(String resourceUserId, String requestingUserId) {
        if (!resourceUserId.equals(requestingUserId)) {
            throw new IllegalArgumentException("ไม่มีสิทธิ์แก้ไขข้อมูลนี้");
        }
    }
}
