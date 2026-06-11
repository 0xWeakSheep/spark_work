#!/usr/bin/env python3
from __future__ import annotations

import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw" / "moviedata-latest"
PROCESSED = ROOT / "data" / "processed"


def require_source(name: str) -> Path:
    path = RAW / name
    if not path.exists():
        raise FileNotFoundError(f"missing source file: {path}")
    return path


def clean_movies() -> int:
    src = require_source("Movies.csv")
    dst = PROCESSED / "Movies.csv"
    count = 0
    with src.open("r", encoding="utf-8-sig", errors="replace", newline="") as fin, dst.open("w", encoding="utf-8", newline="") as fout:
        reader = csv.DictReader(fin)
        writer = csv.DictWriter(fout, fieldnames=["movieId", "title", "genres"])
        writer.writeheader()
        for row in reader:
            try:
                movie_id = int(row["movieId"])
            except (TypeError, ValueError):
                continue
            writer.writerow(
                {
                    "movieId": movie_id,
                    "title": (row.get("title") or "").strip(),
                    "genres": (row.get("genres") or "(no genres listed)").strip(),
                }
            )
            count += 1
    return count


def clean_ratings() -> int:
    src = require_source("Ratings.csv")
    dst = PROCESSED / "Ratings.csv"
    count = 0
    with src.open("r", encoding="utf-8-sig", errors="replace", newline="") as fin, dst.open("w", encoding="utf-8", newline="") as fout:
        reader = csv.DictReader(fin)
        writer = csv.DictWriter(fout, fieldnames=["userId", "movieId", "rating", "timestamp"])
        writer.writeheader()
        for row in reader:
            try:
                user_id = int(row["userId"])
                movie_id = int(row["movieId"])
                rating = float(row["rating"])
                ts = int(row["timestamp"])
            except (TypeError, ValueError):
                continue
            if not 0 <= rating <= 5:
                continue
            writer.writerow({"userId": user_id, "movieId": movie_id, "rating": rating, "timestamp": ts})
            count += 1
    return count


def clean_tags() -> int:
    src = require_source("Tags.csv")
    dst = PROCESSED / "Tags.csv"
    count = 0
    with src.open("r", encoding="utf-8-sig", errors="replace", newline="") as fin, dst.open("w", encoding="utf-8", newline="") as fout:
        reader = csv.DictReader(fin)
        writer = csv.DictWriter(fout, fieldnames=["userId", "movieId", "tag", "timestamp"])
        writer.writeheader()
        for row in reader:
            try:
                user_id = int(row["userId"])
                movie_id = int(row["movieId"])
                ts = int(row["timestamp"])
            except (TypeError, ValueError):
                continue
            tag = (row.get("tag") or "").strip()
            if not tag:
                continue
            writer.writerow({"userId": user_id, "movieId": movie_id, "tag": tag[:255], "timestamp": ts})
            count += 1
    return count


def clean_users() -> int:
    src = require_source("Users.dat")
    dat_dst = PROCESSED / "Users.dat"
    csv_dst = PROCESSED / "Users.csv"
    count = 0
    with src.open("r", encoding="utf-8-sig", errors="replace") as fin, \
        dat_dst.open("w", encoding="utf-8", newline="") as fdat, \
        csv_dst.open("w", encoding="utf-8", newline="") as fcsv:
        writer = csv.DictWriter(fcsv, fieldnames=["userId", "gender", "age", "occupation", "zipCode"])
        writer.writeheader()
        header = fin.readline().strip()
        fdat.write(header + "\n")
        for line in fin:
            line = line.strip()
            if not line:
                continue
            parts = line.split("::")
            if len(parts) != 5:
                continue
            try:
                user_id = int(parts[0])
                age = int(parts[2])
                occupation = int(parts[3])
            except ValueError:
                continue
            gender = parts[1].strip().upper()
            if gender not in {"F", "M"}:
                continue
            zip_code = parts[4].strip()
            fdat.write(f"{user_id}::{gender}::{age}::{occupation}::{zip_code}\n")
            writer.writerow(
                {
                    "userId": user_id,
                    "gender": gender,
                    "age": age,
                    "occupation": occupation,
                    "zipCode": zip_code,
                }
            )
            count += 1
    return count


def main() -> None:
    PROCESSED.mkdir(parents=True, exist_ok=True)
    counts = {
        "movies": clean_movies(),
        "ratings": clean_ratings(),
        "tags": clean_tags(),
        "users": clean_users(),
    }
    for key, value in counts.items():
        print(f"{key}: {value}")


if __name__ == "__main__":
    main()
