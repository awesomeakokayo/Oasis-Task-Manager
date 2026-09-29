package com.oasis.taskmanager.controller;

import com.oasis.taskmanager.model.Task;
import com.oasis.taskmanager.repository.TaskRepository;
import com.oasis.taskmanager.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository tasks;
    private final UserRepository users;

    public TaskController(TaskRepository tasks, UserRepository users) {
        this.tasks = tasks;
        this.users = users;
    }

    private Long userId(String email) {
        return users.findByEmail(email)
                .orElseThrow()
                .id;
    }

    @GetMapping
    public List<Task> list(
            @RequestParam(defaultValue = "") String q,
            Principal principal) {
        return tasks.search(userId(principal.getName()), q.trim());
    }

    @PostMapping
    public Task create(
            @Valid @RequestBody Task task,
            Principal principal) {
        task.id = null;
        task.user = users.findByEmail(principal.getName()).orElseThrow();
        return tasks.save(task);
    }

    @PutMapping("/{id}")
    public Task update(
            @PathVariable Long id,
            @Valid @RequestBody Task body,
            Principal principal) {

        Task task = tasks.findByIdAndUserId(id, userId(principal.getName()))
                .orElseThrow();

        task.title = body.title;
        task.description = body.description;
        task.dueDate = body.dueDate;
        task.priority = body.priority;
        task.completed = body.completed;
        task.category = body.category;
        task.reminderAt = body.reminderAt;

        return tasks.save(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Principal principal) {

        tasks.delete(tasks.findByIdAndUserId(id, userId(principal.getName()))
                .orElseThrow());

        return ResponseEntity.noContent().build();
    }
}
