# 实验验收记录

验收日期：2026-06-11

## 运行环境

```text
Docker 27.3.1
Spark 3.5.1
PySpark 3.5.1
OpenJDK 17.0.19
MariaDB 10.11
Flask 3.1.2
ECharts 本地静态文件
```

## 已执行命令

```bash
docker compose up -d --build
docker compose exec -T spark-hadoop bash scripts/setup_all.sh
docker compose exec -T spark-hadoop bash scripts/streaming/run_streaming_demo.sh
```

## 数据处理结果

```text
movies: 45843
ratings: 1048575
tags: 753155
users: 6040
```

HDFS 兼容目录 `/movie/input` 已上传：

```text
Movies.csv
Ratings.csv
Tags.csv
Users.dat
```

## MySQL 验收结果

```text
movies                  45843
ratings                 1048575
users                   6040
tags                    753155
top_movies              20
gender_genre_attention  38
gender_top_genres       2
stream_rating_trend     8
```

Top 5 高评分电影：

```text
1  There Once Was a Dog (1982)                         5.000  3
2  Ambassador, The (Ambassadøren) (2011)               5.000  2
3  Death on the Staircase (Soupçons) (2004)            5.000  2
4  Dragonquest (2009)                                  5.000  2
5  Galaxy Express 999 (Ginga tetsudô Three-Nine)       5.000  2
```

男女用户关注最多类型：

```text
F  Drama  74129
M  Drama  186562
```

Streaming 批次结果：

```text
batch 0  count 1000  avg 3.548  min 0.5  max 5.0
batch 1  count 1000  avg 3.831  min 0.5  max 5.0
batch 2  count 1000  avg 3.647  min 0.5  max 5.0
batch 3  count 1000  avg 3.551  min 0.5  max 5.0
batch 4  count 1000  avg 3.538  min 0.5  max 5.0
batch 5  count 1000  avg 3.964  min 0.5  max 5.0
batch 6  count 1000  avg 3.736  min 0.5  max 5.0
batch 7  count 1000  avg 3.510  min 0.5  max 5.0
```

## Web/API 验收

首页：

```text
http://127.0.0.1:5001/
HTTP 200 OK
```

接口：

```text
/api/summary       ok=true
/api/top-movies    ok=true
/api/gender-genres ok=true
/api/stream-trend  ok=true
```

页面截图：

```text
docs/verification/dashboard.png
docs/verification/dashboard-full.png
```
