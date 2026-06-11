from __future__ import annotations

import csv
import os
from io import StringIO

import pymysql
from pyspark import SparkConf, SparkContext


HDFS_INPUT_DIR = os.getenv("HDFS_INPUT_DIR", "/movie/input")


def parse_csv_partition(lines):
    reader = csv.reader(lines)
    for row in reader:
        yield row


def parse_movie(row):
    if not row or row[0] == "movieId" or len(row) < 3:
        return None
    try:
        return int(row[0]), row[1]
    except ValueError:
        return None


def parse_rating(row):
    if not row or row[0] == "userId" or len(row) < 4:
        return None
    try:
        return int(row[1]), (float(row[2]), 1)
    except ValueError:
        return None


def not_none(item):
    return item is not None


def mysql_config() -> dict:
    return {
        "host": os.getenv("MYSQL_HOST", "mysql"),
        "port": int(os.getenv("MYSQL_PORT", "3306")),
        "user": os.getenv("MYSQL_USER", "movie"),
        "password": os.getenv("MYSQL_PASSWORD", "movie123456"),
        "database": os.getenv("MYSQL_DATABASE", "movie_analysis"),
        "charset": "utf8mb4",
        "autocommit": True,
    }


def write_top_movies(rows):
    conn = pymysql.connect(**mysql_config())
    try:
        with conn.cursor() as cursor:
            cursor.execute("TRUNCATE TABLE top_movies")
            cursor.executemany(
                """
                INSERT INTO top_movies (rank_no, movie_id, title, avg_rating, rating_count)
                VALUES (%s, %s, %s, %s, %s)
                """,
                rows,
            )
    finally:
        conn.close()


def main() -> None:
    conf = SparkConf().setAppName("MovieTop20RDD").setMaster(os.getenv("SPARK_MASTER", "local[2]"))
    sc = SparkContext(conf=conf)
    try:
        movies = (
            sc.textFile(f"{HDFS_INPUT_DIR}/Movies.csv")
            .mapPartitions(parse_csv_partition)
            .map(parse_movie)
            .filter(not_none)
        )
        ratings = (
            sc.textFile(f"{HDFS_INPUT_DIR}/Ratings.csv")
            .mapPartitions(parse_csv_partition)
            .map(parse_rating)
            .filter(not_none)
        )

        rating_stats = ratings.reduceByKey(lambda left, right: (left[0] + right[0], left[1] + right[1]))
        averages = rating_stats.mapValues(lambda item: (round(item[0] / item[1], 6), item[1]))
        top = (
            averages.join(movies)
            .map(lambda item: (item[1][0][0], item[1][0][1], item[0], item[1][1]))
            .sortBy(lambda item: (-item[0], -item[1], item[3]))
            .take(20)
        )

        rows = [
            (rank, movie_id, title, float(avg_rating), int(rating_count))
            for rank, (avg_rating, rating_count, movie_id, title) in enumerate(top, start=1)
        ]
        write_top_movies(rows)
        for row in rows:
            print(row)
    finally:
        sc.stop()


if __name__ == "__main__":
    main()

