FROM python:3.11-slim-bookworm

ENV PYSPARK_PYTHON=python3 \
    PYSPARK_DRIVER_PYTHON=python3 \
    HDFS_LOCAL_ROOT=/workspace/.hdfs \
    JDBC_JAR=/opt/jdbc/mysql-connector-j-8.4.0.jar \
    JDBC_DRIVER=com.mysql.cj.jdbc.Driver \
    JDBC_SCHEME=mysql

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      bash \
      ca-certificates \
      curl \
      libarchive-tools \
      libmariadb-java \
      mariadb-client \
      mariadb-server \
      openjdk-17-jre-headless \
      procps \
      tini && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
      cryptography==42.0.8 \
      PyMySQL==1.1.1 \
      pyspark==3.5.1

RUN mkdir -p /opt/jdbc

COPY infra/docker/spark-lite/hdfs /usr/local/bin/hdfs
COPY infra/docker/spark-lite/lib/mysql-connector-j-8.4.0.jar /opt/jdbc/mysql-connector-j-8.4.0.jar
RUN cp /opt/jdbc/mysql-connector-j-8.4.0.jar /usr/local/lib/python3.11/site-packages/pyspark/jars/

WORKDIR /workspace
ENTRYPOINT ["/usr/bin/tini", "--"]
