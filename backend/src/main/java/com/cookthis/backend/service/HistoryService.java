package com.cookthis.backend.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cookthis.backend.dto.HistoryResponse;
import com.cookthis.backend.entity.SearchHistory;
import com.cookthis.backend.repository.SearchHistoryRepository;

@Service
public class HistoryService {

    private final SearchHistoryRepository historyRepository;

    public HistoryService(SearchHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    public void record(Long userId, List<String> ingredients, int resultCount, String topDish) {
        String joined = String.join(",", ingredients);
        if (joined.length() > 1000) {
            joined = joined.substring(0, 1000);
        }
        historyRepository.save(new SearchHistory(userId, joined, resultCount, topDish));
    }

    public List<HistoryResponse> list(Long userId) {
        return historyRepository.findTop30ByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(h -> new HistoryResponse(
                        h.getId(),
                        Arrays.stream(h.getIngredients().split(","))
                                .filter(s -> !s.isBlank())
                                .toList(),
                        h.getResultCount(),
                        h.getTopDish(),
                        h.getCreatedAt()))
                .toList();
    }

    @Transactional
    public void clear(Long userId) {
        historyRepository.deleteByUserId(userId);
    }
}
