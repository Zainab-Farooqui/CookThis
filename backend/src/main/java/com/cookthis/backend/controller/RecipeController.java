package com.cookthis.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

/**
 * Forwards "which dishes can I cook?" requests to the Python ML service
 * (ml-service/app.py) and returns its answer to the React frontend.
 */
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RestTemplate restTemplate;
    private final String mlServiceUrl;

    public RecipeController(@Value("${ml.service.url:http://localhost:8000}") String mlServiceUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(15000);
        this.restTemplate = new RestTemplate(factory);
        this.mlServiceUrl = mlServiceUrl;
    }

    @PostMapping("/recommend")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> recommend(@RequestBody Map<String, Object> request) {
        Object ingredients = request.get("ingredients");
        if (!(ingredients instanceof List<?> list) || list.isEmpty()) {
            return error(HttpStatus.BAD_REQUEST, "Please select at least one ingredient.");
        }

        try {
            Map<String, Object> body = restTemplate.postForObject(
                    mlServiceUrl + "/recommend", request, Map.class);
            return ResponseEntity.ok(body);
        } catch (ResourceAccessException e) {
            return error(HttpStatus.SERVICE_UNAVAILABLE,
                    "The recommendation service is not running. Start it with: python app.py (in ml-service).");
        } catch (RestClientResponseException e) {
            return error(HttpStatus.BAD_GATEWAY,
                    "The recommendation service returned an error (" + e.getStatusCode().value() + ").");
        }
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message));
    }
}
