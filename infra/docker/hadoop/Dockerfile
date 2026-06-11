FROM eclipse-temurin:11-jdk-jammy

ARG HADOOP_VERSION=3.3.6
ARG SPARK_VERSION=3.5.1
ARG MYSQL_CONNECTOR_VERSION=8.4.0

ENV HADOOP_HOME=/opt/hadoop \
    SPARK_HOME=/opt/spark \
    HADOOP_CONF_DIR=/opt/hadoop/etc/hadoop \
    JAVA_HOME=/opt/java/openjdk \
    PYSPARK_PYTHON=python3 \
    PYSPARK_DRIVER_PYTHON=python3 \
    PATH=/opt/hadoop/bin:/opt/hadoop/sbin:/opt/spark/bin:/opt/spark/sbin:$PATH

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      bash curl ca-certificates libarchive-tools netcat-openbsd procps python3 python3-pip tini && \
    rm -rf /var/lib/apt/lists/*

RUN set -eux; \
    curl -fL --retry 8 --retry-delay 5 --retry-all-errors \
      -o /tmp/hadoop.tgz \
      "https://archive.apache.org/dist/hadoop/common/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz"; \
    tar -xzf /tmp/hadoop.tgz -C /opt; \
    mv "/opt/hadoop-${HADOOP_VERSION}" "${HADOOP_HOME}"; \
    curl -fL --retry 8 --retry-delay 5 --retry-all-errors \
      -o /tmp/spark.tgz \
      "https://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop3.tgz"; \
    tar -xzf /tmp/spark.tgz -C /opt; \
    mv "/opt/spark-${SPARK_VERSION}-bin-hadoop3" "${SPARK_HOME}"; \
    curl -fL --retry 8 --retry-delay 5 --retry-all-errors \
      -o "${SPARK_HOME}/jars/mysql-connector-j-${MYSQL_CONNECTOR_VERSION}.jar" \
      "https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/${MYSQL_CONNECTOR_VERSION}/mysql-connector-j-${MYSQL_CONNECTOR_VERSION}.jar"; \
    rm -f /tmp/hadoop.tgz /tmp/spark.tgz

RUN pip3 install --no-cache-dir PyMySQL==1.1.1 cryptography==42.0.8

COPY infra/docker/hadoop/core-site.xml ${HADOOP_CONF_DIR}/core-site.xml
COPY infra/docker/hadoop/hdfs-site.xml ${HADOOP_CONF_DIR}/hdfs-site.xml

WORKDIR /workspace

ENTRYPOINT ["/usr/bin/tini", "--"]
