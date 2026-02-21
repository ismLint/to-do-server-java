package org.webserver;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController 
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired 
    private TaskService taskService;


    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        if (task != null) {
            return ResponseEntity.ok(task);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/")
    public String home() {
        return """
            <html>
            <head><title>ToDo API</title></head>
            <body>
                <h1>Spring Boot ToDo API готов!</h1>
                <p>Доступные эндпоинты:</p>
                <ul>
                    <li><strong>GET /api/tasks</strong> — список задач</li>
                    <li><strong>POST /</strong> — создать задачу</li>
                    <li><strong>GET /api/tasks/{id}</strong> — получить задачу по ID</li>
                    <li><strong>PUT /api/tasks/{id}</strong> — обновить задачу</li>
                    <li><strong>DELETE /api/tasks/{id}</strong> — удалить задачу</li>
                </ul>
                <p>Попробуйте в Postman или curl.</p>
            </body>
            </html>
            """;
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task newTask) { 
        try {
            Task createdTask = taskService.createTask(newTask.title());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task inputTask) {
        Task updatedTask = taskService.updateTask(id, inputTask.title(), inputTask.completed());
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        boolean deleted = taskService.deleteTask(id);
        if (deleted) {
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }
}