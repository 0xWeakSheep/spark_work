#!/usr/bin/env bash
set -euo pipefail

mkdir -p /tmp/hadoop-root/dfs/name /tmp/hadoop-root/dfs/data /workspace/artifacts/logs

if [ ! -f /tmp/hadoop-root/dfs/name/current/VERSION ]; then
  hdfs namenode -format -force -nonInteractive >/workspace/artifacts/logs/hdfs-format.log 2>&1
fi

hdfs --daemon start namenode
hdfs --daemon start datanode

for _ in $(seq 1 60); do
  if hdfs dfsadmin -safemode get >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

hdfs dfsadmin -safemode leave >/dev/null 2>&1 || true

echo "HDFS is running. Namenode UI: http://127.0.0.1:9870"
tail -f /dev/null
