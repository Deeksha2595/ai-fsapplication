package com.example.auth.util;

import java.security.Key;
import java.time.Instant;
import java.util.Date;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import com.example.auth.entity.User;

@Component
public class JwtUtil {

    private final Key key;
    private final long expirationSeconds;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expirationSeconds:3600}") long expirationSeconds) {
            if (secret == null || secret.trim().isEmpty()) {
                throw new IllegalStateException("JWT secret is required. Set the environment variable JWT_SECRET to a secure value (at least 32 bytes).");
            }

            byte[] keyBytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            if (keyBytes.length < 32) {
                throw new IllegalStateException("JWT secret must be at least 32 bytes long for HS256. Current length: " + keyBytes.length);
            }

            // Use HMAC-SHA256
            this.key = new SecretKeySpec(keyBytes, SignatureAlgorithm.HS256.getJcaName());
            this.expirationSeconds = expirationSeconds;
        }

    public String generateToken(User user) {
        Instant now = Instant.now();
        Date issuedAt = Date.from(now);
        Date expiresAt = Date.from(now.plusSeconds(expirationSeconds));

        // Minimal claims: subject as user id
        return Jwts.builder()
                .setSubject(user.getId().toString())
                .setIssuedAt(issuedAt)
                .setExpiration(expiresAt)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    /**
     * Validate the token signature and expiration and return the subject as a user id.
     * @param token the JWT token string
     * @return user id parsed from subject
     */
    public Long validateAndExtractUserId(String token) {
        var claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        String subject = claims.getSubject();
        if (subject == null) throw new IllegalArgumentException("JWT subject (user id) is missing");
        try {
            return Long.valueOf(subject);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid user id in JWT subject", ex);
        }
    }
}

