package com.cookthis.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FavoriteRequest {

    @NotBlank(message = "Dish name is required")
    @Size(max = 200, message = "Dish name is too long")
    private String dishName;

    public FavoriteRequest() {
    }

    public String getDishName() {
        return dishName;
    }

    public void setDishName(String dishName) {
        this.dishName = dishName;
    }
}
