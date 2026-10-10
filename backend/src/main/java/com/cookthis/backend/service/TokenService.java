package com.cookthis.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.cookthis.backend.exception.UnauthorizedException;

/**
 * Issues and verifies small signed tokens ("userId:expiry" + HMAC-SHA256 signature).
 * No extra dependency needed. The frontend sends it as "Authorization: Bearer <token>".
 */
@Service
public class TokenService {

    private static final String HMAC = "HmacSHA256";

    private final byte[] secret;
    private final long ttlSeconds;

    public TokenService(@Value("${app.auth.secret:change-me-in-application-properties-please}") String secret,
                        @Value("${app.auth.ttl-hours:168}") long ttlHours) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.ttlSeconds = ttlHours * 3600;
    }

    public String generate(Long userId) {
        long expiresAt = Instant.now().getEpochSecond() + ttlSeconds;
        String payload = userId + ":" + expiresAt;
        String encoded = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        return encoded + "." + sign(encoded);
    }

    /** Returns the user id from an "Authorization" header value, or throws UnauthorizedException. */
    public Long requireUserId(String authorizationHeader) {
        Long id = parseUserId(authorizationHeader);
        if (id == null) {
            throw new UnauthorizedException("Please log in again.");
        }
        return id;
    }

    /** Returns the user id, or null when the header is missing, malformed, tampered with or expired. */
    public Long parseUserId(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authorizationHeader.substring(7).trim();
        int dot = token.indexOf('.');
        if (dot <= 0) {
            return null;
        }
        String encoded = token.substring(0, dot);
        String signature = token.substring(dot + 1);

        boolean validSignature = MessageDigest.isEqual(
                sign(encoded).getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8));
        if (!validSignature) {
            return null;
        }

        try {
            String payload = new String(Base64.getUrlDecoder().decode(encoded), StandardCharsets.UTF_8);
            String[] parts = payload.split(":");
            long expiresAt = Long.parseLong(parts[1]);
            if (Instant.now().getEpochSecond() > expiresAt) {
                return null;
            }
            return Long.parseLong(parts[0]);
        } catch (RuntimeException e) {
            return null;
        }
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC);
            mac.init(new SecretKeySpec(secret, HMAC));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Could not sign token", e);
        }
    }
}
