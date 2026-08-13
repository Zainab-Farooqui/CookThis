package com.cookthis.backend.controller;

import com.cookthis.backend.dto.LoginRequest;
import com.cookthis.backend.dto.LoginResponse;
import com.cookthis.backend.dto.RegisterRequest;
import com.cookthis.backend.dto.RegisterResponse;
import com.cookthis.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public RegisterResponse registerUser(@Valid @RequestBody RegisterRequest request) {

        return userService.registerUser(request);

    }

    @PostMapping("/login")
    public LoginResponse loginUser(@Valid @RequestBody LoginRequest loginRequest) {

        return userService.loginUser(loginRequest);

    }

}