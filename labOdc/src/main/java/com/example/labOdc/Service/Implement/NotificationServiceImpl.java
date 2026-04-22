package com.example.labOdc.Service.Implement;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Notification;
import com.example.labOdc.Model.User;
import com.example.labOdc.Model.UserRole;
import com.example.labOdc.Repository.NotificationRepository;
import com.example.labOdc.Repository.UserRepository;
import com.example.labOdc.Service.NotificationService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private User getCurrentUserOrThrow() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new IllegalStateException("Unauthenticated request");
        }

        String usernameOrEmail = auth.getName();
        return userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    @Transactional
    public Notification createForUser(User user, String title, String message, String type) {
        if (user == null || user.getId() == null || user.getId().isBlank()) {
            throw new IllegalArgumentException("user is required");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("title is required");
        }

        Notification n = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        return notificationRepository.save(n);
    }

    @Override
    @Transactional
    public int broadcastToUsers(String title, String message, String type, boolean sendToAll, List<UserRole> roles) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("title is required");
        }

        List<User> recipients;
        if (sendToAll) {
            recipients = userRepository.findByIsActiveTrue();
        } else {
            Collection<UserRole> safeRoles = roles == null ? List.of() : roles.stream().filter(Objects::nonNull).toList();
            if (safeRoles.isEmpty()) {
                throw new IllegalArgumentException("roles is required when sendToAll=false");
            }
            recipients = userRepository.findDistinctByIsActiveTrueAndRoles_RoleIn(safeRoles);
        }

        if (recipients == null || recipients.isEmpty()) {
            return 0;
        }

        List<Notification> notifications = new ArrayList<>(recipients.size());
        for (User user : recipients) {
            if (user == null || user.getId() == null || user.getId().isBlank()) {
                continue;
            }

            notifications.add(Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(type)
                    .isRead(false)
                    .build());
        }

        notificationRepository.saveAll(notifications);
        return notifications.size();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> listMyNotifications() {
        User me = getCurrentUserOrThrow();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(me.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public long countMyUnread() {
        User me = getCurrentUserOrThrow();
        return notificationRepository.countByUserIdAndIsReadFalse(me.getId());
    }

    @Override
    @Transactional
    public Notification markRead(String notificationId) {
        User me = getCurrentUserOrThrow();
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (n.getUser() == null || n.getUser().getId() == null || !n.getUser().getId().equals(me.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Not allowed");
        }

        n.setIsRead(true);
        return notificationRepository.save(n);
    }

    @Override
    @Transactional
    public void markAllRead() {
        User me = getCurrentUserOrThrow();
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(me.getId());
        for (Notification n : list) {
            if (!Boolean.TRUE.equals(n.getIsRead())) {
                n.setIsRead(true);
            }
        }
        notificationRepository.saveAll(list);
    }

    @Override
    @Transactional
    public void deleteMyNotification(String notificationId) {
        User me = getCurrentUserOrThrow();
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (n.getUser() == null || n.getUser().getId() == null || !n.getUser().getId().equals(me.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Not allowed");
        }

        notificationRepository.delete(n);
    }
}
