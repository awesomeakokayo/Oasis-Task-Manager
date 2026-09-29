package com.oasis.taskmanager.controller;
import org.springframework.web.bind.annotation.*; import org.springframework.http.*; import com.oasis.taskmanager.model.Task; import com.oasis.taskmanager.repository.*;
import java.util.*;
@RestController @RequestMapping("/api/tasks") public class TaskController {
 private final TaskRepository tasks; private final UserRepository users;
 public TaskController(TaskRepository t,UserRepository u){tasks=t;users=u;}
 private Long uid(String email){return users.findByEmail(email).orElseThrow().id;}
 @GetMapping public List<Task> list(@RequestParam(defaultValue="") String q,java.security.Principal p){return tasks.search(uid(p.getName()),q);}
 @PostMapping public Task create(@RequestBody Task t,java.security.Principal p){t.id=null;t.user=users.findByEmail(p.getName()).orElseThrow();return tasks.save(t);}
 @PutMapping("/{id}") public Task update(@PathVariable Long id,@RequestBody Task body,java.security.Principal p){Task t=tasks.findByIdAndUserId(id,uid(p.getName())).orElseThrow();t.title=body.title;t.description=body.description;t.dueDate=body.dueDate;t.priority=body.priority;t.completed=body.completed;t.category=body.category;t.reminderAt=body.reminderAt;return tasks.save(t);}
 @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id,java.security.Principal p){tasks.delete(tasks.findByIdAndUserId(id,uid(p.getName())).orElseThrow());return ResponseEntity.noContent().build();}
}