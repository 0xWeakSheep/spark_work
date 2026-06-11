CREATE DATABASE IF NOT EXISTS movie_analysis DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE movie_analysis;

CREATE TABLE IF NOT EXISTS movies (
  movie_id INT PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  genres VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ratings (
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  rating DOUBLE NOT NULL,
  rating_timestamp BIGINT NOT NULL,
  INDEX idx_ratings_user_id (user_id),
  INDEX idx_ratings_movie_id (movie_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  user_id INT PRIMARY KEY,
  gender CHAR(1) NOT NULL,
  age INT NOT NULL,
  occupation INT NOT NULL,
  zip_code VARCHAR(32) NOT NULL,
  INDEX idx_users_gender (gender)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tags (
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  tag VARCHAR(255) NOT NULL,
  tag_timestamp BIGINT NOT NULL,
  INDEX idx_tags_user_id (user_id),
  INDEX idx_tags_movie_id (movie_id),
  INDEX idx_tags_tag (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS top_movies (
  rank_no INT PRIMARY KEY,
  movie_id INT NOT NULL,
  title VARCHAR(512) NOT NULL,
  avg_rating DOUBLE NOT NULL,
  rating_count INT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS gender_genre_attention (
  gender CHAR(1) NOT NULL,
  genre VARCHAR(64) NOT NULL,
  attention_count BIGINT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (gender, genre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS gender_top_genres (
  gender CHAR(1) PRIMARY KEY,
  genre VARCHAR(64) NOT NULL,
  attention_count BIGINT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stream_rating_trend (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  batch_id BIGINT NOT NULL,
  batch_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  rating_count BIGINT NOT NULL,
  avg_rating DOUBLE NOT NULL,
  min_rating DOUBLE NOT NULL,
  max_rating DOUBLE NOT NULL,
  UNIQUE KEY uk_stream_batch_id (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

