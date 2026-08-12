package com.example.auth.dto;

import java.time.LocalDateTime;

public record SignUpResponse(Long id, String name, String email, LocalDateTime createdAt) {
}
