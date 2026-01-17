# Create Database - Quick Guide

## The Problem
Your backend server is showing: `Unknown database 'class_lib'`

This means the database hasn't been created yet.

## Solution - Create the Database

### Step 1: Open MySQL Command Line

Open PowerShell in your project directory and run:

```powershell
cd C:\Users\ChadI\Documents\CODE\class-lib\class-lib
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

Enter your **actual MySQL root password** when prompted.

### Step 2: Create the Database

Once you're in MySQL (you'll see `mysql>` prompt), copy and paste this entire block:

```sql
CREATE DATABASE IF NOT EXISTS class_lib;

USE class_lib;

CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  class_id VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(64) NULL,
  genre VARCHAR(128) NULL,
  is_checked_out TINYINT(1) NOT NULL DEFAULT 0,
  checked_out_by_student_id INT NULL,
  checked_out_at DATETIME NULL,
  checked_in_at DATETIME NULL,
  CONSTRAINT fk_books_student
    FOREIGN KEY (checked_out_by_student_id) REFERENCES students(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS checkout_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  book_id INT NOT NULL,
  checked_out_at DATETIME NULL,
  checked_in_at DATETIME NULL,
  duration_ms BIGINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hist_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_hist_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  INDEX idx_hist_student (student_id),
  INDEX idx_hist_book (book_id)
);
```

Press Enter. You should see `Query OK` messages.

### Step 3: Verify Database Was Created

Still in MySQL, run:

```sql
SHOW DATABASES;
USE class_lib;
SHOW TABLES;
```

You should see:
- `class_lib` in the databases list
- Three tables: `books`, `checkout_history`, `students`

Type `exit;` to leave MySQL.

### Step 4: Update Your .env File Password (if needed)

If your MySQL root password is **different** from `Besson12`, update `server/.env`:

1. Open `server/.env`
2. Change `DB_PASSWORD=Besson12` to your actual MySQL root password
3. Save the file

### Step 5: Backend Server Will Auto-Restart

Your backend server is watching for file changes. Once the database exists:
- The server will automatically reconnect
- You should see: `Database connected successfully`

### Step 6: Seed Initial Data

After the database is created, run:

```powershell
npm run server:seed
```

This loads your books and students from the JSON files into MySQL.

## Alternative: Use the Schema File Directly

If you prefer, you can also use the `source` command in MySQL:

```sql
source C:/Users/ChadI/Documents/CODE/class-lib/class-lib/server/src/sql/schema.sql
```

(Use forward slashes `/` in the path, even on Windows)
