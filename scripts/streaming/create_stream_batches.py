#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
RATINGS = ROOT / "data" / "processed" / "Ratings.csv"
OUT = ROOT / "data" / "streaming" / "batches"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows-per-batch", type=int, default=1000)
    parser.add_argument("--batches", type=int, default=8)
    args = parser.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    for path in OUT.glob("ratings_batch_*.csv"):
        path.unlink()

    written = 0
    current_file = None
    current_writer = None
    current_batch = 0
    created_batches = 0
    current_rows = 0

    with RATINGS.open("r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            if current_writer is None or current_rows >= args.rows_per_batch:
                if current_file:
                    current_file.close()
                current_batch += 1
                if current_batch > args.batches:
                    break
                created_batches = current_batch
                current_rows = 0
                current_file = (OUT / f"ratings_batch_{current_batch:03d}.csv").open("w", encoding="utf-8", newline="")
                current_writer = csv.writer(current_file)
            current_writer.writerow([row["userId"], row["movieId"], row["rating"], row["timestamp"]])
            current_rows += 1
            written += 1

    if current_file:
        current_file.close()
    print(f"created {created_batches} stream batches, rows={written}, dir={OUT}")


if __name__ == "__main__":
    main()
