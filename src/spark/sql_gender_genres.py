from __future__ import annotations

import os

import pymysql
from pyspark.sql import SparkSession
from pyspark.sql import functions as F


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


def jdbc_options(table: str) -> dict:
    host = os.getenv("MYSQL_HOST", "mysql")
    port = os.getenv("MYSQL_PORT", "3306")
    db = os.getenv("MYSQL_DATABASE", "movie_analysis")
    driver = os.getenv("JDBC_DRIVER", "com.mysql.cj.jdbc.Driver")
    scheme = os.getenv("JDBC_SCHEME", "mysql")
    return {
        "url": f"jdbc:{scheme}://{host}:{port}/{db}?useSSL=false&serverTimezone=Asia/Shanghai",
        "driver": driver,
        "dbtable": table,
        "user": os.getenv("MYSQL_USER", "movie"),
        "password": os.getenv("MYSQL_PASSWORD", "movie123456"),
    }


def write_results(attention_rows, top_rows) -> None:
    conn = pymysql.connect(**mysql_config())
    try:
        with conn.cursor() as cursor:
            cursor.execute("TRUNCATE TABLE gender_genre_attention")
            cursor.executemany(
                """
                INSERT INTO gender_genre_attention (gender, genre, attention_count)
                VALUES (%s, %s, %s)
                """,
                [(row["gender"], row["genre"], int(row["attention_count"])) for row in attention_rows],
            )
            cursor.execute("TRUNCATE TABLE gender_top_genres")
            cursor.executemany(
                """
                INSERT INTO gender_top_genres (gender, genre, attention_count)
                VALUES (%s, %s, %s)
                """,
                [(row["gender"], row["genre"], int(row["attention_count"])) for row in top_rows],
            )
    finally:
        conn.close()


def main() -> None:
    jdbc_jar = os.getenv("JDBC_JAR", "/opt/jdbc/mysql-connector-j-8.4.0.jar")
    spark = (
        SparkSession.builder.appName("MovieGenderGenreSQL")
        .master(os.getenv("SPARK_MASTER", "local[2]"))
        .config("spark.jars", jdbc_jar)
        .config("spark.driver.extraClassPath", jdbc_jar)
        .config("spark.executor.extraClassPath", jdbc_jar)
        .getOrCreate()
    )
    try:
        movies = spark.read.format("jdbc").options(**jdbc_options("movies")).load()
        ratings = spark.read.format("jdbc").options(**jdbc_options("ratings")).load()
        users = spark.read.format("jdbc").options(**jdbc_options("users")).load()

        joined = (
            ratings.join(users, "user_id")
            .join(movies, "movie_id")
            .select("gender", F.explode(F.split(F.col("genres"), "\\|")).alias("genre"))
            .filter(F.col("genre") != "(no genres listed)")
        )
        joined.createOrReplaceTempView("gender_genres")

        attention = spark.sql(
            """
            SELECT gender, genre, COUNT(*) AS attention_count
            FROM gender_genres
            GROUP BY gender, genre
            ORDER BY genre, gender
            """
        )

        attention.createOrReplaceTempView("gender_genre_attention_view")
        top = spark.sql(
            """
            SELECT gender, genre, attention_count
            FROM (
              SELECT gender,
                     genre,
                     attention_count,
                     ROW_NUMBER() OVER (PARTITION BY gender ORDER BY attention_count DESC, genre ASC) AS rn
              FROM gender_genre_attention_view
            ) ranked
            WHERE rn = 1
            ORDER BY gender
            """
        )

        attention_rows = [row.asDict() for row in attention.collect()]
        top_rows = [row.asDict() for row in top.collect()]
        write_results(attention_rows, top_rows)
        for row in top_rows:
            print(row)
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
