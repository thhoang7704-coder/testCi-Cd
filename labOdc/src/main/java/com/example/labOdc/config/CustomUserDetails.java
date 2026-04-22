package com.example.labOdc.config;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.labOdc.Model.PermissionEntity;
import com.example.labOdc.Model.RoleEntity;
import com.example.labOdc.Model.User;

public class CustomUserDetails implements UserDetails {
    private final User user;
    private final RoleEntity roleEntity;

    public CustomUserDetails(User user, RoleEntity roleEntity) {
        this.user = user;
        this.roleEntity = roleEntity;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();

        // 1 role duy nhất
        authorities.add(new SimpleGrantedAuthority("ROLE_" + roleEntity.getRole().name()));

        // tất cả permission của role đó
        for (PermissionEntity permission : roleEntity.getPermissions()) {
            authorities.add(new SimpleGrantedAuthority(permission.getCode()));
        }

        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail(); // hoặc username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(user.getIsActive());
    }

}
