# RAONE - Your Personal Transformer
<img width="897" height="262" alt="Screenshot 2026-05-01 184955" src="https://github.com/user-attachments/assets/1223d84e-eef9-4905-8e21-ae81424af730" />


RAONE is a sophisticated, multi-tenant AI Chatbot SaaS platform designed for high-performance Retrieval-Augmented Generation (RAG). It enables businesses and individuals to build, train, and deploy intelligent chatbots that can chat with their private knowledge base using state-of-the-art LLMs.

---

## 🚀 Key Features

- **Multi-Tenant Architecture**: Securely isolated data and chat history per company/user.
- **Advanced RAG Pipeline**: High-accuracy retrieval using a hybrid approach (Dense + Sparse).
- **LLM Fallback Chain**: Intelligent routing across Groq, OpenRouter, HuggingFace, and local Ollama to ensure 100% uptime.
- **Context-Aware Memory**: Large technical inputs are preserved and integrated into the RAG cycle for more accurate technical assistance.
- **Premium UI**: Modern dark-themed dashboard built with React and Tailwind CSS.

<img width="712" height="616" alt="Screenshot 2026-05-01 185152" src="https://github.com/user-attachments/assets/a7701d0f-df4f-40db-90ee-ca7328ceead1" />


---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL with SQLAlchemy (Async)
- **Authentication**: JWT-based Auth with API Key management
- **Vector Store**: FAISS (Facebook AI Similarity Search)

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS / Vanilla CSS
- **State Management**: Zustand / React Context

### AI & RAG
- **LLMs**: Llama 3.3 (70B) via Groq/OpenRouter, HuggingFace, or Ollama.
- **Embeddings**: `all-MiniLM-L6-v2` (Sentence-Transformers).
- **Search**: Hybrid search (FAISS Vector Search + BM25 Keyword Search).

### Deployment
- **Git**: Version control and collaboration for managing codebase and tracking changes.
- **Docker**: Containerization of services to ensure consistent environments across development and production.
- **Jenkins**: Automation server for building, testing, and deploying applications via pipelines.
- **AWS**: Cloud infrastructure for hosting services, scaling applications, and managing resources.
- **CI/CD**: Automated pipelines for continuous integration and continuous deployment. 
- **Microservices Architecture**: Multi-container setup with independently deployable services.

---

## 🧠 RAG Pipeline & Models

The project implements a modular RAG pipeline optimized for speed and accuracy.

### 1. Ingestion Phase
Transforming raw documents into searchable intelligence.
- **Documents**: Supports PDF (`PyPDF2`), DOCX (`python-docx`), and Web Content (`BeautifulSoup`).
- **Processing**: Text cleaning and normalization (`text_processing.py`).
- **Chunking**: Recursive character splitting with overlap to maintain semantic context.
- **Embedding**: `all-MiniLM-L6-v2` encodes chunks into 384-dimensional vectors.
- **Storage**: Vectors are indexed in FAISS, while metadata and raw text are stored in PostgreSQL.

### 2. Retrieval Phase
Finding the most relevant needle in the haystack.
- **Dense Retrieval**: FAISS performs similarity search based on the query embedding.
- **Sparse Retrieval**: BM25 (via `rank-bm25`) performs keyword-based scoring.
- **Hybrid Search**: Results from both methods are merged to capture both semantic meaning and exact keyword matches.
- **Namespace Isolation**: Queries are strictly routed to the sub-indices belonging to the specific company/user.

### 3. Generation Phase
Synthesizing human-like responses with ground-truth data.
- **Prompt Engineering**: Dynamic prompt construction that prioritizes retrieved context.
- **LLM Selection**: The system uses a fallback chain:
    1. **Groq** (Primary - Llama-3.3-70B)
    2. **OpenRouter** (Fallback 1)
    3. **HuggingFace** (Fallback 2)
    4. **Ollama** (Local Fallback - Llama-3.4)

---

<img width="1378" height="614" alt="Screenshot 2026-05-01 185054" src="https://github.com/user-attachments/assets/4d2c3e3b-54ab-4fcd-af62-a7f9b919b90f" />


## 🏗️ Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL instance

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory (refer to `.env.example`):
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/RAONE
GROQ_API_KEY=your_groq_key
JWT_SECRET_KEY=your_secret
```

Run the server:
```bash
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

---

---

## 🔧 Changelog: Improvements & Bug Fixes in v1.0.0

* **CI/CD Pipeline Stability:** Resolved workspace extraction and pathing inconsistencies in the Jenkins `Clone Code` and environment injection stages.
* **Docker Networking:** Fixed container-to-container communication by re-routing backend database connections from `localhost` to the internal `db` Docker service.
* **Database Authentication:** Resolved `asyncpg.exceptions.InvalidPasswordError` by synchronizing Jenkins environment variables with PostgreSQL container initialization defaults.
* **Environment Management:** Implemented secure, dynamic `.env` file injection via Jenkins Credentials, eliminating hardcoded secrets in the repository.

---
<img width="1893" height="866" alt="Screenshot 2026-05-01 185427" src="https://github.com/user-attachments/assets/35d87ab6-9ff9-44e9-bc99-210cc3c80f20" />


## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.
