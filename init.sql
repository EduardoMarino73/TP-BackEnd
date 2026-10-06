-- CineWeb database schema.
-- Run it with: mysql -u root -p < init.sql
-- The database name must match MYSQL_DATABASE in .env (see .env.example).

-- Create the database if it doesn't exist and select the character set
CREATE DATABASE IF NOT EXISTS che_netflix
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE che_netflix;

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
-- viewer_id points to the viewer/user identity from the domain model; this
-- project does not yet define a users table to reference with a foreign key.
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

