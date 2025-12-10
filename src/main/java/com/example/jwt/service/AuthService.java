package com.example.jwt.service;

import com.example.jwt.domain.RefreshToken;
import com.example.jwt.domain.User;
import com.example.jwt.dto.request.LoginRequest;
import com.example.jwt.dto.request.RegisterRequest;
import com.example.jwt.dto.response.AuthResponse;
import com.example.jwt.repository.UserRepository;
import com.example.jwt.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final RedisUtil redisUtil;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        String token = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(request.getUsername());

        return new AuthResponse(token, refreshToken.getToken());
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .build();

        userRepository.save(user);
    }

    public com.example.jwt.dto.response.TokenRefreshResponse refreshToken(
            com.example.jwt.dto.request.TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUsername)
                .map(username -> {
                    String accessToken = tokenProvider.generateTokenFromUsername(username);
                    return new com.example.jwt.dto.response.TokenRefreshResponse(accessToken, requestRefreshToken);
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    public void logout(String accessToken, String username) {
        // 1. Delete Refresh Token from DB
        refreshTokenService.deleteByUsername(username);

        // 2. Blacklist Access Token
        long expiration = tokenProvider.getExpiration(accessToken);
        if (expiration > 0) {
            redisUtil.setDataExpire(accessToken, "logout", expiration);
        }
    }
}
