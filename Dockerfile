FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POPULATION_RASTER_PATH=/data/ind_pop_2025_CN_100m_R2025A_v1.tif

WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends -y ca-certificates curl libexpat1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-backend.txt ./
RUN pip install --no-cache-dir -r requirements-backend.txt

COPY backend ./backend
COPY public/kerala-boundary.geojson ./public/kerala-boundary.geojson

RUN mkdir -p /data \
    && curl --fail --location --retry 3 \
      "https://media.githubusercontent.com/media/AlanJames2005/KDRS/1cad5316393049da306f910ea9373a9e1ef244c3/ind_pop_2025_CN_100m_R2025A_v1.tif" \
      --output "$POPULATION_RASTER_PATH" \
    && test -s "$POPULATION_RASTER_PATH" \
    && useradd --system --uid 10001 app \
    && chown app:app "$POPULATION_RASTER_PATH"

USER app

EXPOSE 10000
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
