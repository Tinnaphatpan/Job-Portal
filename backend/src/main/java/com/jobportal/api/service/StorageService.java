package com.jobportal.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${app.storage.url:}")
    private String supabaseUrl;

    @Value("${app.storage.key:}")
    private String supabaseKey;

    @Value("${app.storage.bucket:resumes}")
    private String bucket;

    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadResume(MultipartFile file, String userId) {
        if (!"application/pdf".equals(file.getContentType())) {
            throw new IllegalArgumentException("อัปโหลดได้เฉพาะไฟล์ PDF เท่านั้น");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("ขนาดไฟล์ต้องไม่เกิน 5MB");
        }

        if (supabaseKey == null || supabaseKey.isBlank()) {
            return null;
        }

        String fileName = "resumes/" + userId + "/" + UUID.randomUUID() + ".pdf";
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + fileName;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.setContentType(MediaType.APPLICATION_PDF);
        try {
            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
            restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);
            return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("ไม่สามารถอัปโหลดไฟล์ได้: " + e.getMessage());
        }
    }
}
