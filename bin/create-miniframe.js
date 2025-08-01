#!/usr/bin/env node
// bin/create-miniframe.js
const fs = require('fs').promises;
const path = require('path');
const commander = require('commander');
const { execSync } = require('child_process');

const program = new commander.Command();

program
  .name('minfred')
  .version('1.1.0')
  .description('MiniFrame: A lightweight JavaScript framework CLI');

program
  .command('create <project-name>')
  .description('Create a new MiniFrame project')
  .action(async (projectName) => {
    const projectDir = path.join(process.cwd(), projectName);
    try {
      // Create project directory
      await fs.mkdir(projectDir, { recursive: true });

      // Create folder structure
      await fs.mkdir(path.join(projectDir, 'dist'));
      await fs.mkdir(path.join(projectDir, 'src'));
      await fs.mkdir(path.join(projectDir, 'src/pages'));
      await fs.mkdir(path.join(projectDir, 'src/components'));

      // Copy miniframe.js from bin directory (since that's where the actual framework is)
      const miniframeSource = path.join(__dirname, 'miniframe.js');
      await fs.copyFile(miniframeSource, path.join(projectDir, 'dist/miniframe.js'));

      // Write index.html
      await fs.writeFile(path.join(projectDir, 'src/index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Minfred App</title>
  <style>
    body {
      margin: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      color: #fff;
      text-align: center;
    }

    .message {
      background-color: rgba(255, 255, 255, 0.1);
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      animation: fadeIn 1s ease-out;
      max-width: 600px;
    }

    h1 {
      font-size: 2em;
      margin-bottom: 10px;
    }

    p {
      font-size: 1.1em;
      opacity: 0.9;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="message">
    <h1>Your application is running!</h1>
    <p>Check the <strong>README</strong> file to start building with Minfred.</p>
  </div>
</body>
</html>`);

      // Write app.js
      await fs.writeFile(path.join(projectDir, 'src/app.js'), `(function() {
  const { init } = MiniFrame;

  const routes = [
    { path: '/', component: () => import('./pages/index.js').then(m => m.default) },
    { path: '*', component: () => import('./pages/index.js').then(m => m.default) }
  ];

  init({
    root: '#app',
    routes
  });
})();`);

      // Write index.js (sample component)
      await fs.writeFile(path.join(projectDir, 'src/pages/index.js'), `import { createElement, state } from '../../dist/miniframe.js';

state.setState({ count: 0 });

export default function Home() {
  const { count } = state.getState();
  return createElement('div', { class: 'counter' }, [
    createElement('h1', {}, \`Count: \${count}\`),
    createElement('button', {
      onClick: () => state.setState({ count: count + 1 })
    }, 'Increment')
  ]);
}`);

      // Write package.json
      await fs.writeFile(path.join(projectDir, 'package.json'), JSON.stringify({
        name: projectName,
        version: '1.0.0',
        description: 'A MiniFrame project',
        scripts: {
          start: 'serve src'
        },
        dependencies: {
          serve: '^14.2.3'
        }
      }, null, 2));

      // Write README.md
      await fs.writeFile(path.join(projectDir, 'README.md'), `# ${projectName}

A MiniFrame project.

## Getting Started

1. Run \`npm install\` to install dependencies.
2. Run \`npm start\` to serve the app from the \`src\` directory.
3. Open \`http://localhost:3000\` in your browser.

## Folder Structure

- **dist/**: MiniFrame framework (\`miniframe.js\`).
- **src/**:
  - **pages/**: Page components (e.g., \`index.js\` for the home route).
  - **components/**: Reusable components.
  - **app.js**: Route definitions.
  - **index.html**: Entry point.
- **package.json**: Scripts and dependencies.
- **README.md**: Instructions.

## Adding Pages

Create new files in \`src/pages\` (e.g., \`about.js\`) to add routes:

\`\`\`javascript
import { createElement } from '../../dist/miniframe.js';

export default function About() {
  return createElement('div', {}, 'About Page');
}
\`\`\`

Update \`src/app.js\` to include the route:

\`\`\`javascript
{ path: '/about', component: () => import('./pages/about.js').then(m => m.default) }
\`\`\`

## MiniFrame Features

- **DOM Abstraction**: Use \`createElement\` for virtual DOM nodes.
- **Routing**: Hash-based routing with routes defined in \`app.js\`.
- **State Management**: Use \`state.setState\` and \`state.getState\` for reactive state.
- **Event Handling**: Attach events via \`onClick\` or \`events.on\`.

See [MiniFrame Docs](https://github.com/[YourGitHubUsername]/miniframe) for more.`);

      console.log(`MiniFrame project "${projectName}" created successfully!`);
      console.log(`Run the following commands to start:`);
      console.log(`  cd ${projectName}`);
      console.log(`  npm install`);
      console.log(`  npm start`);
    } catch (error) {
      console.error('Error creating project:', error.message);
    }
  });

program
  .command('start-todomvc')
  .description('Run the TodoMVC example')
  .action(async () => {
    try {
      const todomvcDir = path.join(__dirname, '../examples/todomvc');
      // Use the miniframe.js from bin directory, not dist
      const miniframeSource = path.join(__dirname, 'miniframe.js');
      const miniframeDest = path.join(todomvcDir, 'miniframe.js');

      // Verify todomvc directory exists
      await fs.access(todomvcDir);

      // Copy miniframe.js to todomvc directory
      await fs.copyFile(miniframeSource, miniframeDest);

      console.log('Starting TodoMVC example...');
      console.log(`MiniFrame copied to: ${miniframeDest}`);
      console.log(`Open your browser to: http://localhost:3000`);
      
      // Start the server
      execSync(`npx serve ${todomvcDir} -p 3000`, { stdio: 'inherit' });

    } catch (error) {
      console.error('Error running TodoMVC:', error.message);
      if (error.code === 'ENOENT') {
        console.error('TodoMVC directory or miniframe.js not found.');
        console.error('Ensure examples/todomvc exists and bin/miniframe.js is present.');
      }
    }
  });

program.parse(process.argv);
