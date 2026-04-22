package com.example.labOdc.Service.Implement;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.labOdc.DTO.MentorDTO;
import com.example.labOdc.DTO.UserDTO;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Mentor;
import com.example.labOdc.Model.RoleEntity;
import com.example.labOdc.Model.User;
import com.example.labOdc.Model.UserRole;
import com.example.labOdc.Repository.MentorRepository;
import com.example.labOdc.Repository.RoleRepository;
import com.example.labOdc.Repository.UserRepository;
import com.example.labOdc.Service.UserService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor

public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MentorRepository mentorRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User createUser(UserDTO userDTO) {
        Set<RoleEntity> roles;

        if (userDTO.getRoles() == null || userDTO.getRoles().isEmpty()) {
            // gán default role = USER
            RoleEntity defaultRole = roleRepository.findByRole(UserRole.USER)
                    .orElseThrow(() -> new ResourceNotFoundException("Default role USER not found"));
            roles = Set.of(defaultRole);
        } else {
            roles = userDTO.getRoles().stream()
                    .map(code -> {
                        UserRole userRole = UserRole.valueOf(code);
                        return roleRepository.findByRole(userRole)
                                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + code));
                    })
                    .collect(Collectors.toSet());
        }
        User user = User.builder()
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .fullName(userDTO.getFullName())
                .phone(userDTO.getPhone())
                .username(userDTO.getUsername())
                .avatarUrl(userDTO.getAvatarUrl())
                .username(userDTO.getUsername())
                .roles(roles)
                .isActive(userDTO.getIsActive() != null ? userDTO.getIsActive() : true)
                .emailVerified(userDTO.getEmailVerified())
                .emailVerifiedAt(userDTO.getEmailVerifiedAt())
                .lastLoginAt(userDTO.getLastLoginAt())
                .build();
        userRepository.save(user);
        return user;
    }

    @Override
    public List<User> getAllUser() {
        List<User> list = userRepository.findAll();
        return list;
    }

    @Transactional
    @Override
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Override
    public User getUserById(String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Ko thay id"));
        return user;
    }

    @Override
    public User updateUser(UserDTO userDTO, String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ko thay id"));

        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail());
        }

        if (userDTO.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }

        if (userDTO.getFullName() != null) {
            user.setFullName(userDTO.getFullName());
        }

        if (userDTO.getUsername() != null) {
            user.setUsername(userDTO.getUsername());
        }

        if (userDTO.getPhone() != null) {
            user.setPhone(userDTO.getPhone());
        }

        if (userDTO.getAvatarUrl() != null) {
            user.setAvatarUrl(userDTO.getAvatarUrl());
        }

        // ===============================
        // CẬP NHẬT ROLES NẾU CÓ
        // ===============================
        if (userDTO.getRoles() != null && !userDTO.getRoles().isEmpty()) {
            Set<RoleEntity> newRoles = userDTO.getRoles().stream()
                    .map(code -> {
                        UserRole userRole = UserRole.valueOf(code);
                        return roleRepository.findByRole(userRole)
                                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + code));
                    })
                    .collect(Collectors.toSet());
            user.setRoles(newRoles);
        }

        // update isActive
        if (userDTO.getIsActive() != null) {
            user.setIsActive(userDTO.getIsActive());
        }

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User createMentorUser(UserDTO userDTO, MentorDTO mentorDTO) {
        // 1. Kiểm tra user đã tồn tại chưa (theo email hoặc username)
        if (userDTO.getEmail() != null && userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }
        if (userDTO.getUsername() != null && userRepository.existsByUsername(userDTO.getUsername())) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }

        // 2. Tạo Set roles - luôn có MENTOR
        Set<RoleEntity> roles = new HashSet<>();
        RoleEntity mentorRole = roleRepository.findByRole(UserRole.MENTOR)
                .orElseThrow(() -> new ResourceNotFoundException("Role MENTOR not found"));

        roles.add(mentorRole);

        // Nếu DTO có thêm role khác, thêm vào
        if (userDTO.getRoles() != null && !userDTO.getRoles().isEmpty()) {
            userDTO.getRoles().stream()
                    .filter(code -> !UserRole.MENTOR.name().equals(code)) // tránh duplicate MENTOR
                    .map(code -> {
                        UserRole userRole = UserRole.valueOf(code);
                        return roleRepository.findByRole(userRole)
                                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + code));
                    })
                    .forEach(roles::add);
        }

        // 3. Tạo User
        User user = User.builder()
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .fullName(userDTO.getFullName())
                .phone(userDTO.getPhone())
                .username(userDTO.getUsername())
                .avatarUrl(userDTO.getAvatarUrl())
                .roles(roles)
                .isActive(userDTO.getIsActive() != null ? userDTO.getIsActive() : true)
                .emailVerified(userDTO.getEmailVerified() != null ? userDTO.getEmailVerified() : false)
                .emailVerifiedAt(userDTO.getEmailVerifiedAt())
                .lastLoginAt(userDTO.getLastLoginAt())
                .build();

        user = userRepository.save(user); // Lưu user trước để có ID

        // 4. Tạo Mentor profile và ánh xạ với user
        if (!mentorRepository.existsByUserId(user.getId())) {
            Mentor mentor = Mentor.builder()
                    .user(user) // ánh xạ 1-1 với User
                    .name(user.getFullName())
                    .status(Mentor.Status.AVAILABLE)
                    .expertise(mentorDTO.getExpertise() != null ? mentorDTO.getExpertise() : "")
                    .yearsExperience(mentorDTO.getYearsExperience() != null ? mentorDTO.getYearsExperience() : 0)
                    .bio(mentorDTO.getBio() != null ? mentorDTO.getBio() : "Mentor mới")
                    .rating(BigDecimal.ZERO)
                    .totalProjects(0)
                    .createdAt(LocalDateTime.now())
                    .build();

            mentorRepository.save(mentor);
            System.out.println("Đã tạo thành công Mentor profile cho user: " + user.getId());
        }

        return user;
    }
}
