package com.cookthis.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "search_history")
public class SearchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // comma-separated ingredient names, e.g. "Onion,Tomato,Paneer"
    @Column(nullable = false, length = 1000)
    private String ingredients;

    @Column(name = "result_count")
    private int resultCount;

    @Column(name = "top_dish", length = 200)
    private String topDish;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public SearchHistory() {}

    public SearchHistory(Long userId, String ingredients, int resultCount, String topDish) {
        this.userId = userId;
        this.ingredients = ingredients;
        this.resultCount = resultCount;
        this.topDish = topDish;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getIngredients() {
        return ingredients;
    }

    public int getResultCount() {
        return resultCount;
    }

    public String getTopDish() {
        return topDish;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
