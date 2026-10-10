package com.cookthis.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record HistoryResponse(Long id, List<String> ingredients, int resultCount, String topDish,
                              LocalDateTime createdAt) {
}
