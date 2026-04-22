# Walkthrough - Dockerization with Persistence

I have successfully containerized the RAONE platform using Docker and Docker Compose. This setup simplifies deployment and ensures that all dependencies (Database, AI Models, Frontend) work together seamlessly with persistent storage.

## Changes Made

### Backend
- Created [Dockerfile](file:///c:/Users/susha/OneDrive/Desktop/Resume%20Level%20Project/Your%20Personal%20Transformer/backend/Dockerfile): Uses a slim Python 3.11 image and installs necessary build tools for FAISS and PostgreSQL.

### Frontend
- Created [Dockerfile](file:///c:/Users/susha/OneDrive/Desktop/Resume%20Level%20Project/Your%20Personal%20Transformer/frontend/Dockerfile): A multi-stage build that compiles the React app and serves it using Nginx.
- Created [nginx.conf](file:///c:/Users/susha/OneDrive/Desktop/Resume%20Level%20Project/Your%20Personal%20Transformer/frontend/nginx.conf): Configured to handle Single Page Application (SPA) routing and reverse-proxy API calls to the backend.

### Optimization
- Created [.dockerignore](file:///c:/Users/susha/OneDrive/Desktop/Resume%20Level%20Project/Your%20Personal%20Transformer/backend/.dockerignore) files for both Backend and Frontend to exclude `node_modules`, `venv`, and local data from the build context.

### Orchestration & Persistence
- Created [docker-compose.yml](file:///c:/Users/susha/OneDrive/Desktop/Resume%20Level%20Project/Your%20Personal%20Transformer/docker-compose.yml): Orchestrates three services:
    - `db`: PostgreSQL 15 with a persistent volume (`postgres_data`).
    - `backend`: FastAPI app with persistent volumes for uploads (`backend_uploads`) and AI indices (`faiss_data`).
    - `frontend`: Nginx serving the application on port 80.
- Updated [.env.example](file:///c:/Users/susha/OneDrive/Desktop/Resume%20Level%20Project/Your%20Personal%20Transformer/.env.example): Added Docker-specific default values.

## How to Run

1.  **Configure Environment**:
    Copy `.env.example` to `.env` and fill in your API keys (Groq, etc.):
    ```bash
    cp .env.example .env
    ```

2.  **Start the Platform**:
    ```bash
    docker-compose up --build -d
    ```

3.  **Access**:
    - **Frontend**: `http://localhost`
    - **Backend API Docs**: `http://localhost:8000/docs`

## Verification
- **Build Success**: Both multi-stage and slim builds completed without errors.
- **Persistence**: Volumes are correctly defined in `docker-compose.yml` to prevent data loss.
- **Routing**: Nginx is configured to fallback to `index.html`, supporting React Router's client-side routing.
