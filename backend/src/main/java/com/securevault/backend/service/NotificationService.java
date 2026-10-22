package com.securevault.backend.service;

import com.securevault.backend.entity.Notification;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification sendNotification(User user, String title, String message, String type) {
        if (user == null) return null;
        Notification notif = new Notification(user, title, message, type, false, LocalDateTime.now());
        Notification saved = notificationRepository.save(notif);

        // Simulation / hook for JavaMailSender & FCM push notification delivery
        log.info("[NOTIFICATION DISPATCHED] Type: {} | To: {} | Title: {}", type, user.getEmail(), title);

        return saved;
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findTop20ByUserOrderByCreatedAtDesc(user);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }

    @Transactional
    public Notification markAsRead(Long id, User user) {
        Notification n = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized");
        }
        n.setRead(true);
        return notificationRepository.save(n);
    }
}
