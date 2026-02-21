package org.webserver;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class TaskService {
	
	private final ConcurrentHashMap<Long, Task> tasks = new ConcurrentHashMap<>();
	private final AtomicLong counter = new AtomicLong();
	
	public List<Task> getAllTasks() {
		return new ArrayList<>(tasks.values());
	}
	
	public Task getTaskById(Long id) {
		return tasks.get(id);
	}
	
	public Task createTask(String title) {
		if (title == null || title.isBlank()) {
			throw new IllegalArgumentException("Title cannot be null or blank");
		}
		
		long id = counter.incrementAndGet();
		Task task = new Task(title).withId(id);
		tasks.put(id, task);
		return task;
	}
	
	public Task updateTask(Long id, String newTitle, Boolean completed) {
		Task existingTask = tasks.get(id);
		if (existingTask == null ) {
			return null;
		}
		
		String title = newTitle != null ? newTitle : existingTask.title();
		boolean isCompleted = completed != null ? completed : existingTask.completed();
		Task updateTask = existingTask.withCompleted(isCompleted).withId(id);
		if (!updateTask.title().equals(existingTask.title())) {
			updateTask = new Task(id, title, isCompleted);
		}
		tasks.put(id, updateTask);
		return updateTask;
	}
	
	public boolean deleteTask(Long id) {
		return tasks.remove(id) != null;
	}
}