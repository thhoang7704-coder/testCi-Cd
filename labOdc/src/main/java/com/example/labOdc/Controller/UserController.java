package com.example.labOdc.Controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.MentorDTO;
import com.example.labOdc.DTO.UserDTO;
import com.example.labOdc.DTO.Response.CreateMentorRequestDTO;
import com.example.labOdc.DTO.Response.UserResponse;
import com.example.labOdc.Model.User;
import com.example.labOdc.Service.UserService;

import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/users")
@PermitAll
@CrossOrigin("*")
public class UserController {
    private final UserService userService;

    @PostMapping("/")
    public ApiResponse<UserResponse> createUser(@Valid @RequestBody UserDTO userDTO, BindingResult result) {
        if (result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage).toList();
            return ApiResponse.error(errorMessages);
        }
        User user = userService.createUser(userDTO);
        return ApiResponse.success(UserResponse.fromUser(user), "Thanh cong", HttpStatus.CREATED);
    }

    @GetMapping("/")
    public ApiResponse<List<UserResponse>> getAllUser() {
        List<User> list = userService.getAllUser();
        return ApiResponse.success(list.stream().map(UserResponse::fromUser).toList(), "Thanh cong", HttpStatus.OK);
    }

    @PutMapping("/{id}/disable")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(String.format("Xoa thanh cong"));
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUserById(@PathVariable String id) {
        User user = userService.getUserById(id);
        return ApiResponse.success(UserResponse.fromUser(user), "Thanh cong", HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ApiResponse<UserResponse> updateUser(@Valid @RequestBody UserDTO userDTO, @PathVariable String id) {
        User user = userService.updateUser(userDTO, id);
        return ApiResponse.success(UserResponse.fromUser(user), "Thanh cong", HttpStatus.OK);
    }

    @PostMapping("/mentor")
    public ResponseEntity<ApiResponse<User>> createMentorUser(@Valid @RequestBody CreateMentorRequestDTO request,
            BindingResult result) {
        if (result.hasErrors()) {
            String errors = result.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(ApiResponse.error(errors));
        }

        // Map từ request sang UserDTO
        UserDTO userDTO = UserDTO.builder()
                .email(request.getEmail())
                .password(request.getPassword())
                .fullName(request.getFullName())
                .username(request.getUsername())
                .phone(request.getPhone())
                .avatarUrl(request.getAvatarUrl())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .emailVerified(request.getEmailVerified() != null ? request.getEmailVerified() : false)
                .emailVerifiedAt(request.getEmailVerifiedAt())
                .lastLoginAt(request.getLastLoginAt())
                .roles(request.getRoles()) // Nếu frontend gửi roles khác, sẽ được xử lý trong service
                .build();

        // Map từ request sang MentorDTO
        MentorDTO mentorDTO = MentorDTO.builder()
                .expertise(request.getExpertise())
                .yearsExperience(request.getYearsExperience())
                .bio(request.getBio())
                .build();

        // Gọi service
        User createdUser = userService.createMentorUser(userDTO, mentorDTO);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdUser, "Tạo mentor thành công (user + profile)", HttpStatus.CREATED));
    }
}
