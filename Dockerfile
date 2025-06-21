
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY rag_module.py .
COPY rag_server.py .

# Create directory for ChromaDB
RUN mkdir -p chromadb

# Expose port
EXPOSE 8000

# Set environment variables
ENV CHROMADB_PATH=/app/chromadb
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["python", "rag_server.py"]
