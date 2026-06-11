FROM python:3.11-slim

WORKDIR /workspace/web

COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

EXPOSE 5000

