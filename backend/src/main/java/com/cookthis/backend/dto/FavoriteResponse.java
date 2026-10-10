package com.cookthis.backend.dto;

import java.time.LocalDateTime;

public record FavoriteResponse(String dishName, LocalDateTime createdAt) {
}
