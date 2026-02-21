document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const newTaskInput = document.getElementById('newTaskInput');
    const taskList = document.getElementById('taskList');
    const statusMessage = document.getElementById('statusMessage');
    const totalCountSpan = document.getElementById('totalCount');
    const completedCountSpan = document.getElementById('completedCount');

    let tasks = [];

    // Функция для обновления счетчиков
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        totalCountSpan.textContent = `Всего: ${total}`;
        completedCountSpan.textContent = `Выполнено: ${completed}`;
    }

    // Функция для отображения задач
    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.title}</span>
                <div class="task-actions">
                    <button class="delete-btn">🗑️ Удалить</button>
                </div>
            `;

            const checkbox = li.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => toggleComplete(task.id));

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            taskList.appendChild(li);
        });
        updateStats();
    }

    // Функция для получения всех задач с сервера
    async function loadTasks() {
        try {
            showStatus('', false); // Скрыть предыдущее сообщение
            const response = await fetch('/api/tasks');
            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
            tasks = await response.json();
            renderTasks();
        } catch (err) {
            console.error(err);
            showStatus(`Ошибка загрузки задач: ${err.message}`, 'error');
        }
    }

    // Обработчик формы добавления задачи
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = newTaskInput.value.trim();
        if (!title) {
            showStatus('Название задачи не может быть пустым.', 'error');
            return;
        }

        try {
            showStatus('', false);
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Ошибка: ${response.status}`);
            }

            const newTask = await response.json();
            tasks.push(newTask);
            renderTasks();
            newTaskInput.value = '';
            newTaskInput.focus(); // Фокус на поле ввода
            showStatus('✅ Задача успешно добавлена!', 'success');
        } catch (err) {
            console.error(err);
            showStatus(`Ошибка добавления задачи: ${err.message}`, 'error');
        }
    });

    // Функция для отметки задачи как выполненной
    async function toggleComplete(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newCompletedState = !task.completed;

        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: newCompletedState })
            });

            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

            task.completed = newCompletedState;
            renderTasks();
        } catch (err) {
            console.error(err);
            showStatus(`Ошибка обновления задачи: ${err.message}`, 'error');
            // Откатываем чекбокс в UI
            const checkbox = document.querySelector(`.task-item[data-id="${id}"] .task-checkbox`);
            if (checkbox) checkbox.checked = !newCompletedState;
        }
    }

    // Функция удаления задачи
    async function deleteTask(id) {
        const itemElement = document.querySelector(`.task-item[data-id="${id}"]`);
        if (!itemElement) return;

        // Анимация удаления
        itemElement.classList.add('removing');

        try {
            // Ждем завершения анимации перед отправкой запроса
            await new Promise(resolve => setTimeout(resolve, 300));

            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

            tasks = tasks.filter(task => task.id !== id);
            itemElement.remove(); // Удаляем элемент из DOM после ответа
            showStatus('✅ Задача удалена!', 'success');
            updateStats();
        } catch (err) {
            console.error(err);
            showStatus(`Ошибка удаления задачи: ${err.message}`, 'error');
            // Отменяем анимацию, если запрос не удался
            itemElement.classList.remove('removing');
        }
    }

    // Функция для отображения сообщений
    function showStatus(text, type) { // type: 'success', 'error', или false для скрытия
        statusMessage.textContent = text;
        statusMessage.className = 'status-message'; // Сбросить классы
        if (type) {
            statusMessage.classList.add(type);
        }
        if (text) {
            statusMessage.classList.add('show');
        }
        // Автоматически скрыть сообщение через 3 секунды, если это не ошибка
        if (type && type !== 'error') {
            setTimeout(() => {
                statusMessage.classList.remove('show');
            }, 3000);
        }
    }

    // Загружаем задачи при запуске
    loadTasks();
});