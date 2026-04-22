package com.example.labOdc.DTO;

import java.util.List;

import com.example.labOdc.Model.UserRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BroadcastNotificationRequest {
    private String title;
    private String message;
    private String type;

    /**
     * When true, send to all active users (all roles).
     * When false, send only to users having at least one role in {@code roles}.
     */
    private Boolean sendToAll;

    private List<UserRole> roles;
}
