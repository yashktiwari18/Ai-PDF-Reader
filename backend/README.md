# DocuMind AI — Backend

FastAPI-powered backend for AI Document Summarization and PDF Chat.

## Quick Start

```bash
# 1. Navigate to backend folder
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
copy .env.example .env       # Windows
# cp .env.example .env       # macOS / Linux
# → Edit .env and paste your GOOGLE_API_KEY

# 5. Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server is now running at **http://localhost:8000**

- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/upload/pdf` | Upload a PDF file |
| `POST` | `/api/summary/generate` | Generate AI summary |
| `GET` | `/api/summary/{document_id}` | Get cached summary |
| `POST` | `/api/chat/ask` | Ask a question (RAG) |
| `GET` | `/api/chat/history/{document_id}` | Get chat history |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                # FastAPI app, CORS, router registration
│   ├── routes/
│   │   ├── upload.py          # POST /api/upload/pdf
│   │   ├── summary.py         # POST /api/summary/generate
│   │   └── chat.py            # POST /api/chat/ask
│   ├── services/
│   │   ├── pdf_reader.py      # PyMuPDF text extraction
│   │   ├── text_chunker.py    # Sliding-window chunking
│   │   ├── embeddings.py      # SentenceTransformer + FAISS
│   │   └── rag_pipeline.py    # LangChain + Gemini LLM
│   ├── models/
│   │   └── request_models.py  # Pydantic schemas
│   └── utils/
│       └── helpers.py         # document_store, temp file utils
├── .env.example               # Environment variable template
├── .gitignore
└── requirements.txt
```

---

## Getting a Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in and click **Create API key**
3. Copy the key into your `.env` file

> To switch to OpenAI, change the import in `rag_pipeline.py` from
> `langchain_google_genai.ChatGoogleGenerativeAI` to
> `langchain_openai.ChatOpenAI` and set `OPENAI_API_KEY` in `.env`.
