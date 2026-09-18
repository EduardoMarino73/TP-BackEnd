-- Create the database if it doesn't exist and select the character set
CREATE DATABASE IF NOT EXISTS cinedb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cinedb;

-- Create the movies table
CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    views INT DEFAULT 0,
    description TEXT,
    report BOOLEAN DEFAULT FALSE,
    state VARCHAR(50) DEFAULT 'active',
    id_author INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
