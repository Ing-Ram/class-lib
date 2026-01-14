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

