# AutoFlow AI — Intelligent Business Process Automation using LLM, RAG & RPA

AutoFlow AI is an end-to-end enterprise platform combining **Large Language Models (Groq + Gemini)**, **Retrieval-Augmented Generation (Pinecone + Gemini Embeddings)**, **FastAPI backend orchestration**, and **UiPath Robotic Process Automation (Studio v2024.10)** with strict **Human-in-the-Loop approval gates**.

---

## 1. Architecture & Technology Choices

### Core Principle
- **LLM (Groq & Google Gemini)**: Understands emails, invoices, and IT requests; extracts structured entities; identifies urgency/priority; formats structured Pydantic outputs.
- **RAG (Pinecone + 768-dim Embeddings)**: Grounds responses in verified company documents (HR Policy Handbook, Reimbursement SOP, IT Access Guidelines) with page-level citations and cosine similarity thresholds (&ge; 0.70).
- **Backend (FastAPI & Node Full-Stack)**: Enforces deterministic role-based access control, schema validation, rate limiting, and state transitions.
- **RPA (UiPath Studio & Orchestrator API)**: Performs high-friction robotic UI actions (Outlook mail drafting, ITSM ticket dispatching, SAP/ERP ledger entry).
- **Human Approval (Reviewer/Admin Guard)**: Sensitive transactions (such as invoices &gt;$5,000 or policy overrides) are suspended in an approval queue until digitally signed off with a mandatory audit rationale.

---

## 2. Complete Folder Structure

```
autoflow-ai/
├── backend/                              # Python FastAPI Application
│   ├── app/
│   │   ├── main.py                       # FastAPI application entry & router mounting
│   │   ├── core/
│   │   │   ├── config.py                 # Pydantic Settings (Groq, Gemini, Pinecone, UiPath)
│   │   │   ├── security.py               # JWT tokens, Bcrypt hashing, RoleChecker
│   │   │   ├── logging.py                # Structured logger with secret masking
│   │   │   └── exceptions.py             # Domain exceptions (LLM, RAG, RPA, Approvals)
│   │   ├── schemas/
│   │   │   ├── email_schema.py           # Strict Pydantic models for emails
│   │   │   ├── ai_schema.py              # LLM classification & extraction schemas
│   │   │   ├── rag_schema.py             # Document chunks & citation models
│   │   │   ├── rpa_schema.py             # UiPath execution requests & payloads
│   │   │   └── approval_schema.py        # Human-in-the-loop audit schemas
│   │   ├── services/
│   │   │   ├── llm_service.py            # Primary Groq + secondary Gemini fallback
│   │   │   ├── groq_service.py           # Groq API client (Llama 3 70B)
│   │   │   ├── gemini_service.py         # Google Gemini client (Gemini 2.5 Flash)
│   │   │   ├── pinecone_service.py       # Pinecone vector database connector
│   │   │   └── rag_service.py            # Chunking, vector similarity, source grounding
│   │   ├── integrations/
│   │   │   └── uipath/
│   │   │       ├── client.py             # Orchestrator OData client & local robot runner
│   │   │       └── webhook.py            # Robot callback webhook processor
│   │   └── api/v1/
│   │       ├── auth.py                   # /api/v1/auth (Login, Register, Me)
│   │       ├── emails.py                 # /api/v1/emails (Upload, Process, .eml)
│   │       ├── documents.py              # /api/v1/documents (Upload, Delete, Re-index)
│   │       ├── ai.py                     # /api/v1/ai (Classify, Extract)
│   │       ├── rag.py                    # /api/v1/rag/query (Semantic Q&A)
│   │       ├── rpa.py                    # /api/v1/rpa (Execute, Jobs, Callback)
│   │       ├── approvals.py              # /api/v1/approvals (Pending, Approve, Reject)
│   │       ├── analytics.py              # /api/v1/analytics (KPIs, Charts)
│   │       └── health.py                 # /api/v1/health (System status)
│   ├── tests/
│   │   └── test_classification.py        # Pytest test suite
│   ├── requirements.txt                  # Python dependencies
│   ├── Dockerfile                        # Container deployment definition
│   └── .env.example                      # Backend environment variables
│
├── uipath/                               # UiPath Studio Automation Workflows
│   ├── README.md                         # UiPath architecture & Orchestrator guide
│   ├── Workflow_A_EmailProcessing/       # Email drafting & Exchange connector
│   │   ├── project.json
│   │   └── EmailProcessing.xaml
│   ├── Workflow_B_SupportTicket/         # ITSM portal ticket automation
│   │   ├── project.json
│   │   └── SupportTicketAutomation.xaml
│   └── Workflow_C_InvoiceProcessing/     # SAP / ERP entry with approval token check
│       ├── project.json
│       └── InvoiceProcessingAutomation.xaml
│
├── src/                                  # React 19 + TypeScript + Tailwind CSS Frontend
│   ├── components/
│   │   ├── Navbar.tsx                    # System status, active provider, role switcher
│   │   ├── Sidebar.tsx                   # Responsive navigation drawer & badges
│   │   ├── OverviewDashboard.tsx         # KPIs, throughput charts, robot feed
│   │   ├── EmailProcessingView.tsx       # Ingestion, 1-click test emails, Pydantic inspector
│   │   ├── KnowledgeBaseView.tsx         # Document upload, chunk viewer, RAG simulator
│   │   ├── AiProcessingView.tsx          # Prompt templates, token telemetry, latency
│   │   ├── RpaCenterView.tsx             # UiPath robot trigger, live log stream, callbacks
│   │   ├── ApprovalCenterView.tsx        # Human review, risk check, approve/reject dialog
│   │   ├── AnalyticsView.tsx             # Interactive Recharts volume & category graphs
│   │   └── SettingsView.tsx              # Config review, RBAC switcher, code inspector
│   ├── logic/
│   │   ├── workflow.ts                   # Pure decoupled business logic
│   │   └── workflow.test.ts              # Unit tests (node:test + assert/strict)
│   ├── types.ts                          # Shared TypeScript interfaces
│   ├── App.tsx                           # Main application controller
│   └── main.tsx                          # Vite entry point
│
├── server.ts                             # Express full-stack API server + Vite middleware
├── package.json                          # Node dependencies and scripts
└── metadata.json                         # Project metadata
```

