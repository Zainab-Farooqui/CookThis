package com.cookthis.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cookthis.backend.entity.Favorite;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndDishName(Long userId, String dishName);

    void deleteByUserIdAndDishName(Long userId, String dishName);
}
