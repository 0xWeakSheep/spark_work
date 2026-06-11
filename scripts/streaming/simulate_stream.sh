#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STREAM_DIR="${HDFS_DFS_STREAM_INPUT_DIR:-/movie/stream/input}"
INTERVAL_SECONDS="${STREAM_INTERVAL_SECONDS:-6}"

hdfs dfs -mkdir -p "${STREAM_DIR}"

for batch in "${ROOT_DIR}"/data/streaming/batches/ratings_batch_*.csv; do
  [ -f "${batch}" ] || continue
  target="${STREAM_DIR}/$(basename "${batch}")"
  echo "put ${batch} -> ${target}"
  hdfs dfs -put -f "${batch}" "${target}"
  sleep "${INTERVAL_SECONDS}"
done
