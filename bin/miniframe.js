// // bin/miniframe.js
// MiniFrame - A lightweight JavaScript framework
(function() {
    'use strict';

    // State management
    const state = {
        _state: {},
        _subscribers: [],
        
        setState(newState) {
            this._state = { ...this._state, ...newState };
            this._subscribers.forEach(cb => cb(this._state));
        },
        
        getState() {
            return { ...this._state };
        },
        
        subscribe(callback) {
            this._subscribers.push(callback);
            return () => {
                const index = this._subscribers.indexOf(callback);
                if (index > -1) {
                    this._subscribers.splice(index, 1);
                }
            };
        }
    };

    // DOM abstraction
    function createElement(tag, props = {}, children = []) {
        const el = document.createElement(tag);
        
        // Handle props/attributes
        if (props) {
            Object.keys(props).forEach(key => {
                if (key.startsWith('on') && typeof props[key] === 'function') {
                    // Handle event listeners (onClick, onInput, etc.)
                    const eventName = key.slice(2).toLowerCase();
                    el.addEventListener(eventName, props[key]);
                } else if (key === 'className' || key === 'class') {
                    el.className = props[key];
                } else if (key === 'style' && typeof props[key] === 'object') {
                    Object.assign(el.style, props[key]);
                } else if (key === 'checked' && typeof props[key] === 'boolean') {
                    el.checked = props[key];
                } else if (key === 'value') {
                    el.value = props[key];
                } else if (key === 'autofocus' && props[key]) {
                    el.autofocus = true;
                } else if (typeof props[key] !== 'function') {
                    // Set attribute for other props
                    el.setAttribute(key, props[key]);
                }
            });
        }
        
        // Handle children
        if (typeof children === 'string' || typeof children === 'number') {
            el.textContent = children;
        } else if (Array.isArray(children)) {
            children.forEach(child => {
                if (child === null || child === undefined) {
                    return; // Skip null/undefined children
                }
                if (typeof child === 'string' || typeof child === 'number') {
                    el.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    el.appendChild(child);
                }
            });
        }
        
        return el;
    }

    // Event handling system
    const events = {
        on(event, selector, handler) {
            document.addEventListener(event, e => {
                if (e.target.matches(selector)) {
                    handler(e);
                }
            });
        },
        
        off(event, handler) {
            document.removeEventListener(event, handler);
        }
    };

    // Router system
    function init({ root, routes }) {
        const rootEl = document.querySelector(root);
        if (!rootEl) {
            throw new Error(`Root element "${root}" not found`);
        }

        async function render() {
            const path = window.location.hash.slice(1) || '/';
            let route = routes.find(r => r.path === path);
            
            // Fallback to wildcard route
            if (!route) {
                route = routes.find(r => r.path === '*');
            }
            
            // Final fallback to first route
            if (!route && routes.length > 0) {
                route = routes[0];
            }
            
            if (!route) {
                console.error('No route found for path:', path);
                return;
            }

            // Clear current content
            rootEl.innerHTML = '';

            try {
                let component = route.component;
                
                // Handle dynamic imports and function components
                if (typeof component === 'function') {
                    const result = component();
                    
                    // Check if it's a promise (dynamic import)
                    if (result && typeof result.then === 'function') {
                        component = await result;
                    } else {
                        component = result;
                    }
                }
                
                // Render the component
                if (component && typeof component === 'function') {
                    const element = component();
                    if (element instanceof Node) {
                        rootEl.appendChild(element);
                    }
                } else if (component instanceof Node) {
                    rootEl.appendChild(component);
                }
            } catch (error) {
                console.error('Error rendering component:', error);
                rootEl.innerHTML = '<div>Error loading component</div>';
            }
        }

        // Listen for route changes
        window.addEventListener('hashchange', render);
        
        // Subscribe to state changes for re-rendering
        state.subscribe(render);
        
        // Initial render
        render();
    }

    // Create the MiniFrame object
    const MiniFrame = {
        createElement,
        state,
        init,
        events
    };

    // Export for different environments
    if (typeof window !== 'undefined') {
        window.MiniFrame = MiniFrame;
    }
    
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = MiniFrame;
    }
    
    if (typeof define === 'function' && define.amd) {
        define(function() { return MiniFrame; });
    }

})();
