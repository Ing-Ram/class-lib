# Class-Lib

A classroom library management system built with React + Vite frontend and Express + MySQL backend. Track books, students, and borrowing history with persistent data storage.

## Prerequisites

- **Node.js** (v16+) and npm
- **MySQL** (8.0+) installed locally and running
- MySQL root access (or a user with database creation privileges)

## Quick Start

### 1. Install MySQL Locally

**Windows:**
- Download MySQL Installer from [mysql.com/downloads](https://dev.mysql.com/downloads/installer/)
- Run the installer and choose "Developer Default" or "Server only"
- Set a root password (remember this!)
- Start MySQL service (usually runs automatically after install)

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### 2. Create Database and Tables

**Option A - Use the setup script (Windows - Easiest):**
```powershell
.\setup-database.ps1
```

**Option B - Run SQL file directly (if MySQL is in PATH):**
```powershell
mysql -u root -p < server/src/sql/schema.sql
```

**Option C - Run SQL file with full path (Windows - if MySQL not in PATH):**
```powershell
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < server/src/sql/schema.sql
```

Enter your MySQL root password when prompted.

**Option B - Run inside MySQL client:**
```powershell
mysql -u root -p
```
Then inside MySQL, use an absolute path:
```sql
source C:/Users/ChadI/Documents/CODE/class-lib/class-lib/server/src/sql/schema.sql
```
*(Adjust the path to match your project location)*

**Option C - Copy/paste:**
Open `server/src/sql/schema.sql` in a text editor, copy all contents, and paste into MySQL command line.

### 3. Configure Backend Environment

Create `server/.env` file (copy from `server/env.example`):

```env
PORT=5174
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=class_lib
```

Replace `your_mysql_root_password` with your actual MySQL root password.

### 4. Install Dependencies

```bash
npm install
npm run server:install
```

### 5. Seed Initial Data

This loads your existing `books.json` and `students.json` into MySQL:

```bash
npm run server:seed
```

### 6. Run the Application

**Terminal 1 - Backend API:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Project Structure

- `index.html` — app entry
- `vite.config.js` — Vite config (includes API proxy)
- `package.json` — scripts & dependencies
- `src/` — React frontend source
  - `components/` — UI components (BookCard, StudentCard, Card)
  - `pages/` — page components (Library, Students)
  - `api.js` — API client functions
  - `App.jsx`, `main.jsx` — app bootstrap
- `server/` — Express backend
  - `src/` — server source code
    - `index.js` — Express API server
    - `db.js` — MySQL connection pool
    - `sql/schema.sql` — database schema
  - `scripts/seed.js` — seed script for initial data

## Project Structure

- `index.html` — app entry
- `vite.config.js` — Vite config
- `package.json` — scripts & deps
- `src/` — React source
  - `components/` — UI components (BookCard, StudentCard, Card)
  - `pages/` — page components (Library, Students)
  - `App.jsx`, `main.jsx` — app bootstrap

## Scripts

**Frontend:**
- `dev`: Start Vite dev server
- `build`: Create production build
- `preview`: Serve production build locally
- `lint`: Run ESLint

**Backend:**
- `server:install`: Install server dependencies
- `server:dev`: Start Express API server (port 5174)
- `server:seed`: Load initial data from JSON files into MySQL

## Contributing

PRs welcome — keep changes small and focused. Run `npm run lint` before submitting.

## License

MIT-style (check repository owner for specifics).
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
