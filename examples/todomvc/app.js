(function() {
    const { createElement, state, init } = MiniFrame;

    // Initialize state
    state.setState({
        todos: [],
        filter: 'all',
        newTodo: '',
        editingId: null,
        editingText: ''
    });

    let todoId = 1;

    // Helper functions
    function addTodo(text) {
        if (text.trim()) {
            const todos = state.getState().todos;
            todos.push({
                id: todoId++,
                text: text.trim(),
                completed: false
            });
            state.setState({ todos, newTodo: '' });
        }
    }

    function toggleTodo(id) {
        const todos = state.getState().todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        state.setState({ todos });
    }

    function deleteTodo(id) {
        const todos = state.getState().todos.filter(todo => todo.id !== id);
        state.setState({ todos });
    }

    function editTodo(id, newText) {
        if (newText.trim()) {
            const todos = state.getState().todos.map(todo =>
                todo.id === id ? { ...todo, text: newText.trim() } : todo
            );
            state.setState({ todos, editingId: null, editingText: '' });
        } else {
            // Delete todo if text is empty
            deleteTodo(id);
        }
    }

    function toggleAll() {
        const { todos } = state.getState();
        const allCompleted = todos.every(todo => todo.completed);
        const updatedTodos = todos.map(todo => ({ ...todo, completed: !allCompleted }));
        state.setState({ todos: updatedTodos });
    }

    function clearCompleted() {
        const todos = state.getState().todos.filter(todo => !todo.completed);
        state.setState({ todos });
    }

    function setFilter(newFilter) {
        const currentState = state.getState();
        if (currentState.filter !== newFilter) {
            state.setState({ filter: newFilter });
        }
    }

    // Debounced input handler to prevent excessive re-renders
    let inputTimeout;
    function handleNewTodoInput(value) {
        // Update the input value immediately (optimistic update)
        const newTodoInput = document.querySelector('.new-todo');
        if (newTodoInput) {
            newTodoInput.value = value;
        }
        
        // Debounce the state update to prevent constant re-renders
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => {
            state.setState({ newTodo: value });
        }, 10); // Very short debounce, just to batch rapid keystrokes
    }

    function handleEditInput(value) {
        // Update the edit input value immediately
        const editInput = document.querySelector('.edit');
        if (editInput) {
            editInput.value = value;
        }
        
        // Update state without debouncing for edit input
        state.setState({ editingText: value });
    }

    // Components
    function TodoItem(todo) {
        const { editingId, editingText } = state.getState();
        const isEditing = editingId === todo.id;

        if (isEditing) {
            return createElement('li', { class: 'editing' }, [
                createElement('div', { class: 'view' }, [
                    createElement('input', {
                        class: 'toggle',
                        type: 'checkbox',
                        checked: todo.completed
                    }),
                    createElement('label', {}, todo.text),
                    createElement('button', { class: 'destroy' })
                ]),
                createElement('input', {
                    class: 'edit',
                    value: editingText !== '' ? editingText : todo.text,
                    onKeydown: (e) => {
                        if (e.key === 'Enter') {
                            editTodo(todo.id, e.target.value);
                        } else if (e.key === 'Escape') {
                            state.setState({ editingId: null, editingText: '' });
                        }
                    },
                    onInput: (e) => handleEditInput(e.target.value),
                    onBlur: (e) => editTodo(todo.id, e.target.value)
                })
            ]);
        }

        return createElement('li', {
            class: todo.completed ? 'completed' : ''
        }, [
            createElement('div', { class: 'view' }, [
                createElement('input', {
                    class: 'toggle',
                    type: 'checkbox',
                    checked: todo.completed,
                    onChange: () => toggleTodo(todo.id)
                }),
                createElement('label', {
                    onDblclick: () => {
                        state.setState({ 
                            editingId: todo.id, 
                            editingText: todo.text 
                        });
                        // Focus the edit input after state update
                        setTimeout(() => {
                            const editInput = document.querySelector('.edit');
                            if (editInput) {
                                editInput.focus();
                                editInput.select();
                            }
                        }, 0);
                    }
                }, todo.text),
                createElement('button', {
                    class: 'destroy',
                    onClick: () => deleteTodo(todo.id)
                })
            ])
        ]);
    }

    function TodoApp() {
        const { todos, filter, newTodo } = state.getState();
        
        const filteredTodos = todos.filter(todo => {
            if (filter === 'active') return !todo.completed;
            if (filter === 'completed') return todo.completed;
            return true;
        });

        const activeTodosCount = todos.filter(todo => !todo.completed).length;
        const completedTodosCount = todos.length - activeTodosCount;

        const elements = [
            createElement('header', { class: 'header' }, [
                createElement('h1', {}, 'todos'),
                createElement('input', {
                    class: 'new-todo',
                    placeholder: 'What needs to be done?',
                    value: newTodo,
                    autofocus: true,
                    onInput: (e) => {
                        e.preventDefault();
                        handleNewTodoInput(e.target.value);
                    },
                    onKeydown: (e) => {
                        if (e.key === 'Enter') {
                            addTodo(e.target.value);
                        }
                    }
                })
            ])
        ];

        if (todos.length > 0) {
            elements.push(
                createElement('section', { class: 'main' }, [
                    createElement('input', {
                        id: 'toggle-all',
                        class: 'toggle-all',
                        type: 'checkbox',
                        checked: todos.length > 0 && todos.every(todo => todo.completed),
                        onChange: toggleAll
                    }),
                    createElement('label', { for: 'toggle-all' }, 'Mark all as complete'),
                    createElement('ul', { class: 'todo-list' }, 
                        filteredTodos.map(todo => TodoItem(todo))
                    )
                ])
            );

            elements.push(
                createElement('footer', { class: 'footer' }, [
                    createElement('span', { class: 'todo-count' }, [
                        createElement('strong', {}, activeTodosCount.toString()),
                        ` item${activeTodosCount !== 1 ? 's' : ''} left`
                    ]),
                    createElement('ul', { class: 'filters' }, [
                        createElement('li', {}, [
                            createElement('a', {
                                href: '#/',
                                class: filter === 'all' ? 'selected' : ''
                            }, 'All')
                        ]),
                        createElement('li', {}, [
                            createElement('a', {
                                href: '#/active',
                                class: filter === 'active' ? 'selected' : ''
                            }, 'Active')
                        ]),
                        createElement('li', {}, [
                            createElement('a', {
                                href: '#/completed',
                                class: filter === 'completed' ? 'selected' : ''
                            }, 'Completed')
                        ])
                    ]),
                    completedTodosCount > 0 ? createElement('button', {
                        class: 'clear-completed',
                        onClick: clearCompleted
                    }, 'Clear completed') : null
                ].filter(Boolean))
            );
        }

        return createElement('div', {}, elements);
    }

    // Route handlers that don't cause re-renders
    function handleRouteChange() {
        const path = window.location.hash.slice(1) || '/';
        let newFilter = 'all';
        
        if (path === '/active') {
            newFilter = 'active';
        } else if (path === '/completed') {
            newFilter = 'completed';
        }
        
        // Only update filter if it actually changed
        setFilter(newFilter);
    }

    // Route configuration - components should not call setState during render
    const routes = [
        { 
            path: '/', 
            component: () => TodoApp()
        },
        { 
            path: '/active', 
            component: () => TodoApp()
        },
        { 
            path: '/completed', 
            component: () => TodoApp()
        },
        { 
            path: '*', 
            component: () => TodoApp()
        }
    ];

    // Handle route changes separately from rendering
    window.addEventListener('hashchange', handleRouteChange);
    
    // Set initial filter based on current hash
    handleRouteChange();

    // Initialize the app
    init({
        root: '#app',
        routes
    });

    // Preserve focus after re-renders
    let focusedElement = null;
    let cursorPosition = 0;

    // Before each render, save focus state
    const originalRender = state._subscribers[0];
    if (originalRender) {
        state._subscribers[0] = function(newState) {
            // Save focus state before render
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.classList.contains('new-todo') || activeElement.classList.contains('edit'))) {
                focusedElement = activeElement.className;
                cursorPosition = activeElement.selectionStart;
            }
            
            // Call original render
            originalRender.call(this, newState);
            
            // Restore focus after render
            setTimeout(() => {
                if (focusedElement) {
                    const elementToFocus = document.querySelector(`.${focusedElement}`);
                    if (elementToFocus) {
                        elementToFocus.focus();
                        if (typeof cursorPosition === 'number') {
                            elementToFocus.setSelectionRange(cursorPosition, cursorPosition);
                        }
                    }
                    focusedElement = null;
                    cursorPosition = 0;
                }
            }, 0);
        };
    }
})();
