package com.example.labOdc.Service;

import java.util.List;

import com.example.labOdc.Model.Notification;
import com.example.labOdc.Model.User;
import com.example.labOdc.Model.UserRole;

public interface NotificationService {

    Notification createForUser(User user, String title, String message, String type);

    /**
     * SYSTEM_ADMIN broadcast utility.
     *
     * @return number of notifications created
     */
    int broadcastToUsers(String title, String message, String type, boolean sendToAll, List<UserRole> roles);

    List<Notification> listMyNotifications();

    long countMyUnread();

    Notification markRead(String notificationId);

    void markAllRead();

    void deleteMyNotification(String notificationId);
}
