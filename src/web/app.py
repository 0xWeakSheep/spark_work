from __future__ import annotations

import os
from contextlib import contextmanager

import pymysql
from flask import Flask, jsonify, render_template


app = Flask(__name__)


def mysql_config() -> dict:
    return {
        "host": os.getenv("MYSQL_HOST", "127.0.0.1"),
        "port": int(os.getenv("MYSQL_PORT", "3306")),
        "user": os.getenv("MYSQL_USER", "movie"),
        "password": os.getenv("MYSQL_PASSWORD", "movie123456"),
        "database": os.getenv("MYSQL_DATABASE", "movie_analysis"),
        "charset": "utf8mb4",
        "cursorclass": pymysql.cursors.DictCursor,
        "autocommit": True,
    }


@contextmanager
def db_cursor():
    conn = pymysql.connect(**mysql_config())
    try:
        with conn.cursor() as cursor:
            yield cursor
    finally:
        conn.close()


def query_all(sql: str, args: tuple | None = None) -> list[dict]:
    with db_cursor() as cursor:
        cursor.execute(sql, args or ())
        return list(cursor.fetchall())


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/summary")
def summary():
    try:
        rows = query_all(
            """
            SELECT 'movies' AS label, COUNT(*) AS value FROM movies
            UNION ALL SELECT 'ratings', COUNT(*) FROM ratings
            UNION ALL SELECT 'users', COUNT(*) FROM users
            UNION ALL SELECT 'genres', COUNT(DISTINCT genre) FROM gender_genre_attention
            """
        )
        return jsonify({"ok": True, "data": rows})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc), "data": []}), 500


@app.get("/api/top-movies")
def top_movies():
    try:
        rows = query_all(
            """
            SELECT rank_no, movie_id, title, ROUND(avg_rating, 3) AS avg_rating, rating_count
            FROM top_movies
            ORDER BY rank_no
            """
        )
        return jsonify({"ok": True, "data": rows})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc), "data": []}), 500


@app.get("/api/gender-genres")
def gender_genres():
    try:
        rows = query_all(
            """
            SELECT gender, genre, attention_count
            FROM gender_genre_attention
            ORDER BY genre, gender
            """
        )
        tops = query_all(
            """
            SELECT gender, genre, attention_count
            FROM gender_top_genres
            ORDER BY gender
            """
        )
        return jsonify({"ok": True, "data": rows, "tops": tops})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc), "data": [], "tops": []}), 500


@app.get("/api/stream-trend")
def stream_trend():
    try:
        rows = query_all(
            """
            SELECT batch_id,
                   DATE_FORMAT(batch_time, '%%H:%%i:%%s') AS batch_time,
                   rating_count,
                   ROUND(avg_rating, 3) AS avg_rating,
                   min_rating,
                   max_rating
            FROM stream_rating_trend
            ORDER BY batch_id
            LIMIT 60
            """
        )
        return jsonify({"ok": True, "data": rows})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc), "data": []}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
