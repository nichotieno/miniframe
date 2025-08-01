# MiniFrame Documentation

A lightweight JavaScript framework for building modern web applications with DOM abstraction, routing, state management, and event handling.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Quick Start](#quick-start)
3. [Core Concepts](#core-concepts)
4. [API Reference](#api-reference)
5. [Project Structure](#project-structure)
6. [Building Applications](#building-applications)
7. [TodoMVC Example](#todomvc-example)
8. [Advanced Usage](#advanced-usage)

## Installation & Setup

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installing MiniFrame CLI

```bash
npm install -g minfred
```

### Creating a New Project

```bash
minfred create my-app
cd my-app
npm install
npm start
```

This will:

- Create a new project directory with the proper folder structure
- Install the MiniFrame framework
- Set up a basic application template
- Start a development server on `http://localhost:3000`

## Quick Start

### Basic Application Structure

After creating a project, you'll have this folder structure:

```
my-app/
├── dist/
│   └── miniframe.js          # The MiniFrame framework
├── src/
│   ├── pages/
│   │   └── index.js          # Home page component
│   ├── components/           # Reusable components
│   ├── app.js               # Route definitions
│   └── index.html           # Entry point HTML
├── package.json
└── README.md
```

### Your First Component

Create a simple component in `src/pages/hello.js`:

```javascript
import { createElement, state } from '../../dist/miniframe.js';

export default function Hello() {
  return createElement('div', { class: 'hello' }, [
    createElement('h1', {}, 'Hello, MiniFrame!'),
    createElement('p', {}, 'Welcome to your new application.')
  ]);
}
```

### Adding Routes

Update `src/app.js` to include your new page:

```javascript
(function() {
  const { init } = MiniFrame;

  const routes = [
    { path: '/', component: () => import('./pages/index.js').then(m => m.default) },
    { path: '/hello', component: () => import('./pages/hello.js').then(m => m.default) },
    { path: '*', component: () => import('./pages/index.js').then(m => m.default) }
  ];

  init({
    root: '#app',
    routes
  });
})();
```

### Update HTML Entry Point

Modify `src/index.html` to include your app container:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>My MiniFrame App</title>
</head>
<body>
  <div id="app"></div>
  <script src="../dist/miniframe.js"></script>
  <script type="module" src="app.js"></script>
</body>
</html>
```

## Core Concepts

### 1. DOM Abstraction

MiniFrame provides a `createElement` function that creates DOM elements programmatically:

```javascript
import { createElement } from '../dist/miniframe.js';

// Create a simple div
const div = createElement('div', { class: 'container' }, 'Hello World');

// Create nested elements
const form = createElement('form', { class: 'user-form' }, [
  createElement('input', { 
    type: 'text', 
    placeholder: 'Enter your name',
    onInput: (e) => console.log(e.target.value)
  }),
  createElement('button', { 
    type: 'submit',
    onClick: (e) => e.preventDefault()
  }, 'Submit')
]);
```

### 2. State Management

MiniFrame includes a reactive state management system:

```javascript
import { state } from '../dist/miniframe.js';

// Set initial state
state.setState({ count: 0, user: null });

// Get current state
const currentState = state.getState();

// Update state (triggers re-render)
state.setState({ count: currentState.count + 1 });

// Subscribe to state changes
const unsubscribe = state.subscribe((newState) => {
  console.log('State updated:', newState);
});

// Unsubscribe when needed
unsubscribe();
```

### 3. Routing System

Hash-based routing that syncs with application state:

```javascript
const routes = [
  { path: '/', component: HomeComponent },
  { path: '/about', component: AboutComponent },
  { path: '/users/:id', component: UserComponent },
  { path: '*', component: NotFoundComponent } // Wildcard route
];
```

### 4. Event Handling

Two ways to handle events:

**Method 1: Inline event handlers**

```javascript
createElement('button', {
  onClick: (e) => {
    console.log('Button clicked!');
  }
}, 'Click me');
```

**Method 2: Global event delegation**

```javascript
import { events } from '../dist/miniframe.js';

events.on('click', '.my-button', (e) => {
  console.log('Button with class "my-button" clicked');
});
```

## API Reference

### `createElement(tag, props, children)`

Creates a DOM element with the specified properties and children.

**Parameters:**

- `tag` (string): HTML tag name
- `props` (object): Element properties and attributes
- `children` (string|array): Child elements or text content

**Props Object:**

- `className` or `class`: CSS class names
- `style`: Inline styles (object)
- `onClick`, `onInput`, etc.: Event handlers
- `value`, `checked`: Form element properties
- Any other attribute

**Example:**

```javascript
const button = createElement('button', {
  class: 'btn btn-primary',
  style: { backgroundColor: 'blue', color: 'white' },
  onClick: () => alert('Clicked!'),
  'data-id': '123'
}, 'Click Me');
```

### `state.setState(newState)`

Updates the application state and triggers re-render.

**Parameters:**

- `newState` (object): Partial state object to merge

### `state.getState()`

Returns a copy of the current application state.

### `state.subscribe(callback)`

Subscribes to state changes.

**Parameters:**

- `callback` (function): Function called when state changes

**Returns:** Unsubscribe function

### `init({ root, routes })`

Initializes the MiniFrame application.

**Parameters:**

- `root` (string): CSS selector for the root element
- `routes` (array): Array of route objects

### `events.on(event, selector, handler)`

Adds a delegated event listener.

**Parameters:**

- `event` (string): Event type (e.g., 'click', 'input')
- `selector` (string): CSS selector for target elements
- `handler` (function): Event handler function

## Building Applications

### Creating Components

Components are functions that return DOM elements:

```javascript
// src/components/Counter.js
import { createElement, state } from '../../dist/miniframe.js';

export default function Counter() {
  const { count = 0 } = state.getState();
  
  return createElement('div', { class: 'counter' }, [
    createElement('h2', {}, `Count: ${count}`),
    createElement('button', {
      onClick: () => state.setState({ count: count + 1 })
    }, '+'),
    createElement('button', {
      onClick: () => state.setState({ count: count - 1 })
    }, '-')
  ]);
}
```

### Creating Pages

Pages are components that represent entire routes:

```javascript
// src/pages/about.js
import { createElement } from '../../dist/miniframe.js';
import Navigation from '../components/Navigation.js';

export default function About() {
  return createElement('div', { class: 'page about-page' }, [
    Navigation(),
    createElement('main', {}, [
      createElement('h1', {}, 'About Us'),
      createElement('p', {}, 'This is the about page.')
    ])
  ]);
}
```

### Working with Forms

```javascript
// src/components/ContactForm.js
import { createElement, state } from '../../dist/miniframe.js';

export default function ContactForm() {
  const { formData = { name: '', email: '' } } = state.getState();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting:', formData);
    // Handle form submission
  };
  
  const updateField = (field) => (e) => {
    state.setState({
      formData: { ...formData, [field]: e.target.value }
    });
  };
  
  return createElement('form', { onSubmit: handleSubmit }, [
    createElement('input', {
      type: 'text',
      placeholder: 'Name',
      value: formData.name,
      onInput: updateField('name')
    }),
    createElement('input', {
      type: 'email',
      placeholder: 'Email',
      value: formData.email,
      onInput: updateField('email')
    }),
    createElement('button', { type: 'submit' }, 'Submit')
  ]);
}
```

### Navigation Between Pages

```javascript
// src/components/Navigation.js
import { createElement } from '../../dist/miniframe.js';

export default function Navigation() {
  return createElement('nav', { class: 'navigation' }, [
    createElement('a', { href: '#/' }, 'Home'),
    createElement('a', { href: '#/about' }, 'About'),
    createElement('a', { href: '#/contact' }, 'Contact')
  ]);
}
```

## TodoMVC Example

MiniFrame includes a complete TodoMVC implementation to demonstrate its capabilities.

### Running the TodoMVC Example

```bash
minfred start-todomvc
```

This command will:

1. Copy the MiniFrame library to the TodoMVC directory
2. Start a development server
3. Open the TodoMVC app at `http://localhost:3000`

### TodoMVC Features Demonstrated

The TodoMVC example showcases:

- **State Management**: Todo items, filters, and counts
- **Event Handling**: Add, toggle, delete, and edit todos
- **Routing**: Filter by all, active, and completed todos
- **DOM Manipulation**: Dynamic list rendering and updates

### TodoMVC File Structure

```
examples/todomvc/
├── index.html           # Main HTML file
├── app.js              # TodoMVC application logic
├── miniframe.js        # MiniFrame framework (copied during start)
└── style.css           # TodoMVC styles
```

### Key TodoMVC Implementation Patterns

**State Structure:**

```javascript
state.setState({
  todos: [],
  filter: 'all', // 'all', 'active', 'completed'
  editingId: null
});
```

**Todo Item Component:**

```javascript
function TodoItem(todo) {
  return createElement('li', {
    class: todo.completed ? 'completed' : ''
  }, [
    createElement('input', {
      class: 'toggle',
      type: 'checkbox',
      checked: todo.completed,
      onChange: () => toggleTodo(todo.id)
    }),
    createElement('label', {
      onDoubleClick: () => startEditing(todo.id)
    }, todo.text),
    createElement('button', {
      class: 'destroy',
      onClick: () => deleteTodo(todo.id)
    })
  ]);
}
```

## Advanced Usage

### Custom Event Handling

```javascript
// Global event handling with delegation
import { events } from '../dist/miniframe.js';

// Handle all clicks on buttons with class 'action-btn'
events.on('click', '.action-btn', (e) => {
  const action = e.target.dataset.action;
  handleAction(action);
});

// Handle form submissions
events.on('submit', 'form', (e) => {
  e.preventDefault();
  // Handle form
});
```

### State Persistence

```javascript
// Save state to localStorage
const saveState = () => {
  localStorage.setItem('app-state', JSON.stringify(state.getState()));
};

// Load state from localStorage
const loadState = () => {
  const saved = localStorage.getItem('app-state');
  if (saved) {
    state.setState(JSON.parse(saved));
  }
};

// Subscribe to save state on changes
state.subscribe(saveState);

// Load state on app initialization
loadState();
```

### Component Composition

```javascript
// Higher-order component pattern
function withLoading(Component) {
  return function LoadingWrapper(props) {
    const { loading } = state.getState();
    
    if (loading) {
      return createElement('div', { class: 'loading' }, 'Loading...');
    }
    
    return Component(props);
  };
}

// Usage
const TodoListWithLoading = withLoading(TodoList);
```

### Dynamic Route Parameters

```javascript
// In your route handler, parse the hash for parameters
function UserProfile() {
  const hash = window.location.hash;
  const userId = hash.split('/')[2]; // Extract from #/users/123
  
  return createElement('div', {}, [
    createElement('h1', {}, `User Profile: ${userId}`)
  ]);
}
```

### Error Boundaries

```javascript
function ErrorBoundary(component) {
  try {
    return component();
  } catch (error) {
    console.error('Component error:', error);
    return createElement('div', { class: 'error' }, [
      createElement('h2', {}, 'Something went wrong'),
      createElement('p', {}, error.message)
    ]);
  }
}
```

## Best Practices

1. **Component Organization**: Keep components small and focused
2. **State Management**: Use a flat state structure when possible
3. **Event Handling**: Prefer inline handlers for component-specific events
4. **File Naming**: Use PascalCase for components, camelCase for utilities
5. **Code Splitting**: Use dynamic imports for route-based code splitting
6. **Performance**: Minimize state updates and use efficient DOM operations

## Troubleshooting

### Common Issues

**Issue**: Component not rendering
**Solution**: Check that you're returning a DOM element from your component function

**Issue**: State updates not triggering re-renders
**Solution**: Ensure you're using `state.setState()` and not mutating state directly

**Issue**: Routes not working
**Solution**: Verify your route paths and component imports are correct

**Issue**: Events not firing
**Solution**: Check event handler syntax and ensure elements exist in the DOM

### Debug Mode

Add debug logging to your application:

```javascript
// Enable debug mode
state.subscribe((newState) => {
  console.log('State updated:', newState);
});
```

## Contributing

MiniFrame is designed to be lightweight and extensible. When contributing:

1. Keep the core framework minimal
2. Add features that enhance the core concepts
3. Maintain backward compatibility
4. Include tests and documentation

---

*This documentation covers the essential aspects of building applications with MiniFrame. For more examples and advanced patterns, explore the TodoMVC implementation and experiment with the framework's capabilities.*
