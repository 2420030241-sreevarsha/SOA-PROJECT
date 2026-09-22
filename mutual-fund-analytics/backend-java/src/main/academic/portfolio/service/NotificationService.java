package com.academic.portfolio.service;

import com.academic.portfolio.model.Notification;
import com.academic.portfolio.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * SOA Service 7: Notification Service
 * Responsibilities:
 * - Portfolio change notifications
 * - SIP reminders
 * - Concentration warnings
 * - Volatility notices
 */
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Notification createNotification(String userId, String type, String title, String message) {
        Notification notification = Notification.builder()
                .id("notif-" + UUID.randomUUID().toString().substring(0, 8))
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .createdAt(LocalDateTime.now().toString())
                .read(false)
                .build();

        return notificationRepository.save(notification);
    }

    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(String userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
    }
}
