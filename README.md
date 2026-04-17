# ChatPDF AI Assistant

An AI-powered application that allows users to upload PDF documents and interact with their content using Google Gemini. The system implements a lightweight Retrieval-Augmented Generation (RAG) pipeline based on text chunking and similarity search.

---

## Demo

Upload a PDF file, then ask questions about its content. The system will retrieve relevant sections and generate answers using an LLM.

---

## Features

- PDF upload and processing
- Text extraction using pdf-parse
- Automatic text chunking
- Lightweight similarity-based retrieval (basic RAG implementation)
- Context-aware responses using Google Gemini
- Chat interface with conversation history
- Embedded PDF viewer
- Reset functionality

---

## Architecture

PDF Upload
→ Text Extraction (pdf-parse)
→ Chunking (text segmentation)
→ Similarity Search (keyword-based matching)
→ Top-K Relevant Chunks
→ Prompt Construction
→ Gemini LLM Response Generation

---

## Tech Stack

- Node.js
- Express.js
- Multer
- pdf-parse
- Google Gemini API
- EJS templates
- JavaScript (ESM modules)

---

## Installation

```bash
git clone https://github.com/your-username/Chat-with-PDF.git
cd chatpdf-ai
npm install
```

---

## Environment Variables

Create a .env file in the root directory:
```bash
GEMINI_API_KEY=your_api_key_here
```
---

## Running the Project

```bash
npm start
```
Then open
```bash
http://localhost:3000
```

---

## Project Structure

```bash
├── public/
│   └── uploads/        # uploaded PDF files
├── views/
│   └── index.ejs       # frontend interface
├── index.js            # main server
├── .env
├── package.json
```

---

## How It Works
1. User uploads a PDF file
2. Server extracts text using pdf-parse
3. Text is split into chunks
4. User submits a question
5. System finds relevant chunks using similarity scoring
6. Relevant context is injected into the prompt
7. Gemini generates a response based on the provided context

---

## Key Concept: RAG (Retrieval-Augmented Generation)
This project implements a basic version of RAG:
- Retrieval: similarity-based chunk selection
- Augmentation: injecting retrieved context into the prompt
- Generation: LLM response using Google Gemini


## Limitations
- No vector database (uses in-memory similarity search)
- Basic keyword-based retrieval instead of embeddings
- Not optimized for large-scale PDFs
- Single-session state (no user isolation)
- Limited scalability for production workloads