---

## 3. External Accounts & Credentials

1. **Groq Cloud API** (Primary LLM):
   - Key format: `gsk_...`
   - Model: `llama3-70b-8192`
   - Purpose: Low-latency classification and extraction.
2. **Google Gemini API** (Secondary LLM & Embeddings):
   - Key: `GEMINI_API_KEY`
   - Models: `gemini-2.5-flash` for reasoning/failover; `text-embedding-004` (768 dimensions) for vector representations.
3. **Pinecone Vector Database**:
   - Index: `autoflow-knowledge-base` (Dimension: 768, Metric: `cosine`).
   - Purpose: High-speed semantic similarity search over document chunks.
4. **UiPath Automation Cloud / Studio**:
   - Account: Community or Enterprise Cloud.
   - Purpose: Robot execution, unattended queues, and webhooks.

---

## 4. UiPath Licensing Analysis
- **Community Edition**: Free for individuals and small organizations (<$5M annual revenue). Provides 1 Automation Developer license, 1 attended robot, and 1 unattended robot connected to UiPath Automation Cloud.
- **Enterprise Edition**: High-availability robot pools, SLA monitoring, CyberArk credential integration.
- **AutoFlow Local Emulation Mode**: When running without an active Orchestrator tenant machine key, AutoFlow operates in `UIPATH_LOCAL_MODE=true` to validate the full API handoff, argument schema, and callback webhook architecture.

---

## 5. Development Milestones & Checklist
- [x] Phase 1: Architecture & Planning (API contracts, Pydantic schemas, UiPath specifications)
- [x] Phase 2: FastAPI Backend (`app/api/v1/`, `app/services/`, `app/integrations/uipath/`)
- [x] Phase 3: UiPath Workflows (Workflows A, B, and C with `.xaml` and `project.json`)
- [x] Phase 4: React 19 Frontend (Overview, Emails, RAG, AI Center, RPA Console, Approvals, Analytics, Settings)
- [x] Phase 5: Verification & Testing (Unit tests via `node:test`, browser automation via `playwright-cli`, mobile responsiveness)

---

## 6. How to Run Locally

### Full-Stack Web Application (Port 3000)
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Logic Unit Tests
```bash
npx --yes tsx --test src/logic/workflow.test.ts
```

### Python FastAPI Backend (Standalone Port 8000)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).
