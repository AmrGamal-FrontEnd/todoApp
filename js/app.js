class TodoApp {
            constructor() {
                this.todos = this.getTodos();
                this.editingIndex = -1;
                this.init();
            }

            init() {
                this.todoForm = document.getElementById('todo-form');
                this.todoInput = document.getElementById('todo-input');
                this.todoList = document.getElementById('todo-list');

                this.todoForm.addEventListener('submit', (e) => this.handleSubmit(e));
                this.updateTodoList();
            }

            handleSubmit(e) {
                e.preventDefault();
                this.addTodo();
            }

            addTodo() {
                const todoText = this.todoInput.value.trim();
                if (todoText.length > 0) {
                    const todoObject = {
                        id: Date.now(),
                        text: todoText,
                        completed: false
                    };
                    this.todos.push(todoObject);
                    this.updateTodoList();
                    this.saveTodos();
                    this.todoInput.value = "";
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
                todoLI.className = "todo";
                
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
                    <input type="checkbox" id="todo-${index}" ${todo.completed ? 'checked' : ''}>
                    <label for="todo-${index}" class="custom-checkbox">
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                            <path d="M1 4.5L4.5 8L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </label>
                    <div class="todo-text">${todo.text}</div>
                    <div class="todo-actions">
                        <button class="edit-button" data-index="${index}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                        </button>
                        <button class="delete-button" data-index="${index}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                    </div>
                `;
            }

            getEditTemplate(todo, index) {
                return `
                    <input class="edit-input" type="text" value="${todo.text}" data-index="${index}" maxlength="100">
                    <div class="todo-actions">
                        <button class="save-button" data-index="${index}">Save</button>
                        <button class="cancel-button" data-index="${index}">Cancel</button>
                    </div>
                `;
            }

            attachTodoListeners(todoLI, index) {
                const checkbox = todoLI.querySelector('input[type="checkbox"]');
                const editButton = todoLI.querySelector('.edit-button');
                const deleteButton = todoLI.querySelector('.delete-button');

                checkbox.addEventListener('change', () => {
                    this.todos[index].completed = checkbox.checked;
                    this.saveTodos();
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
                if (trimmedText.length > 0) {
                    this.todos[index].text = trimmedText;
                    this.saveTodos();
                }
                this.editingIndex = -1;
                this.updateTodoList();
            }

            cancelEdit() {
                this.editingIndex = -1;
                this.updateTodoList();
            }

            deleteTodo(index) {
                this.todos.splice(index, 1);
                this.saveTodos();
                this.updateTodoList();
            }

            saveTodos() {
                // Note: In Claude.ai artifacts, data won't persist between sessions
                // But the app will work during the current session
                try {
                    localStorage.setItem("todos", JSON.stringify(this.todos));
                } catch (error) {
                    console.log("LocalStorage not available, using session storage only");
                }
            }

            getTodos() {
                try {
                    const todos = localStorage.getItem("todos");
                    return todos ? JSON.parse(todos) : [];
                } catch (error) {
                    console.log("LocalStorage not available, starting with empty todos");
                    return [];
                }
            }
        }

        // Initialize the todo app when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new TodoApp();
        });