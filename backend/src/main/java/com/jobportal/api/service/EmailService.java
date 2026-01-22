package com.jobportal.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Async
    public void sendNewApplicationEmail(String employerEmail, String jobTitle, String applicantName) {
        if (mailSender == null) return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(employerEmail);
            helper.setSubject("มีผู้สมัครงานใหม่: " + jobTitle);
            helper.setText("""
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
                  <h2 style="color:#493584">มีผู้สมัครงานใหม่!</h2>
                  <p><strong>%s</strong> ได้สมัครตำแหน่ง <strong>%s</strong></p>
                  <a href="%s/dashboard/employer" style="background:#f15a22;color:white;padding:10px 20px;border-radius:8px;text-decoration:none">ดูใบสมัคร</a>
                </div>""".formatted(applicantName, jobTitle, frontendUrl), true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send new application email: {}", e.getMessage());
        }
    }

    @Async
    public void sendApplicationStatusEmail(String applicantEmail, String jobTitle, String status, String message) {
        if (mailSender == null) return;
        try {
            String statusTh = switch (status) {
                case "REVIEWING" -> "กำลังพิจารณา";
                case "ACCEPTED" -> "ได้รับการคัดเลือก";
                case "REJECTED" -> "ไม่ผ่านการพิจารณา";
                default -> status;
            };
            MimeMessage mail = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mail, true, "UTF-8");
            helper.setTo(applicantEmail);
            helper.setSubject("อัปเดตสถานะการสมัครงาน: " + jobTitle);
            helper.setText("""
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
                  <h2 style="color:#493584">อัปเดตสถานะการสมัครงาน</h2>
                  <p>ตำแหน่ง: <strong>%s</strong></p>
                  <p>สถานะ: <strong>%s</strong></p>
                  %s
                  <a href="%s/dashboard" style="background:#f15a22;color:white;padding:10px 20px;border-radius:8px;text-decoration:none">ดูรายละเอียด</a>
                </div>""".formatted(jobTitle, statusTh,
                    message != null ? "<p>" + message + "</p>" : "", frontendUrl), true);
            mailSender.send(mail);
        } catch (Exception e) {
            log.error("Failed to send status email: {}", e.getMessage());
        }
    }
}
