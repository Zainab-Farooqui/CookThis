package com.cookthis.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cookthis.backend.entity.SearchHistory;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {

    List<SearchHistory> findTop30ByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByUserId(Long userId);
}
