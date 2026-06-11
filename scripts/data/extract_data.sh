#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ARCHIVE="${ROOT_DIR}/data/archive/moviedata-latest.rar"
RAW_DIR="${ROOT_DIR}/data/raw"

if [ ! -f "${ARCHIVE}" ]; then
  echo "Missing archive: ${ARCHIVE}" >&2
  exit 1
fi

mkdir -p "${RAW_DIR}"

if [ -f "${RAW_DIR}/moviedata-latest/Movies.csv" ]; then
  echo "Raw data already extracted: ${RAW_DIR}/moviedata-latest"
  exit 0
fi

bsdtar -xf "${ARCHIVE}" -C "${RAW_DIR}"
echo "Extracted data to ${RAW_DIR}/moviedata-latest"
