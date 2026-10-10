package com.cookthis.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cookthis.backend.dto.FavoriteResponse;
import com.cookthis.backend.entity.Favorite;
import com.cookthis.backend.repository.FavoriteRepository;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;

    public FavoriteService(FavoriteRepository favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }

    public List<FavoriteResponse> list(Long userId) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(f -> new FavoriteResponse(f.getDishName(), f.getCreatedAt()))
                .toList();
    }

    // Adding the same dish twice is a no-op, so the heart button is safe to double-click.
    public void add(Long userId, String dishName) {
        String name = dishName.trim();
        if (!favoriteRepository.existsByUserIdAndDishName(userId, name)) {
            favoriteRepository.save(new Favorite(userId, name));
        }
    }

    @Transactional
    public void remove(Long userId, String dishName) {
        favoriteRepository.deleteByUserIdAndDishName(userId, dishName.trim());
    }
}
