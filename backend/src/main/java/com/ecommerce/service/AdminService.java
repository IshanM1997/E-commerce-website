package com.ecommerce.service;

import com.ecommerce.dto.UserDto;
import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired private UserRepository userRepository;

    public List<UserDto> getPendingUsers() {
        return userRepository.findByApprovedFalse().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public UserDto approveUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setApproved(true);
        user.setEnabled(true);
        return toDto(userRepository.save(user));
    }

    public UserDto rejectUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setApproved(false);
        user.setEnabled(false);
        return toDto(userRepository.save(user));
    }

    public UserDto changeUserRole(Long userId, String role) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(Role.valueOf(role.toUpperCase()));
        return toDto(userRepository.save(user));
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .approved(user.isApproved())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
