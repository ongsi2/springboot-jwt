package com.example.jwt.controller;

import com.example.jwt.domain.User;
import com.example.jwt.dto.UserProfileDto;
import com.example.jwt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    private final com.example.jwt.service.RefreshTokenService refreshTokenService;

    @GetMapping("/users")
    public ResponseEntity<List<UserProfileDto>> getAllUsers() {
        List<UserProfileDto> users = userRepository.findAll().stream()
                .map(user -> UserProfileDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/users/{username}/kick")
    public ResponseEntity<String> kickUser(@org.springframework.web.bind.annotation.PathVariable String username) {
        refreshTokenService.deleteByUsername(username);
        return ResponseEntity.ok("User " + username + " has been kicked (Refresh Token revoked).");
    }
}
