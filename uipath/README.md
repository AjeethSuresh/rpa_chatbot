# AutoFlow AI — UiPath RPA Integration Architecture

## 1. Overview
This directory contains production-ready Robotic Process Automation (RPA) workflows developed for **UiPath Studio (v2024.10+)**.
AutoFlow AI delegates deterministic, high-friction, repetitive UI and legacy system integrations to UiPath robots while maintaining strict AI governance, RAG document grounding, and human-in-the-loop controls.

```
       +---------------------------------------------+
       |             AutoFlow AI (FastAPI)           |
       |  LLM Classification + RAG Document Context  |
       +---------------------+-----------------------+
                             |
                   POST /api/v1/rpa/execute
                             v
           +----------------------------------+
           |     UiPath Orchestrator / Robot   |
           +-----------------+----------------+
                             |
         +-------------------+-------------------+
         |                   |                   |
         v                   v                   v
   [Workflow A]        [Workflow B]        [Workflow C]
 Email Processing     IT Support Ticket   Invoice Processing
  (Exchange/IMAP)       (Demo ITSM Portal) (SAP/ERP Entry)
         |                   |                   |
         +-------------------+-------------------+
                             |
                   POST /api/v1/rpa/callback
                             v
       +---------------------------------------------+
       |             AutoFlow AI Dashboard           |
       |            Live Robot Audit Logs            |
       +---------------------------------------------+
```

## 2. UiPath Licensing & Deployment Options
- **UiPath Community Edition**: Free for individual developers, researchers, and small businesses (<$5M revenue, <250 devices). Includes 1 Automation Developer license, 1 Attended Robot, and 1 Unattended Robot connected to Automation Cloud.
- **UiPath Enterprise Automation Cloud**: For enterprise scale with multiple unattended robot pools, high availability, SLA guarantees, and enterprise credential stores (CyberArk / Azure Key Vault).
- **Local Developer Testing Mode**: When running without an active Orchestrator tenant or robot machine key, AutoFlow AI operates in `UIPATH_LOCAL_MODE=true` to simulate the full API handoff, argument exchange, and webhook callbacks.

## 3. Workflows Included
1. **Workflow A: Email Processing Automation** (`uipath/Workflow_A_EmailProcessing/`)
   - Connects to Exchange/IMAP mailbox.
   - Reads incoming email and passes content to AutoFlow AI classification API.
   - Receives grounded RAG policy answer and drafts response in Outlook/Exchange.
2. **Workflow B: Support Ticket Automation** (`uipath/Workflow_B_SupportTicket/`)
   - Consumes classified IT support request arguments.
   - Automates ITSM portal web forms (Title, Category, Priority, Requester, Description).
   - Extracts generated Ticket Reference and returns callback to FastAPI.
3. **Workflow C: Invoice Processing Automation** (`uipath/Workflow_C_InvoiceProcessing/`)
   - Strictly requires an `approval_token` issued after Human Reviewer sign-off.
   - Performs two-way Purchase Order matching in ERP portal.
   - Submits invoice line items and records voucher number.
