# Quick Fix: Books and Students Not Displaying

## Most Common Issues

### 1. Database Doesn't Exist or Is Empty

**Check if database exists:**
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "USE class_lib; SHOW TABLES;"
```

**If it fails, create the database:**
```sql
-- In MySQL command line
CREATE DATABASE IF NOT EXISTS class_lib;
USE class_lib;
-- Then run schema.sql
```

**Check if data exists:**
```sql
SELECT COUNT(*) FROM books;
SELECT COUNT(*) FROM students;
```

**If empty, seed the data:**
```powershell
cd C:\Users\ChadI\Documents\CODE\class-lib\class-lib
npm run server:seed
```

### 2. Backend Server Not Running

**Start the backend:**
```powershell
cd C:\Users\ChadI\Documents\CODE\class-lib\class-lib
npm run server:dev
```

**You should see:**
```
API listening on http://localhost:5174
Database connected successfully
```

If you see `Database connection failed`, the database doesn't exist or credentials are wrong.

### 3. Frontend Can't Reach Backend

**Check browser console (F12):**
- Look for errors in Console tab
- Check Network tab for failed `/api/books` or `/api/students` requests

**Make sure:**
- Backend is running on port 5174
- Frontend is running on port 5173
- Vite proxy in `vite.config.js` points to `http://localhost:5174`

### 4. Wrong .env Credentials

**Check `server/.env`:**
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=class_lib
```

**Make sure:**
- Password matches your MySQL root password
- Database name is `class_lib`

## Debugging Steps

1. **Test database connection:**
   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p class_lib -e "SELECT COUNT(*) AS book_count FROM books;"
   ```

2. **Test backend API directly:**
   ```powershell
   curl http://localhost:5174/api/books
   ```
   Or open in browser: `http://localhost:5174/api/books`

3. **Check backend logs:**
   - Should see: `Database connected successfully`
   - Should NOT see: `Unknown database 'class_lib'` or `Access denied`

4. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors in Console
   - Check Network tab for failed requests

## Expected Behavior

**When everything works:**
- Backend shows: `Database connected successfully`
- Frontend loads books and students from API
- Browser console shows successful API calls
- Library page shows 25 books
- Students page shows students with their checked-out books

## What I Just Fixed

1. ✅ Removed unused JSON imports from `Library.jsx` and `Students.jsx`
2. ✅ Added default empty arrays to prevent undefined errors
3. ✅ Added better empty state messages
4. ✅ Improved error messages to guide troubleshooting

The components now properly use the props from `App.jsx` which gets data from the API.
