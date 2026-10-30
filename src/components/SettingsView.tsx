import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Layers,
  Bot,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Key,
  Server,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  currentUser: UserProfile;
  onRoleSwitch: (role: 'ADMIN' | 'REVIEWER' | 'OPERATOR') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onRoleSwitch,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'main' | 'llm' | 'rpa_client' | 'uipath_xaml'>('main');

  const codeSnippets = {
    main: `"""
backend/app/main.py
AutoFlow AI FastAPI Core Architecture
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, emails, documents, ai, rag, rpa, approvals, analytics

app = FastAPI(title="AutoFlow AI", version="1.0.0")

app.include_router(emails.router, prefix="/api/v1/emails")
app.include_router(documents.router, prefix="/api/v1/documents")
app.include_router(rag.router, prefix="/api/v1/rag")
app.include_router(rpa.router, prefix="/api/v1/rpa")
app.include_router(approvals.router, prefix="/api/v1/approvals")
app.include_router(analytics.router, prefix="/api/v1/analytics")`,
    llm: `"""
backend/app/services/llm_service.py
Groq Primary + Gemini Fallback with Pydantic JSON Validation
"""
class LLMService:
    async def execute_prompt(self, system_prompt: str, user_prompt: str, json_mode: bool = True):
        # 1. Try Groq (Llama 3 70B)
        # 2. On rate limit / error, fallback to Google Gemini 2.5 Flash
        # 3. On unconfigured credentials, fallback to deterministic heuristic engine
        for provider_name, service in [("groq", self.groq), ("gemini", self.gemini)]:
            try:
                res = await service.generate(system_prompt, user_prompt, json_mode)
                return self._validate_and_parse(res)
            except Exception as e:
                logger.warning(f"Fallback triggered: {e}")`,
    rpa_client: `"""
backend/app/integrations/uipath/client.py
UiPath Orchestrator REST API Connector
"""
class UiPathClient:
    async def trigger_robot_job(self, workflow_name: str, request_id: str, input_args: dict):
        if self.is_orchestrator_connected():
            token = await self.authenticate_orchestrator()
            # Dispatch to Orchestrator /odata/Jobs/UiPath.Server.Configuration.OData.StartJobs
            return await self._dispatch_odata_job(token, workflow_name, input_args)
        else:
            # Local unattended robot emulation & step log telemetry
            return self._execute_local_agent(workflow_name, request_id, input_args)`,
    uipath_xaml: `<!-- uipath/Workflow_C_InvoiceProcessing/InvoiceProcessingAutomation.xaml -->
<Activity mc:Ignorable="sap sap2010" x:Class="InvoiceProcessingAutomation">
  <x:Members>
    <x:Property Name="in_InvoiceNumber" Type="InArgument(x:String)" />
    <x:Property Name="in_ApprovalToken" Type="InArgument(x:String)" />
    <x:Property Name="out_VoucherNumber" Type="OutArgument(x:String)" />
  </x:Members>
  <Sequence DisplayName="ERP Invoice Posting Automation">
    <If Condition="[String.IsNullOrEmpty(in_ApprovalToken)]">
      <If.Then>
        <Throw Exception="[New SecurityException(&quot;Human Approval Required!&quot;)]" />
      </If.Then>
    </If>
    <ui:LogMessage Message="[&quot;Posting to SAP Financial Ledger...&quot;]" />
  </Sequence>
</Activity>`,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Configuration &amp; Architecture</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review LLM fallback chains, Pinecone vector parameters, UiPath Orchestrator connectivity, and source architecture.
        </p>
      </div>

      {/* Grid of settings cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LLM Config */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">LLM Provider Chain</h3>
          </div>
          <div className="text-xs space-y-2 text-slate-600 font-sans">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Provider</span>
              <p className="font-semibold text-slate-900">Groq API (Llama 3 70B - 8192)</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Secondary Fallback</span>
              <p className="font-semibold text-slate-900">Google Gemini API (Gemini 2.5 Flash)</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Temperature &amp; Max Tokens</span>
              <p className="font-mono text-slate-700">temp: 0.1 | max_tokens: 2048</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Automatic Provider Failover Active</span>
            </div>
          </div>
        </div>

        {/* Vector DB Config */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Pinecone Vector Index</h3>
          </div>
          <div className="text-xs space-y-2 text-slate-600 font-sans">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Index Name</span>
              <p className="font-semibold text-slate-900">autoflow-knowledge-base</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Dimension &amp; Metric</span>
              <p className="font-mono text-slate-700">768-dim | Cosine Similarity</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Top-K &amp; Threshold</span>
              <p className="font-mono text-slate-700">top_k: 4 | min_score: 0.70</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Gemini text-embedding-004 Connected</span>
            </div>
          </div>
        </div>

        {/* UiPath Config */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">UiPath RPA Engine</h3>
          </div>
          <div className="text-xs space-y-2 text-slate-600 font-sans">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Runtime Environment</span>
              <p className="font-semibold text-slate-900">UiPath Studio v2024.10 + Orchestrator API</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Execution Mode</span>
              <p className="font-semibold text-slate-900">Local Studio &amp; Webhook Callback</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Enforced Guardrails</span>
              <p className="font-mono text-slate-700">Dual-approval token required for Workflow C</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Orchestrator REST Endpoints Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Management & RBAC Tester */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Role-Based Access Control (RBAC) Switcher
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Switch user profiles to test permission enforcement across human approvals and RPA execution:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={() => onRoleSwitch('REVIEWER')}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
              currentUser.role === 'REVIEWER'
                ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/20'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Alex Vance</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                REVIEWER
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Can review &amp; approve financial invoices and policies.</p>
          </button>

          <button
            onClick={() => onRoleSwitch('ADMIN')}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
              currentUser.role === 'ADMIN'
                ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/20'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Sarah Connor</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Full system configuration, approvals, and robot trigger.</p>
          </button>

          <button
            onClick={() => onRoleSwitch('OPERATOR')}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
              currentUser.role === 'OPERATOR'
                ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/20'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">David Miller</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                OPERATOR
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Can view queues and submit requests; cannot approve.</p>
          </button>
        </div>
      </div>

      {/* Built-in Code & Architecture Explorer */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-xl text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Full-Stack Architecture &amp; Code Inspector</h3>
              <p className="text-[11px] text-slate-400">
                Inspect the generated FastAPI Python backend and UiPath XAML robot definitions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl text-xs font-mono">
            <button
              onClick={() => setActiveCodeTab('main')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                activeCodeTab === 'main' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              main.py
            </button>
            <button
              onClick={() => setActiveCodeTab('llm')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                activeCodeTab === 'llm' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              llm_service.py
            </button>
            <button
              onClick={() => setActiveCodeTab('rpa_client')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                activeCodeTab === 'rpa_client' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              uipath_client.py
            </button>
            <button
              onClick={() => setActiveCodeTab('uipath_xaml')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                activeCodeTab === 'uipath_xaml' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Workflow_C.xaml
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
          {codeSnippets[activeCodeTab]}
        </pre>
      </div>
    </div>
  );
};
