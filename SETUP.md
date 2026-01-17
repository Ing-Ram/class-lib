# Class-Lib Setup Guide

Complete step-by-step guide to set up Class-Lib with local MySQL.

## Step 1: Install MySQL

### Windows

1. Download **MySQL Installer** from [dev.mysql.com/downloads/installer](https://dev.mysql.com/downloads/installer/)
2. Run the installer
3. Choose **"Developer Default"** or **"Server only"**
4. Complete the installation wizard
5. **Set a root password** (write it down - you'll need it!)
6. MySQL service should start automatically

**Verify installation:**
```powershell
mysql --version
```

### macOS

```bash
# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Set root password (if needed)
mysql_secure_installation
```

### Linux (Ubuntu/Debian)

```bash
# Install MySQL
sudo apt update
sudo apt install mysql-server

# Start MySQL service
sudo systemctl start mysql

# Secure installation (set root password)
sudo mysql_secure_installation
```

## Step 2: Create Database and Tables

**Windows - Easiest Method (PowerShell Script):**

Run the provided setup script:
```powershell
.\setup-database.ps1
```
Enter your MySQL root password when prompted.

**Windows - Manual Method:**

If MySQL is not in your PATH, use the full path:
```powershell
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < server/src/sql/schema.sql
```

If MySQL is in your PATH:
```powershell
mysql -u root -p < server/src/sql/schema.sql
```

**macOS/Linux:**
```bash
mysql -u root -p < server/src/sql/schema.sql
```

Enter your root password when prompted.

**Alternative - Run inside MySQL client:**

If you prefer to use MySQL interactively, you have these options:

**Option A - Run SQL file directly from PowerShell (Easiest):**
```powershell
mysql -u root -p < server/src/sql/schema.sql
```
Enter your MySQL root password when prompted. This executes the entire schema file.

**Option B - Run inside MySQL client:**
First connect to MySQL:
```powershell
mysql -u root -p
```
Then inside MySQL, use `source` (note: use forward slashes or double backslashes):
```sql
source C:/Users/ChadI/Documents/CODE/class-lib/class-lib/server/src/sql/schema.sql
```
Or if you're in the project directory, you can use a relative path (but MySQL needs absolute path):
```sql
source C:/Users/ChadI/Documents/CODE/class-lib/class-lib/server/src/sql/schema.sql
```

**Option C - Copy/paste the SQL:**
Open `server/src/sql/schema.sql` in a text editor, copy all contents, and paste into MySQL command line after connecting with `mysql -u root -p`.

**Verify the database was created:**
```sql
SHOW DATABASES;
USE class_lib;
SHOW TABLES;
```

You should see:
- `students`
- `books`
- `checkout_history`

## Step 3: Configure Backend

1. Navigate to the `server` directory:
   ```powershell
   cd server
   ```

2. Create `.env` file (copy from `env.example`):
   ```powershell
   copy env.example .env
   ```

3. Edit `.env` and update the MySQL password:
   ```env
   PORT=5174
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password_here
   DB_NAME=class_lib
   ```

   Replace `your_actual_mysql_password_here` with the root password you set in Step 1.

## Step 4: Install Node Dependencies

From the project root (`class-lib/`):

```powershell
npm install
npm run server:install
```

## Step 5: Seed Initial Data

This loads your existing `books.json` and `students.json` files into MySQL:

```powershell
npm run server:seed
```

**Verify data was loaded:**
```sql
mysql -u root -p
USE class_lib;
SELECT COUNT(*) FROM books;
SELECT COUNT(*) FROM students;
```

You should see 25 books and multiple students.

## Step 6: Start the Application

**Terminal 1 - Start Backend API:**
```powershell
npm run server:dev
```

You should see:
```
Server running on http://localhost:5174
Database connected successfully
```

**Terminal 2 - Start Frontend:**
```powershell
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

## Step 7: Open in Browser

Visit **http://localhost:5173**

You should see:
- **Library** page with all books
- **Students** page with student information
- Ability to check out/return books
- Data persists after page refresh!

## Troubleshooting

### "Can't connect to MySQL server"

- Make sure MySQL service is running:
  - **Windows**: Check Services app, look for "MySQL80"
  - **macOS**: `brew services list` (should show mysql as "started")
  - **Linux**: `sudo systemctl status mysql`

### "Access denied for user 'root'"

- Check your `.env` file has the correct password
- Try resetting MySQL root password if needed

### "Database 'class_lib' doesn't exist"

- Run the schema.sql file again (Step 2)

### "Port 5174 already in use"

- Another process is using port 5174
- Change `PORT` in `server/.env` to a different port (e.g., 5175)
- Update `vite.config.js` proxy target to match

### Backend starts but frontend can't reach API

- Make sure backend is running on the port specified in `.env`
- Check `vite.config.js` proxy configuration matches your backend port

## Next Steps

- Check out `README-business.md` for business overview
- Explore the code:
  - `src/App.jsx` - Main React app
  - `server/src/index.js` - API endpoints
  - `server/src/sql/schema.sql` - Database structure
