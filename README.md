# 基于 Spark 的电影数据离线分析系统

本项目用于《Spark 大数据技术》课程实验与答辩演示，完成电影数据的离线批处理分析、Spark SQL 结构化统计、Structured Streaming 模拟实时分析、MySQL 结果存储和 Flask + ECharts 可视化展示。

## 目录结构

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
├── data/                   # 原始数据、清洗数据、流式批次数据
├── docs/                   # 课程附件、报告、答辩材料、验收截图
└── artifacts/              # 本地日志和中间产物，默认不提交
```

## 本地环境

已验证环境：

```text
Docker 27.3.1
Spark 3.5.1
PySpark 3.5.1
OpenJDK 17
MariaDB 10.11
Flask 3
ECharts 本地静态文件
```

本项目使用 Docker Compose 运行，不要求本机单独安装 Hadoop 或 Spark。

## 一键运行

启动容器：

```bash
docker compose up -d --build
```

运行数据准备、HDFS 兼容上传、MySQL 导入、RDD 作业和 Spark SQL 作业：

```bash
docker compose exec spark-hadoop bash scripts/setup_all.sh
```

运行 Streaming 演示：

```bash
docker compose exec spark-hadoop bash scripts/streaming/run_streaming_demo.sh
```

访问页面：

```text
http://127.0.0.1:5001/
```

## 核心 Spark 作业

```text
src/spark/rdd_top_movies.py
```

读取 HDFS 兼容目录中的电影和评分数据，用 RDD 的 `reduceByKey` 计算每部电影平均评分，取 Top 20 写入 `top_movies`。

```text
src/spark/sql_gender_genres.py
```

通过 JDBC 读取 MySQL 中的 `movies`、`ratings`、`users`，用 Spark SQL 关联用户性别和电影类型，统计男女用户关注的电影类型。

```text
src/spark/streaming_ratings.py
```

用 Spark Structured Streaming 监听评分批次文件，按微批计算评分数量、平均分、最低分、最高分，写入 `stream_rating_trend`。

## 当前验收结果

已在本地完成完整实验。验收记录与页面截图见：

```text
docs/verification/experiment_verification.md
docs/verification/dashboard.png
docs/verification/dashboard-full.png
```
