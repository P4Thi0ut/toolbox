# PA Toolbox

A front-end only Vue.js application for project management tools and visualizations.

## Features

- User authentication with admin and regular user roles
- Dark-themed dashboard interface
- Modular tool system for project management tasks

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with your credentials:
```
VITE_ADMIN_USER=admin
VITE_ADMIN_PASS=your_admin_password
VITE_REGULAR_USER=user
VITE_REGULAR_PASS=your_regular_password
```

**Note:** The `.env` file is gitignored and will not be committed. For local development, create this file manually.

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## GitHub Pages Deployment

The app is configured to deploy to GitHub Pages when pushing to the `master` branch. The base path is set to `/pa-toolbox/` for GitHub Pages.

### Setting up GitHub Secrets

For the GitHub Actions workflow to work, you need to add the following secrets to your repository:
- Go to Settings → Secrets and variables → Actions
- Click "New repository secret"
- Add the following repository secrets:
  - `VITE_ADMIN_USER` - Your admin username
  - `VITE_ADMIN_PASS` - Your admin password
  - `VITE_REGULAR_USER` - Your regular user username
  - `VITE_REGULAR_PASS` - Your regular user password

**Important Notes:**
- These secrets are automatically injected as environment variables during the build process
- Only variables prefixed with `VITE_` are exposed to the client-side code (this is a Vite security feature)
- The `.env` file should never be committed to the repository (it's in `.gitignore`)
- For local development, create a `.env` file manually with the same variable names
- Secrets are encrypted and only accessible during GitHub Actions runs

## Tech Stack

- Vue 3 (Composition API with `<script setup>`)
- Vue Router
- Pinia
- Vite

