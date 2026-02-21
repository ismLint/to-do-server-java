package org.webserver;

public record Task(Long id, String title, boolean completed) {
	public Task {
		if (title == null || title.isBlank()) {
			throw new IllegalArgumentException("Title cannot be null or blank");
		}
	}
	
	public Task(String title) {
		this(null, title, false);
	}
	
	public Task withCompleted(boolean completed) {
		return new Task(this.id, this.title, completed);
	}
	
	public Task withId(Long id) {
		return new Task(id, this.title, this.completed);
	}
}