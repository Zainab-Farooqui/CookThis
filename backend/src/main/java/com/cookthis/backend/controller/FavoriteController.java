package com.cookthis.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.cookthis.backend.dto.FavoriteRequest;
import com.cookthis.backend.dto.FavoriteResponse;
import com.cookthis.backend.service.FavoriteService;
import com.cookthis.backend.service.TokenService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final TokenService tokenService;

    public FavoriteController(FavoriteService favoriteService, TokenService tokenService) {
        this.favoriteService = favoriteService;
        this.tokenService = tokenService;
    }

    @GetMapping
    public List<FavoriteResponse> list(@RequestHeader(value = "Authorization", required = false) String auth) {
        return favoriteService.list(tokenService.requireUserId(auth));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void add(@RequestHeader(value = "Authorization", required = false) String auth,
                    @Valid @RequestBody FavoriteRequest request) {
        favoriteService.add(tokenService.requireUserId(auth), request.getDishName());
    }

    // Dish names can contain spaces/slashes, so the name travels as a query parameter.
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@RequestHeader(value = "Authorization", required = false) String auth,
                       @RequestParam String dishName) {
        favoriteService.remove(tokenService.requireUserId(auth), dishName);
    }
}
