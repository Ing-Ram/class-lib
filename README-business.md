## Class-Lib – Business Overview

**Class-Lib** is a small classroom library management system designed for teachers or school librarians who want a simple way to track which students have which books, for how long, and how actively they are reading.

### Purpose and Goals

- **Track inventory**: Maintain a catalog of classroom books (title, author, genre, ISBN).
- **Monitor borrowing**: See which books are currently checked out and by which student.
- **Understand reading behavior**: Keep a history of what each student has borrowed and for how long, supporting conversations about reading habits and responsibility.
- **Be easy to run**: Use a modern web UI (React) with a lightweight backend and a MySQL database running locally.

### Key Users

- **Teacher / Librarian**
  - Views the overall book catalog.
  - Checks books out to students and returns them.
  - Reviews per-student borrowing history.
- **Student**
  - Indirect user: their name and class ID are recorded when books are checked out.
  - Benefit is better accountability and recognition for reading.

### Core Features

- **Library view**
  - Shows all books with title, author, genre, and ISBN.
  - Highlights which books are **available** vs **checked out**.
  - Allows a teacher to:
    - Click **“Check Out”** → assign a book to a student (name + class ID).
    - Click **“Return Book”** when a book is brought back.

- **Students view**
  - Lists all students known to the system (from the class list and from real checkouts).
  - For each student:
    - Shows their class ID.
    - Lists books they currently have checked out.
    - Provides an expandable **history** of all past loans, including:
      - Book title and ISBN.
      - When it was checked out and checked in.
      - How long they kept the book (duration).

### Data and Persistence

- **Database**: MySQL (installed locally, providing persistent storage).
- **Main entities**:
  - **Students** – name and class ID.
  - **Books** – catalog of titles and their current checkout status.
  - **Checkout history** – every borrow/return event linking a student to a book and recording duration.
- **Why this matters**:
  - Data survives refreshes, restarts, and machine reboots.
  - The teacher can build a long-term picture of student reading without re-entering data.

### High-Level Architecture (Non-Technical Summary)

- **Front-end**: A simple web application built with React that runs in the browser and provides:
  - A **Library** page (books focus).
  - A **Students** page (student focus).
- **Backend API**: A small service that:
  - Exposes endpoints like “get all books”, “get all students with history”, “check out book”, and “return book”.
  - Translates user actions (button clicks) into database updates.
- **Database Layer**: A MySQL database that:
  - Stores the book catalog and student roster.
  - Tracks the current checkout state and the full borrowing history.

Together, these pieces give a teacher a simple, repeatable way to manage a classroom library, answer questions like *“Who currently has this book?”* or *“What has this student been reading this term?”*, and keep the data safely persisted over time. 

