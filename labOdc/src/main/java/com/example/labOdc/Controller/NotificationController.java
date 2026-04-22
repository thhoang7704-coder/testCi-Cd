package com.example.labOdc.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.BroadcastNotificationRequest;
import com.example.labOdc.DTO.Response.NotificationResponse;
import com.example.labOdc.Model.Notification;
import com.example.labOdc.Service.NotificationService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<NotificationResponse>> listMyNotifications() {
        List<Notification> list = notificationService.listMyNotifications();
        return ApiResponse.success(list.stream().map(NotificationResponse::fromEntity).toList(), "OK", HttpStatus.OK);
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Long> unreadCount() {
        long count = notificationService.countMyUnread();
        return ApiResponse.success(count, "OK", HttpStatus.OK);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<NotificationResponse> markRead(@PathVariable String id) {
        Notification n = notificationService.markRead(id);
        return ApiResponse.success(NotificationResponse.fromEntity(n), "OK", HttpStatus.OK);
    }

    @PutMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<String> markAllRead() {
        notificationService.markAllRead();
        return ApiResponse.success("OK", "OK", HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<String> delete(@PathVariable String id) {
        notificationService.deleteMyNotification(id);
        return ApiResponse.success("OK", "OK", HttpStatus.OK);
    }

    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<Integer> broadcast(@RequestBody BroadcastNotificationRequest request) {
        boolean sendToAll = Boolean.TRUE.equals(request.getSendToAll());
        int count = notificationService.broadcastToUsers(
                request.getTitle(),
                request.getMessage(),
                request.getType(),
                sendToAll,
                request.getRoles());
        return ApiResponse.success(count, "OK", HttpStatus.OK);
    }
}
