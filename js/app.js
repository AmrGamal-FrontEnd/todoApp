 class TodoApp {
            constructor() {
                this.todos = [];
                this.editingIndex = -1;
                this.init();
            }

            init() {
                this.todoForm = document.getElementById('todo-form');
                this.todoInput = document.getElementById('todo-input');
                this.todoList = document.getElementById('todo-list');
                this.alertContainer = document.getElementById('alert-container');

                this.todoForm.addEventListener('submit', (e) => this.handleSubmit(e));
                this.updateTodoList();
                this.updateStats();
            }

            showAlert(message, type = 'warning', duration = 1000) {
                const alertId = 'alert-' + Date.now();
                const alertHTML = `
                    <div class="alert alert-${type} alert-dismissible fade show fade-in rounded-3" role="alert" id="${alertId}">
                        <strong>${type === 'warning' ? '⚠️' : '✅'}</strong> ${message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
                
                this.alertContainer.insertAdjacentHTML('beforeend', alertHTML);
                
                // Auto-dismiss after duration
                setTimeout(() => {
                    const alertElement = document.getElementById(alertId);
                    if (alertElement) {
                        // Add fade-out class and remove element
                        alertElement.style.transition = 'opacity 0.3s ease';
                        alertElement.style.opacity = '0';
                        setTimeout(() => {
                            alertElement.remove();
                        }, 300);
                    }
                }, duration);
            }

            handleSubmit(e) {
                e.preventDefault();
                const todoText = this.todoInput.value.trim();
                
                if (todoText.length === 0) {
                    this.showAlert('Please enter a task before adding it to your list!', 'warning');
                    this.todoInput.focus();
                    return;
                }
                
                if (todoText.length > 100) {
                    this.showAlert('Task is too long! Please keep it under 100 characters.', 'warning');
                    return;
                }

                this.addTodo();
            }

            addTodo() {
                const todoText = this.todoInput.value.trim();
                const todoObject = {
                    id: Date.now(),
                    text: todoText,
                    completed: false,
                    createdAt: new Date().toISOString()
                };
                
                this.todos.push(todoObject);
                this.updateTodoList();
                this.updateStats();
                this.todoInput.value = "";
                
                // Show success alert when task is added
                this.showAlert('Task added successfully! 🎉', 'success');
            }

            updateStats() {
                const total = this.todos.length;
                const completed = this.todos.filter(todo => todo.completed).length;
                const active = total - completed;

                document.getElementById('total-count').textContent = total;
                document.getElementById('active-count').textContent = active;
                document.getElementById('completed-count').textContent = completed;

                // Show/hide empty state
                const emptyState = document.getElementById('empty-state');
                if (total === 0) {
                    emptyState.classList.remove('hidden');
                    emptyState.classList.add('visible');
                } else {
                    emptyState.classList.remove('visible');
                    emptyState.classList.add('hidden');
                }
            }

            updateTodoList() {
                this.todoList.innerHTML = "";
                this.todos.forEach((todo, index) => {
                    const todoItem = this.createTodoItem(todo, index);
                    this.todoList.appendChild(todoItem);
                });
            }

            createTodoItem(todo, index) {
                const todoLI = document.createElement("li");
                todoLI.className = "todo rounded-3 p-3";
                
                if (this.editingIndex === index) {
                    todoLI.innerHTML = this.getEditTemplate(todo, index);
                    this.attachEditListeners(todoLI, index);
                } else {
                    todoLI.innerHTML = this.getTodoTemplate(todo, index);
                    this.attachTodoListeners(todoLI, index);
                }

                return todoLI;
            }

            getTodoTemplate(todo, index) {
                return `
                    <div class="d-flex align-items-center">
                        <input type="checkbox" id="todo-${index}" ${todo.completed ? 'checked' : ''}>
                        <label for="todo-${index}" class="custom-checkbox me-3">
                            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                                <path d="M1 4.5L4.5 8L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </label>
                        <div class="todo-text flex-grow-1 pe-3 fs-6">${todo.text}</div>
                        <div class="todo-actions d-flex gap-2">
                            <button class="btn edit-button p-2 rounded-2" data-index="${index}" title="Edit task">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                </svg>
                            </button>
                            <button class="btn delete-button p-2 rounded-2" data-index="${index}" title="Delete task">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            }

            getEditTemplate(todo, index) {
                return `
                    <div class="d-flex align-items-center gap-3">
                        <input class="form-control edit-input rounded-2 py-2 px-3 flex-grow-1" 
                               type="text" 
                               value="${todo.text}" 
                               data-index="${index}" 
                               maxlength="100">
                        <div class="d-flex gap-2">
                            <button class="btn save-button px-3 py-2 rounded-2 small" data-index="${index}">Save</button>
                            <button class="btn cancel-button px-3 py-2 rounded-2 small" data-index="${index}">Cancel</button>
                        </div>
                    </div>
                `;
            }

            attachTodoListeners(todoLI, index) {
                const checkbox = todoLI.querySelector('input[type="checkbox"]');
                const editButton = todoLI.querySelector('.edit-button');
                const deleteButton = todoLI.querySelector('.delete-button');

                checkbox.addEventListener('change', () => {
                    this.todos[index].completed = checkbox.checked;
                    this.updateStats();
                    this.showAlert(
                        checkbox.checked ? 'Task completed! 🎉' : 'Task marked as active',
                        'info'
                    );
                });

                editButton.addEventListener('click', () => {
                    this.startEdit(index);
                });

                deleteButton.addEventListener('click', () => {
                    this.deleteTodo(index);
                });
            }

            attachEditListeners(todoLI, index) {
                const editInput = todoLI.querySelector('.edit-input');
                const saveButton = todoLI.querySelector('.save-button');
                const cancelButton = todoLI.querySelector('.cancel-button');

                editInput.focus();
                editInput.setSelectionRange(editInput.value.length, editInput.value.length);

                editInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.saveEdit(index, editInput.value);
                    } else if (e.key === 'Escape') {
                        this.cancelEdit();
                    }
                });

                saveButton.addEventListener('click', () => {
                    this.saveEdit(index, editInput.value);
                });

                cancelButton.addEventListener('click', () => {
                    this.cancelEdit();
                });
            }

            startEdit(index) {
                this.editingIndex = index;
                this.updateTodoList();
            }

            saveEdit(index, newText) {
                const trimmedText = newText.trim();
                if (trimmedText.length === 0) {
                    this.showAlert('Task cannot be empty!', 'warning');
                    return;
                }
                if (trimmedText.length > 100) {
                    this.showAlert('Task is too long! Please keep it under 100 characters.', 'warning');
                    return;
                }
                
                this.todos[index].text = trimmedText;
                this.editingIndex = -1;
                this.updateTodoList();
                this.showAlert('Task updated successfully!', 'success');
            }

            cancelEdit() {
                this.editingIndex = -1;
                this.updateTodoList();
            }

            deleteTodo(index) {
                this.todos.splice(index, 1);
                this.updateTodoList();
                this.updateStats();
                this.showAlert('Task deleted successfully!', 'danger');
            }
        }

        // Theme toggle functionality
        function toggleTheme() {
            const body = document.body;
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', newTheme);
        }

        // Initialize the todo app when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new TodoApp();
        });