# Loading Book and Student Data into Database

## Prerequisites

**The database `class_lib` must exist first!** If you see `Unknown database 'class_lib'`, you need to create it.

## Step 1: Create Database (If Not Already Created)

**Option A - Interactive (Recommended):**

1. Open PowerShell and run:
   ```powershell
   cd C:\Users\ChadI\Documents\CODE\class-lib\class-lib
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
   ```

2. Enter your MySQL root password when prompted.

3. Once in MySQL (you'll see `mysql>`), run:
   ```sql
   CREATE DATABASE IF NOT EXISTS class_lib;
   USE class_lib;
   ```

4. Then copy/paste the contents of `server/src/sql/schema.sql` OR run:
   ```sql
   source C:/Users/ChadI/Documents/CODE/class-lib/class-lib/server/src/sql/schema.sql
   ```

5. Verify tables exist:
   ```sql
   SHOW TABLES;
   ```
   Should show: `books`, `checkout_history`, `students`

6. Exit MySQL:
   ```sql
   exit;
   ```

## Step 2: Load Data (Seed Database)

Once the database exists, run the seed script:

```powershell
cd C:\Users\ChadI\Documents\CODE\class-lib\class-lib
npm run server:seed
```

**What this does:**
- Reads `src/data/books.json` (25 books)
- Reads `src/data/students.json` (27 students)
- Inserts all students into the `students` table
- Inserts all books into the `books` table
- Preserves checkout status (if a book was checked out in the JSON, it will be checked out in the DB)

**Expected output:**
```
Seed complete.
```

## Step 3: Verify Data Was Loaded

**Option A - Using MySQL:**
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

Then:
```sql
USE class_lib;
SELECT COUNT(*) AS book_count FROM books;
SELECT COUNT(*) AS student_count FROM students;
SELECT * FROM books LIMIT 5;
```

Should show:
- `book_count`: 25
- `student_count`: 27 (or more, depending on student names in books.json)

**Option B - Start Your App:**
```powershell
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend  
npm run dev
```

Then visit `http://localhost:5173` - you should see all 25 books displayed!

## Troubleshooting

### "Unknown database 'class_lib'"
→ Database not created. Go back to Step 1.

### "Access denied for user 'root'"
→ Wrong password in `server/.env`. Update `DB_PASSWORD` in `server/.env` to match your MySQL root password.

### "Table 'books' doesn't exist"
→ Database exists but tables weren't created. Run the schema.sql file (Step 1, part 4).

### Seed runs but no data appears in app
→ Check if backend server is running and can connect to database. Check `server/.env` credentials.
