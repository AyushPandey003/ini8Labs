# Patient Portal Assignment

A full-stack healthcare patient portal application built with **Next.js 16** (Frontend), **FastAPI** (Backend), and **Neon PostgreSQL** (Database).

## Features
- 📤 **Upload PDF Documents**: Secure drag-and-drop interface.
- 📋 **View Documents**: List all your medical records with metadata.
- 📥 **Download**: Retrieve your files anytime.
- 🗑️ **Delete**: Remove old or incorrect files.
- 🎨 **Modern UI**: Premium glassmorphic design with dark mode support.

## Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS 4.0
- **Backend**: Python 3.9+, FastAPI, Pydantic
- **Database**: Neon (Serverless PostgreSQL)
- **Deployment**: Configured for Vercel (Serverless Functions)

## Project Structure
```
ini8Labs/
├── my-app/                # Main Application
│   ├── app/               # Next.js Frontend Source
│   ├── api/               # FastAPI Backend Source
│   │   ├── index.py       # App Entry Point
│   │   ├── routers/       # API Endpoints
│   │   └── database.py    # DB Connection
│   └── ...
├── design.md              # Design Document & Architecture
└── README.md              # This file
```

## Prerequisites
- Node.js 18+
- Python 3.9+
- A Neon PostgreSQL database URL

## Setup Instructions

### 1. Database Setup
Ensure you have a Neon project created and copy the Connection String.

### 2. Environment Variables
Create a `.env` file in `my-app/` based on `.env.example`:
```bash
DATABASE_URL=postgres://user:password@ep-xyz.region.neon.tech/neondb?sslmode=require
```

### 3. Install Dependencies

**Frontend (Node.js)**
```bash
cd my-app
npm install
```

**Backend (Python)**
```bash
cd my-app
pip install -r requirements.txt
```

## Running Locally

You need two terminal windows:

**Terminal 1: Backend (FastAPI)**
```bash
cd my-app
# Run FastAPI on port 8000
uvicorn api.index:app --reload --port 8000
```

**Terminal 2: Frontend (Next.js)**
```bash
cd my-app
# Run Next.js on port 3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Usage (Curl)

**Upload a File**
```bash
curl -X POST "http://localhost:8000/api/documents/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/prescription.pdf"
```

**List Documents**
```bash
curl -X GET "http://localhost:8000/api/documents"
```

**Delete Document**
```bash
curl -X DELETE "http://localhost:8000/api/documents/1"
```
