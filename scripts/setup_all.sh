#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

bash scripts/data/extract_data.sh
python3 scripts/data/prepare_data.py
bash scripts/storage/setup_hdfs.sh
python3 scripts/storage/load_mysql.py
spark-submit src/spark/rdd_top_movies.py
spark-submit src/spark/sql_gender_genres.py
python3 scripts/streaming/create_stream_batches.py --rows-per-batch 1000 --batches 8

echo "Setup complete. Open http://127.0.0.1:5001/ after the web container is running."
