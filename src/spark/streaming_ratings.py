from __future__ import annotations

import argparse
import os
import time

import pymysql
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import DoubleType, IntegerType, LongType, StructField, StructType


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


def write_batch(batch_df, batch_id: int) -> None:
    summary = (
        batch_df.select(
            F.count("*").alias("rating_count"),
            F.avg("rating").alias("avg_rating"),
            F.min("rating").alias("min_rating"),
            F.max("rating").alias("max_rating"),
        )
        .collect()[0]
        .asDict()
    )
    if not summary["rating_count"]:
        return

    conn = pymysql.connect(**mysql_config())
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO stream_rating_trend
                  (batch_id, rating_count, avg_rating, min_rating, max_rating)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                  rating_count = VALUES(rating_count),
                  avg_rating = VALUES(avg_rating),
                  min_rating = VALUES(min_rating),
                  max_rating = VALUES(max_rating),
                  batch_time = CURRENT_TIMESTAMP
                """,
                (
                    int(batch_id),
                    int(summary["rating_count"]),
                    float(summary["avg_rating"]),
                    float(summary["min_rating"]),
                    float(summary["max_rating"]),
                ),
            )
    finally:
        conn.close()

    print(f"batch={batch_id}, summary={summary}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-runtime", type=int, default=0, help="Stop after N seconds. 0 means run forever.")
    args = parser.parse_args()

    stream_input = os.getenv("HDFS_STREAM_INPUT_DIR", "/movie/stream/input")
    checkpoint = os.getenv("HDFS_STREAM_CHECKPOINT_DIR", "/movie/checkpoints/rating_trend")

    spark = (
        SparkSession.builder.appName("MovieRatingStreaming")
        .master(os.getenv("SPARK_MASTER", "local[2]"))
        .getOrCreate()
    )
    spark.sparkContext.setLogLevel("WARN")

    schema = StructType(
        [
            StructField("user_id", IntegerType(), True),
            StructField("movie_id", IntegerType(), True),
            StructField("rating", DoubleType(), True),
            StructField("rating_timestamp", LongType(), True),
        ]
    )

    stream_df = (
        spark.readStream.schema(schema)
        .option("header", "false")
        .option("maxFilesPerTrigger", 1)
        .csv(stream_input)
        .filter(F.col("rating").isNotNull())
    )

    query = (
        stream_df.writeStream.foreachBatch(write_batch)
        .option("checkpointLocation", checkpoint)
        .trigger(processingTime="5 seconds")
        .start()
    )

    try:
        if args.max_runtime > 0:
            deadline = time.time() + args.max_runtime
            while time.time() < deadline and query.isActive:
                time.sleep(2)
            query.stop()
        else:
            query.awaitTermination()
    finally:
        spark.stop()


if __name__ == "__main__":
    main()

