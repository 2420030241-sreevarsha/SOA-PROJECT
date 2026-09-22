package com.academic.portfolio.controller;

import com.academic.portfolio.model.User;
import com.academic.portfolio.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            User user = userService.register(body.get("name"), body.get("email"), body.get("password"));
            return ResponseEntity.ok(Map.of(
                    "user", Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail()),
                    "token", "token-" + user.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            User user = userService.login(body.get("email"), body.get("password"));
            return ResponseEntity.ok(Map.of(
                    "user", Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail()),
                    "token", "token-" + user.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("message", "If an account exists with this email, a reset link has been dispatched."));
    }
}
