FROM python:3.14-slim

WORKDIR /app

# libgomp1 is required by ctranslate2 (faster-whisper's inference engine) at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY src ./src
COPY data ./data

EXPOSE 8123

CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8123}"]
