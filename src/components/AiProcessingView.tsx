import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Code,
  Terminal,
} from 'lucide-react';

export const AiProcessingView: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<'invoice' | 'hr' | 'it'>('invoice');

  const scenarios = {
    invoice: {
      title: 'Invoice Processing & PO Reconciliation',
      query: 'Attached is Vendor Invoice #INV-2026-9042 from CloudTech Solutions for $8,450.00 covering October compute clusters. Payment terms: Net 30.',
      promptTemplate: `You are AutoFlow AI's decision engine. Analyze the financial invoice and output JSON conforming to InvoiceClassificationSchema. Check against company disbursement threshold ($5,000.00).`,
      provider: 'Groq (Llama 3 70B)',
      model: 'llama3-70b-8192',
      tokens: { prompt: 184, completion: 92 },
      latencyMs: 142,
      classification: {
        category: 'INVOICE_PROCESSING',
        subcategory: 'ACCOUNTS_PAYABLE',
        priority: 'HIGH',
        requires_rag: true,
        requires_human_approval: true,
        confidence: 0.96,
      },
      extracted: {
        vendor_name: 'CloudTech Solutions',
        invoice_number: 'INV-2026-9042',
        total_amount: 8450.00,
        currency: 'USD',
        due_date: '2026-11-27',
      },
      ragContext: [
        'Document: Employee_Travel_and_Reimbursement_Policy.pdf (Page 3): Claims exceeding $500 require dual approval from the Finance Director before robotic bank disbursement.',
      ],
      decision: 'ROUTE_TO_HUMAN_APPROVAL_QUEUE',
      pydanticStatus: 'VALIDATED_OK',
    },
    hr: {
      title: 'Remote Work Policy & Days Allowed',
      query: 'Hello HR Team, I need clarification regarding the 2026 remote work policy. How many days per week are permitted to work from home, and what is the approval process?',
      promptTemplate: `You are AutoFlow AI's enterprise policy advisor. Answer using ONLY verified passages from Company_HR_Policy_Handbook_2026.pdf. Never invent rules.`,
      provider: 'Google Gemini 2.5 Flash',
      model: 'gemini-2.5-flash',
      tokens: { prompt: 210, completion: 64 },
      latencyMs: 188,
      classification: {
        category: 'HR_POLICY',
        subcategory: 'REMOTE_WORK',
        priority: 'NORMAL',
        requires_rag: true,
        requires_human_approval: false,
        confidence: 0.98,
      },
      extracted: {
        policy_topic: 'work_from_home',
        requester: 'jennifer.lawrence@acme.org',
      },
      ragContext: [
        'Document: Company_HR_Policy_Handbook_2026.pdf (Page 4): Regular full-time employees are eligible for up to 2 days of remote work per calendar week after completing their 90-day probationary period. Remote working days must be pre-approved by their direct team lead and logged in the HRMS portal.',
      ],
      decision: 'AUTO_DRAFT_EMAIL_VIA_UIPATH_WORKFLOW_A',
      pydanticStatus: 'VALIDATED_OK',
    },
    it: {
      title: 'Critical IT Support & Network Ticket',
      query: 'GlobalProtect VPN has gone completely offline after the latest patch. 15 remote engineers cannot connect to AWS databases. Please dispatch an urgent ticket.',
      promptTemplate: `Analyze IT incident description, detect urgency priority, and format payload for UiPath ITSM ticket automation.`,
      provider: 'Groq (Llama 3 70B)',
      model: 'llama3-70b-8192',
      tokens: { prompt: 140, completion: 55 },
      latencyMs: 98,
      classification: {
        category: 'IT_SUPPORT',
        subcategory: 'NETWORK_VPN',
        priority: 'URGENT',
        requires_rag: true,
        requires_human_approval: false,
        confidence: 0.99,
      },
      extracted: {
        system: 'GlobalProtect VPN',
        affected_users: 15,
        target_service: 'AWS Database Cluster',
      },
      ragContext: [
        'Document: IT_Infrastructure_and_Access_SOP.docx (Page 1): Corporate VPN Access: If gateway timeout persists, a Priority 2 ticket must be dispatched to Network Engineering via UiPath automated queue.',
      ],
      decision: 'DISPATCH_UIPATH_WORKFLOW_B_TICKET_IMMEDIATELY',
      pydanticStatus: 'VALIDATED_OK',
    },
  };

  const current = scenarios[activeScenario];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Processing Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end transparency: prompt templating, multi-provider failover, token telemetry, and Pydantic validation.
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveScenario('invoice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeScenario === 'invoice'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Invoice ($8,450)
          </button>
          <button
            onClick={() => setActiveScenario('hr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeScenario === 'hr'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HR Policy (WFH)
          </button>
          <button
            onClick={() => setActiveScenario('it')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeScenario === 'it'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            IT Ticket (VPN)
          </button>
        </div>
      </div>

      {/* Model Telemetry Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active LLM Provider</span>
          <div className="mt-1 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-900">{current.provider}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Model: {current.model}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Token Telemetry</span>
          <div className="mt-1 text-xs font-bold text-slate-900">
            {current.tokens.prompt + current.tokens.completion} Tokens
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Prompt: {current.tokens.prompt} • Comp: {current.tokens.completion}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inference Latency</span>
          <div className="mt-1 text-xs font-bold text-emerald-600">{current.latencyMs} ms</div>
          <span className="text-[10px] text-slate-500">Streaming JSON Parser</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pydantic Schema</span>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>{current.pydanticStatus}</span>
          </div>
          <span className="text-[10px] text-slate-500">Zero Unsafe Execution</span>
        </div>
      </div>

      {/* Pipeline Steps View */}
      <div className="space-y-4">
        {/* Step 1: Input & Prompt Template */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Incoming Payload &amp; Structured Prompt Template
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Raw User Input</span>
              <p className="text-slate-800 font-sans leading-relaxed">{current.query}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed">
              <span className="text-[10px] font-bold text-cyan-400 uppercase block mb-1">System Prompt Directive</span>
              {current.promptTemplate}
            </div>
          </div>
        </div>

        {/* Step 2: RAG Grounding Context */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Retrieved RAG Context (Pinecone Vector DB)
            </h3>
          </div>
          <div className="space-y-2">
            {current.ragContext.map((ctx, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 text-xs text-purple-950 font-sans leading-relaxed">
                {ctx}
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Classification & Extracted Entities */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Structured Extraction &amp; Downstream Action
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-mono">
              <span className="text-[10px] font-bold text-slate-500 uppercase block font-sans">
                Validated Classification Fields
              </span>
              <div className="space-y-1 text-slate-700">
                <div>category: <span className="text-indigo-600 font-bold">&quot;{current.classification.category}&quot;</span></div>
                <div>subcategory: <span className="text-indigo-600 font-bold">&quot;{current.classification.subcategory}&quot;</span></div>
                <div>priority: <span className="text-amber-600 font-bold">&quot;{current.classification.priority}&quot;</span></div>
                <div>requires_rag: <span className="text-emerald-600 font-bold">{String(current.classification.requires_rag)}</span></div>
                <div>requires_human_approval: <span className="text-rose-600 font-bold">{String(current.classification.requires_human_approval)}</span></div>
                <div>confidence: <span className="text-emerald-600 font-bold">{current.classification.confidence}</span></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs space-y-2 font-mono">
              <span className="text-[10px] font-bold text-cyan-400 uppercase block font-sans">
                Extracted Business Entities
              </span>
              <pre className="text-[11px] text-emerald-300 leading-relaxed overflow-x-auto">
                {JSON.stringify(current.extracted, null, 2)}
              </pre>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300 font-sans">
                Recommended Action: <span className="font-bold">{current.decision}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
