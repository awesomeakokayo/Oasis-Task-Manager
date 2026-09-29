package com.oasis.taskmanager.model;
import jakarta.persistence.*; import java.time.*;
@Entity public class Task { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; @Column(nullable=false) public String title; @Column(length=4000) public String description; public LocalDate dueDate; @Enumerated(EnumType.STRING) public Priority priority=Priority.MEDIUM; public boolean completed=false; public String category; public LocalDateTime reminderAt; @ManyToOne(fetch=FetchType.LAZY,optional=false) public User user; }
enum Priority { LOW,MEDIUM,HIGH }