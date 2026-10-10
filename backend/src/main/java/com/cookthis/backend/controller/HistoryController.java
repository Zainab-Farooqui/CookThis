package com.cookthis.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.cookthis.backend.dto.HistoryResponse;
import com.cookthis.backend.service.HistoryService;
import com.cookthis.backend.service.TokenService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final HistoryService historyService;
    private final TokenService tokenService;

    public HistoryController(HistoryService historyService, TokenService tokenService) {
        this.historyService = historyService;
        this.tokenService = tokenService;
    }

    @GetMapping
    public List<HistoryResponse> list(@RequestHeader(value = "Authorization", required = false) String auth) {
        return historyService.list(tokenService.requireUserId(auth));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clear(@RequestHeader(value = "Authorization", required = false) String auth) {
        historyService.clear(tokenService.requireUserId(auth));
    }
}
