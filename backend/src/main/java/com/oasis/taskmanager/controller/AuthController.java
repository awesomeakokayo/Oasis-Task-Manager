package com.oasis.taskmanager.controller;
import org.springframework.web.bind.annotation.*; import org.springframework.http.*; import org.springframework.security.crypto.password.PasswordEncoder; import com.oasis.taskmanager.repository.UserRepository; import com.oasis.taskmanager.model.User; import java.util.*;
@RestController @RequestMapping("/api/auth") public class AuthController {
 private final UserRepository users; private final PasswordEncoder encoder;
 public AuthController(UserRepository u,PasswordEncoder e){users=u;encoder=e;}
 record Register(String name,String email,String password){}
 @PostMapping("/register") public ResponseEntity<?> register(@RequestBody Register r){if(r.name()==null||r.email()==null||r.password()==null||r.password().length()<8)return ResponseEntity.badRequest().body(Map.of("message","Valid name, email and 8+ character password required"));if(users.findByEmail(r.email().toLowerCase()).isPresent())return ResponseEntity.status(409).body(Map.of("message","Email already registered"));User u=new User();u.name=r.name();u.email=r.email().toLowerCase();u.password=encoder.encode(r.password());users.save(u);return ResponseEntity.status(201).body(Map.of("message","Registration successful"));}}
