#!/usr/bin/env bash
set -euo pipefail

mkdir -p "${HDFS_LOCAL_ROOT:-/workspace/.hdfs}/movie/input" \
         "${HDFS_LOCAL_ROOT:-/workspace/.hdfs}/movie/stream/input" \
         /workspace/artifacts/logs \
         /run/mysqld

chown -R mysql:mysql /run/mysqld /var/lib/mysql

SOCKET=/run/mysqld/mysqld.sock

if [ ! -f /var/lib/mysql/.movie_initialized ]; then
  find /var/lib/mysql -mindepth 1 -maxdepth 1 -exec rm -rf {} +
  mariadb-install-db \
    --user=mysql \
    --datadir=/var/lib/mysql \
    --auth-root-authentication-method=normal \
    >/workspace/artifacts/logs/mariadb-install.log 2>&1
fi

mariadbd \
  --user=mysql \
  --datadir=/var/lib/mysql \
  --socket="${SOCKET}" \
  --bind-address=0.0.0.0 \
  --port=3306 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci \
  >/workspace/artifacts/logs/mariadb.log 2>&1 &

for _ in $(seq 1 60); do
  if mariadb-admin --socket="${SOCKET}" -uroot ping --silent >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

mariadb --socket="${SOCKET}" -uroot <<'SQL'
CREATE USER IF NOT EXISTS 'movie'@'%' IDENTIFIED BY 'movie123456';
CREATE USER IF NOT EXISTS 'movie'@'localhost' IDENTIFIED BY 'movie123456';
GRANT ALL PRIVILEGES ON movie_analysis.* TO 'movie'@'%';
GRANT ALL PRIVILEGES ON movie_analysis.* TO 'movie'@'localhost';
FLUSH PRIVILEGES;
SQL

mariadb --socket="${SOCKET}" -uroot < /workspace/config/mysql/init.sql
touch /var/lib/mysql/.movie_initialized
chown mysql:mysql /var/lib/mysql/.movie_initialized

echo "Spark lightweight container is running."
echo "HDFS-compatible local root: ${HDFS_LOCAL_ROOT:-/workspace/.hdfs}"
echo "MariaDB/MySQL-compatible service is running on port 3306."
tail -f /dev/null
