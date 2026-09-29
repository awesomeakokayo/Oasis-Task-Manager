package com.oasis.taskmanager.controller;

import com.oasis.taskmanager.model.User;
import com.oasis.taskmanager.repository.UserRepository;
import com.oasis.taskmanager.security.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(
            UserRepository users,
            PasswordEncoder encoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.users = users;
        this.encoder = encoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public record Register(
            @NotBlank(message = "Name is required")
            @Size(max = 80, message = "Name must be 80 characters or fewer")
            String name,

            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
            String password) {}

    public record Login(
            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            String email,

            @NotBlank(message = "Password is required")
            String password) {}

    public record ProfileUpdate(
            @NotBlank(message = "Name is required")
            @Size(max = 80, message = "Name must be 80 characters or fewer")
            String name,

            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            String email) {}

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody Register request) {
        String email = normalizeEmail(request.email());

        if (users.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "An account with that email already exists."));
        }

        User user = new User();
        user.name = request.name().trim();
        user.email = email;
        user.password = encoder.encode(request.password());
        users.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authResponse(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody Login request) {
        String email = normalizeEmail(request.email());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));

        User user = users.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return ResponseEntity.ok(authResponse(user));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Principal principal) {
        User user = users.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return ResponseEntity.ok(userResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody ProfileUpdate request,
            Principal principal) {

        User user = users.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String email = normalizeEmail(request.email());

        if (!email.equals(user.email) && users.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "That email is already in use."));
        }

        user.name = request.name().trim();
        user.email = email;
        users.save(user);

        return ResponseEntity.ok(authResponse(user));
    }

    private Map<String, String> authResponse(User user) {
        return Map.of(
                "token", jwtService.generateToken(user.email),
                "name", user.name,
                "email", user.email
        );
    }

    private Map<String, String> userResponse(User user) {
        return Map.of(
                "name", user.name,
                "email", user.email
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
