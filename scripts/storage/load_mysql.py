#!/usr/bin/env python3
from __future__ import annotations

import csv
import os
import time
from pathlib import Path
from typing import Iterable

import pymysql


ROOT = Path(__file__).resolve().parents[2]
PROCESSED = ROOT / "data" / "processed"
BATCH_SIZE = int(os.getenv("MYSQL_LOAD_BATCH_SIZE", "5000"))


def mysql_config() -> dict:
    return {
        "host": os.getenv("MYSQL_HOST", "mysql"),
        "port": int(os.getenv("MYSQL_PORT", "3306")),
        "user": os.getenv("MYSQL_USER", "movie"),
        "password": os.getenv("MYSQL_PASSWORD", "movie123456"),
        "database": os.getenv("MYSQL_DATABASE", "movie_analysis"),
        "charset": "utf8mb4",
        "autocommit": False,
    }


def connect_with_retry() -> pymysql.Connection:
    last_error = None
    for _ in range(60):
        try:
            return pymysql.connect(**mysql_config())
        except Exception as exc:  # pragma: no cover - operational retry
            last_error = exc
            time.sleep(2)
    raise RuntimeError(f"MySQL is not ready: {last_error}")


def iter_batches(rows: Iterable[tuple], size: int) -> Iterable[list[tuple]]:
    batch: list[tuple] = []
    for row in rows:
        batch.append(row)
        if len(batch) >= size:
            yield batch
            batch = []
    if batch:
        yield batch


def load_table(conn: pymysql.Connection, table: str, columns: list[str], rows: Iterable[tuple]) -> int:
    placeholders = ",".join(["%s"] * len(columns))
    sql = f"INSERT INTO {table} ({','.join(columns)}) VALUES ({placeholders})"
    total = 0
    with conn.cursor() as cursor:
        cursor.execute(f"TRUNCATE TABLE {table}")
        for batch in iter_batches(rows, BATCH_SIZE):
            cursor.executemany(sql, batch)
            total += len(batch)
            conn.commit()
            print(f"{table}: loaded {total}")
    return total


def movie_rows() -> Iterable[tuple]:
    with (PROCESSED / "Movies.csv").open("r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            yield int(row["movieId"]), row["title"], row["genres"]


def rating_rows() -> Iterable[tuple]:
    with (PROCESSED / "Ratings.csv").open("r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            yield int(row["userId"]), int(row["movieId"]), float(row["rating"]), int(row["timestamp"])


def user_rows() -> Iterable[tuple]:
    with (PROCESSED / "Users.csv").open("r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            yield int(row["userId"]), row["gender"], int(row["age"]), int(row["occupation"]), row["zipCode"]


def tag_rows() -> Iterable[tuple]:
    with (PROCESSED / "Tags.csv").open("r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            yield int(row["userId"]), int(row["movieId"]), row["tag"], int(row["timestamp"])


def main() -> None:
    conn = connect_with_retry()
    try:
        counts = {
            "movies": load_table(conn, "movies", ["movie_id", "title", "genres"], movie_rows()),
            "users": load_table(conn, "users", ["user_id", "gender", "age", "occupation", "zip_code"], user_rows()),
            "ratings": load_table(conn, "ratings", ["user_id", "movie_id", "rating", "rating_timestamp"], rating_rows()),
            "tags": load_table(conn, "tags", ["user_id", "movie_id", "tag", "tag_timestamp"], tag_rows()),
        }
        print("MySQL load complete:", counts)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
