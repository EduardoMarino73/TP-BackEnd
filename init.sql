-- CineWeb database schema.
-- Run it with: mysql -u root -p < init.sql
-- The database name must match MYSQL_DATABASE in .env (see .env.example).

-- Create the database if it doesn't exist and select the character set
CREATE DATABASE IF NOT EXISTS che_netflix
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE che_netflix;

-- Shared identity for viewers and administrators. Registering over the API
-- always creates a viewer; promote the first administrator explicitly:
-- UPDATE users SET role = 'administrator' WHERE email = 'admin@example.com';
CREATE TABLE IF NOT EXISTS users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('viewer', 'administrator') NOT NULL DEFAULT 'viewer',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_sessions_user (user_id),
    INDEX idx_user_sessions_expiry (expires_at),
    CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;

-- OPTIONAL RESET: "CREATE TABLE IF NOT EXISTS" does not update a table that
-- already exists. If your tables were created with an older version of this
-- script (e.g. a missing column causes a 500 error), uncomment these lines
-- to drop them and create them again. WARNING: this deletes their data.
-- DROP TABLE IF EXISTS reviews;
-- DROP TABLE IF EXISTS episodes;
-- DROP TABLE IF EXISTS seasons;
-- DROP TABLE IF EXISTS series;
-- DROP TABLE IF EXISTS movies;

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

-- Create the series table
CREATE TABLE IF NOT EXISTS series (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    id_author INT NOT NULL,
    state VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Create the seasons table
CREATE TABLE IF NOT EXISTS seasons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_serie INT NOT NULL,
    season_number INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_serie) REFERENCES series(id) ON DELETE CASCADE,
    UNIQUE KEY uq_serie_season (id_serie, season_number)
) ENGINE=InnoDB;

-- Create the episodes table
CREATE TABLE IF NOT EXISTS episodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_season INT NOT NULL,
    episode_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    path VARCHAR(255) NOT NULL,
    views INT DEFAULT 0,
    state VARCHAR(50) DEFAULT 'active',
    id_author INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_season) REFERENCES seasons(id) ON DELETE CASCADE,
    UNIQUE KEY uq_season_episode (id_season, episode_number)
) ENGINE=InnoDB;

-- Viewer ratings for movies and episodes. audiovisual_type disambiguates IDs,
-- since each content table currently has its own auto-increment sequence.
-- viewer_id points to the viewer account in users.
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    viewer_id INT NOT NULL,
    rating BOOLEAN NOT NULL,
    audiovisual_id INT NOT NULL,
    audiovisual_type ENUM('movie', 'episode') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_review_viewer_audiovisual (viewer_id, audiovisual_type, audiovisual_id),
    INDEX idx_reviews_audiovisual (audiovisual_type, audiovisual_id),
    INDEX idx_reviews_viewer (viewer_id)
) ENGINE=InnoDB;

-- Individual reports. One viewer can report each content item only once.
CREATE TABLE IF NOT EXISTS content_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_type ENUM('movie', 'series') NOT NULL,
    target_id INT NOT NULL,
    reporter_id INT NOT NULL,
    reason VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_content_report_reporter_target (reporter_id, target_type, target_id),
    INDEX idx_content_reports_target (target_type, target_id),
    INDEX idx_content_reports_reporter (reporter_id),
    CONSTRAINT fk_content_reports_reporter FOREIGN KEY (reporter_id)
        REFERENCES users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;

-- One moderation case is generated when an item first reaches three reports.
CREATE TABLE IF NOT EXISTS moderation_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_type ENUM('movie', 'series') NOT NULL,
    target_id INT NOT NULL,
    report_count INT NOT NULL,
    status ENUM('pending', 'appealed', 'upheld', 'dismissed') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_moderation_case_content (target_type, target_id),
    INDEX idx_moderation_case_status (status, id)
) ENGINE=InnoDB;

-- Content owners can appeal a moderation case. Administrators decide whether
-- to uphold or dismiss that case.
CREATE TABLE IF NOT EXISTS content_appeals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(2000) NOT NULL,
    moderation_case_id INT NOT NULL UNIQUE,
    administrator_id INT NULL,
    reviewed BOOLEAN NOT NULL DEFAULT FALSE,
    decision ENUM('approved', 'rejected') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    INDEX idx_content_appeals_review_queue (reviewed, id),
    CONSTRAINT fk_content_appeals_case FOREIGN KEY (moderation_case_id)
        REFERENCES moderation_cases(id) ON DELETE CASCADE,
    CONSTRAINT fk_content_appeals_administrator FOREIGN KEY (administrator_id)
        REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB;

