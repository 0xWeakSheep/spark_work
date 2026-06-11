# 基于 Spark 的电影数据离线分析系统

本项目用于《Spark 大数据技术》课程考核，完成电影数据的离线分析、Spark SQL 统计、Spark Streaming 模拟实时分析、MySQL 存储和 Flask + ECharts 可视化展示。

## 1. 技术栈

- Docker Compose
- 默认运行：Spark 3.5.1 + HDFS 命令兼容本地存储，副本数按 1 处理
- 备用文件：`infra/docker/hadoop/` 保留 Hadoop 3.3.6 伪分布式镜像配置
- Spark 3.5.1，PySpark
- MariaDB/MySQL 兼容数据库，使用 MySQL Connector/J
- Flask 3 + 本地 ECharts 静态文件
- 数据集：`data/archive/moviedata-latest.rar`

## 2. 目录说明

```text
.
├── src/
│   ├── spark/              # Spark RDD / SQL / Streaming 作业
│   └── web/                # Flask + ECharts 可视化系统
├── scripts/
│   ├── data/               # 数据解压与清洗
│   ├── storage/            # HDFS 兼容目录与 MySQL 导入
│   ├── streaming/          # 流式模拟脚本
│   └── docs/               # 报告与 PPT 生成脚本
├── infra/docker/           # Spark/Hadoop 容器配置
├── config/mysql/           # MySQL 初始化 SQL
├── data/                   # 原始包、清洗数据、流式批次数据
├── docs/                   # 课程附件、报告、答辩材料
└── artifacts/              # 日志、渲染结果和中间产物
```

## 3. 一键初始化

首次运行会构建镜像、启动服务、解压数据、上传 HDFS、导入 MySQL，并执行 RDD 与 SQL 批处理作业。

```bash
docker compose up -d --build
docker compose exec spark-hadoop bash scripts/setup_all.sh
```

验证 HDFS：

```bash
docker compose exec spark-hadoop hdfs dfs -ls /movie/input
```

访问 Web 页面：

```text
http://127.0.0.1:5001/
```

## 4. Streaming 演示

启动一次 70 秒左右的流式演示：

```bash
docker compose exec spark-hadoop bash scripts/streaming/run_streaming_demo.sh
```

演示脚本会清空旧的流式输入目录，启动 Spark Structured Streaming 作业，再分批向 HDFS 追加评分数据。页面的“实时评分趋势”折线图会随 MySQL 中的 `stream_rating_trend` 表刷新。

## 5. 单独运行作业

RDD 前 20 高评分电影：

```bash
docker compose exec spark-hadoop spark-submit src/spark/rdd_top_movies.py
```

Spark SQL 男女电影类型统计：

```bash
docker compose exec spark-hadoop spark-submit src/spark/sql_gender_genres.py
```

## 6. 生成报告与 PPT

本仓库已经提供生成脚本。若要重新生成：

```bash
/Users/caoxiangrui/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/docs/build_report.py
/Users/caoxiangrui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/docs/build_ppt.mjs
```

输出位置：

- 课程总结报告：`docs/report/第X组_电影数据离线分析系统_课程总结报告.docx`
- 答辩 PPT：`docs/presentation/电影数据离线分析系统_答辩PPT.pptx`

## 7. 资源建议

- Docker Desktop 内存建议：8GB
- 磁盘空间建议：20GB
- HDFS/兼容存储副本数：1
