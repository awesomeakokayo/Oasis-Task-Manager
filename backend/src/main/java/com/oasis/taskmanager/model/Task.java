package com.oasis.taskmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotBlank(message = "Task title is required")
    @Size(max = 120, message = "Task title must be 120 characters or fewer")
    @Column(nullable = false)
    public String title;

    @Size(max = 4000, message = "Description must be 4000 characters or fewer")
    @Column(length = 4000)
    public String description;

    public LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    public Priority priority = Priority.MEDIUM;

    public boolean completed = false;

    public String category;

    public LocalDateTime reminderAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    public User user;
}

enum Priority {
    LOW, MEDIUM, HIGH
}
