//src/app.js
(function() {
  const { init } = MiniFrame;

  // Define routes
  const routes = [
    { path: '/', component: () => import('./pages/index.js').then(m => m.default) },
    { path: '*', component: () => import('./pages/index.js').then(m => m.default) }
  ];

  // Initialize framework
  init({
    root: '#app',
    routes
  });
})();
