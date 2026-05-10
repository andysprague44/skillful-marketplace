# Context: ``api/`` (directory containing this Dockerfile on Railway).
FROM python:3.12-slim-bookworm

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir --upgrade pip

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Railway provides PORT at runtime; shell form expands $PORT.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
