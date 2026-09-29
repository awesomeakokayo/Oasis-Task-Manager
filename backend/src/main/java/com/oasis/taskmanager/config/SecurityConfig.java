package com.oasis.taskmanager.config;
import org.springframework.context.annotation.*; import org.springframework.security.config.annotation.web.builders.HttpSecurity; import org.springframework.security.web.SecurityFilterChain; import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import org.springframework.security.crypto.password.PasswordEncoder;
@Configuration public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
 @Bean SecurityFilterChain filterChain(HttpSecurity http)throws Exception{http.csrf(c->c.disable()).cors(c->{}).authorizeHttpRequests(a->a.requestMatchers("/api/auth/**").permitAll().anyRequest().authenticated()).httpBasic(h->{});return http.build();}
}