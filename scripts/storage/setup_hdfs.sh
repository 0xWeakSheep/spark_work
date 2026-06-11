#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HDFS_DFS_INPUT_DIR="${HDFS_DFS_INPUT_DIR:-/movie/input}"
HDFS_DFS_STREAM_INPUT_DIR="${HDFS_DFS_STREAM_INPUT_DIR:-/movie/stream/input}"
HDFS_DFS_STREAM_CHECKPOINT_DIR="${HDFS_DFS_STREAM_CHECKPOINT_DIR:-/movie/checkpoints/rating_trend}"

hdfs dfs -mkdir -p "${HDFS_DFS_INPUT_DIR}" /movie/output "${HDFS_DFS_STREAM_INPUT_DIR}"
hdfs dfs -rm -r -f "${HDFS_DFS_STREAM_CHECKPOINT_DIR}" >/dev/null 2>&1 || true

hdfs dfs -put -f "${ROOT_DIR}/data/processed/Movies.csv" "${HDFS_DFS_INPUT_DIR}/Movies.csv"
hdfs dfs -put -f "${ROOT_DIR}/data/processed/Ratings.csv" "${HDFS_DFS_INPUT_DIR}/Ratings.csv"
hdfs dfs -put -f "${ROOT_DIR}/data/processed/Tags.csv" "${HDFS_DFS_INPUT_DIR}/Tags.csv"
hdfs dfs -put -f "${ROOT_DIR}/data/processed/Users.dat" "${HDFS_DFS_INPUT_DIR}/Users.dat"

hdfs dfs -ls "${HDFS_DFS_INPUT_DIR}"
