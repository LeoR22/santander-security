# Dockerfile
FROM python:3.11


WORKDIR /app

# Instala herramientas necesarias para compilar pandas y otras dependencias
USER root
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    libpq-dev \
    git \
    && apt-get clean

# Copia dependencias
COPY requirements.txt .

# Instala dependencias
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código fuente
COPY app ./app

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
