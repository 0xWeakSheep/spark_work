#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

STREAM_DIR="${HDFS_DFS_STREAM_INPUT_DIR:-/movie/stream/input}"
CHECKPOINT_DIR="${HDFS_DFS_STREAM_CHECKPOINT_DIR:-/movie/checkpoints/rating_trend}"

python3 scripts/streaming/create_stream_batches.py --rows-per-batch 1000 --batches 8
hdfs dfs -rm -r -f "${STREAM_DIR}" "${CHECKPOINT_DIR}" >/dev/null 2>&1 || true
hdfs dfs -mkdir -p "${STREAM_DIR}"

python3 - <<'PY'
import os
import pymysql

conn = pymysql.connect(
    host=os.getenv("MYSQL_HOST", "mysql"),
    port=int(os.getenv("MYSQL_PORT", "3306")),
    user=os.getenv("MYSQL_USER", "movie"),
    password=os.getenv("MYSQL_PASSWORD", "movie123456"),
    database=os.getenv("MYSQL_DATABASE", "movie_analysis"),
    charset="utf8mb4",
    autocommit=True,
)
with conn.cursor() as cursor:
    cursor.execute("TRUNCATE TABLE stream_rating_trend")
conn.close()
PY

spark-submit src/spark/streaming_ratings.py --max-runtime 75 &
STREAM_PID=$!
sleep 14
bash scripts/streaming/simulate_stream.sh
wait "${STREAM_PID}" || true

echo "Streaming demo complete. Refresh http://127.0.0.1:5001/ to view the trend."
