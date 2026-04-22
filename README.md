# RAONE - Your Personal Transformer

RAONE is a sophisticated, multi-tenant AI Chatbot SaaS platform designed for high-performance Retrieval-Augmented Generation (RAG). It enables businesses and individuals to build, train, and deploy intelligent chatbots that can chat with their private knowledge base using state-of-the-art LLMs.

---

## 🚀 Key Features

- **Multi-Tenant Architecture**: Securely isolated data and chat history per company/user.
- **Advanced RAG Pipeline**: High-accuracy retrieval using a hybrid approach (Dense + Sparse).
- **LLM Fallback Chain**: Intelligent routing across Groq, OpenRouter, HuggingFace, and local Ollama to ensure 100% uptime.
- **Context-Aware Memory**: Large technical inputs are preserved and integrated into the RAG cycle for more accurate technical assistance.
- **Premium UI**: Modern dark-themed dashboard built with React and Tailwind CSS.

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

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.
