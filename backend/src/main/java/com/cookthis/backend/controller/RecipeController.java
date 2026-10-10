package com.cookthis.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import com.cookthis.backend.service.HistoryService;
import com.cookthis.backend.service.TokenService;

/**
 * Forwards recipe requests to the Python ML service (ml-service/app.py) and returns
 * its answer to the React frontend. Logged-in searches are saved to the user's history.
 */
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RestTemplate restTemplate;
    private final String mlServiceUrl;
    private final TokenService tokenService;
    private final HistoryService historyService;

    public RecipeController(@Value("${ml.service.url:http://localhost:8000}") String mlServiceUrl,
                            TokenService tokenService,
                            HistoryService historyService) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(15000);
        this.restTemplate = new RestTemplate(factory);
        this.mlServiceUrl = mlServiceUrl;
        this.tokenService = tokenService;
        this.historyService = historyService;
    }

    @PostMapping("/recommend")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> recommend(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody Map<String, Object> request) {

        Object ingredients = request.get("ingredients");
        if (!(ingredients instanceof List<?> list) || list.isEmpty()) {
            return error(HttpStatus.BAD_REQUEST, "Please select at least one ingredient.");
        }

        try {
            Map<String, Object> body = restTemplate.postForObject(
                    mlServiceUrl + "/recommend", request, Map.class);
            saveToHistory(auth, list, body);
            return ResponseEntity.ok(body);
        } catch (ResourceAccessException e) {
            return error(HttpStatus.SERVICE_UNAVAILABLE,
                    "The recommendation service is not running. Start it with: python app.py (in ml-service).");
        } catch (HttpClientErrorException e) {
            // 4xx from the ML service means the request itself was bad (e.g. invalid sort value)
            return error(HttpStatus.BAD_REQUEST, "Invalid recommendation request.");
        } catch (RestClientResponseException e) {
            return error(HttpStatus.BAD_GATEWAY,
                    "The recommendation service returned an error (" + e.getStatusCode().value() + ").");
        }
    }

    /** Filter options (diets, courses, regions) for the UI dropdowns. */
    @GetMapping("/meta")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> meta() {
        try {
            return ResponseEntity.ok(restTemplate.getForObject(mlServiceUrl + "/meta", Map.class));
        } catch (ResourceAccessException e) {
            return error(HttpStatus.SERVICE_UNAVAILABLE, "The recommendation service is not running.");
        } catch (RestClientResponseException e) {
            return error(HttpStatus.BAD_GATEWAY, "The recommendation service returned an error.");
        }
    }

    /** Dishes similar to the given one. */
    @GetMapping("/similar")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> similar(@RequestParam String name,
                                                      @RequestParam(defaultValue = "6") int topN) {
        try {
            Map<String, Object> body = restTemplate.getForObject(
                    mlServiceUrl + "/similar?name={name}&topN={topN}", Map.class, name, topN);
            return ResponseEntity.ok(body);
        } catch (ResourceAccessException e) {
            return error(HttpStatus.SERVICE_UNAVAILABLE, "The recommendation service is not running.");
        } catch (HttpClientErrorException e) {
            return error(HttpStatus.NOT_FOUND, "We couldn't find that dish.");
        } catch (RestClientResponseException e) {
            return error(HttpStatus.BAD_GATEWAY, "The recommendation service returned an error.");
        }
    }

    // History is a nice-to-have: a bad/missing token or a DB hiccup must never break recommendations.
    @SuppressWarnings("unchecked")
    private void saveToHistory(String auth, List<?> ingredients, Map<String, Object> body) {
        try {
            Long userId = tokenService.parseUserId(auth);
            if (userId == null || body == null) {
                return;
            }
            List<Map<String, Object>> results = (List<Map<String, Object>>) body.get("results");
            int count = results == null ? 0 : results.size();
            String top = count > 0 ? String.valueOf(results.get(0).get("name")) : null;
            historyService.record(userId, ingredients.stream().map(String::valueOf).toList(), count, top);
        } catch (RuntimeException ignored) {
            // intentionally swallowed
        }
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message));
    }
}
