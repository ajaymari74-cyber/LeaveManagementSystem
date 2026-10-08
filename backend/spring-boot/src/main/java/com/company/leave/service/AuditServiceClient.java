package com.company.leave.service;

import com.company.leave.dto.AuditLogDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;

@Service
public class AuditServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AuditServiceClient.class);

    private final RestClient restClient;
    private final String auditUrl;

    public AuditServiceClient(@Value("${audit.service.url:http://localhost:5000/log}") String auditUrl) {
        this.auditUrl = auditUrl;
        this.restClient = RestClient.builder().build();
    }

    public void logAction(Long userId, String action, Long leaveId, String details) {
        Thread thread = new Thread(() -> {
            try {
                AuditLogDto payload = new AuditLogDto(userId, action, leaveId, LocalDateTime.now(), details);
                restClient.post()
                        .uri(auditUrl)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(payload)
                        .retrieve()
                        .toBodilessEntity();
                log.info("Audit log recorded: {} for leave #{}", action, leaveId);
            } catch (Exception ex) {
                log.warn("Audit service unavailable ({}): {}", auditUrl, ex.getMessage());
            }
        });
        thread.setDaemon(true);
        thread.start();
    }
}
