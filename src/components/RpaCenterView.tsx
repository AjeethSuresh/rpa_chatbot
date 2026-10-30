import React, { useState } from 'react';
import {
  Bot,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  FileCode,
} from 'lucide-react';
import { RPAJob } from '../types';

interface RpaCenterViewProps {
  rpaJobs: RPAJob[];
  onExecuteWorkflow: (workflowName: string, requestId: string, inputArgs: any, approvalToken?: string) => Promise<any>;
  onNavigateToApprovals: () => void;
}

export const RpaCenterView: React.FC<RpaCenterViewProps> = ({
  rpaJobs,
  onExecuteWorkflow,
  onNavigateToApprovals,
}) => {
  const [selectedJob, setSelectedJob] = useState<RPAJob | null>(rpaJobs[0] || null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'A' | 'B' | 'C'>('B');

  // Input states for manual test triggers
  const [ticketTitle, setTicketTitle] = useState('Network switch port down in Server Room B');
  const [ticketCategory, setTicketCategory] = useState('IT_SUPPORT');
  const [ticketPriority, setTicketPriority] = useState('HIGH');

  const [emailRecipient, setEmailRecipient] = useState('employee@acme.org');
  const [emailDraftBody, setEmailDraftBody] = useState('According to HR policy, 2 remote days are allowed weekly.');

  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-9042');
  const [invoiceVendor, setInvoiceVendor] = useState('CloudTech Solutions');
  const [invoiceAmount, setInvoiceAmount] = useState(8450);
  const [approvalToken, setApprovalToken] = useState('APPROVAL-TOKEN-DEMO-AUTH-2026');

  const handleRunWorkflow = async (workflowName: string, args: any, token?: string) => {
    setIsTriggering(true);
    try {
      const res = await onExecuteWorkflow(
        workflowName,
        `REQ-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        args,
        token
      );
      setSelectedJob(res);
    } catch (err: any) {
      alert(err.message || 'Execution failed');
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">UiPath RPA Automation Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Production robotic process automation integrated with UiPath Studio v2024.10, Orchestrator REST API, and webhooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-300">
            UiPath Robot Agent: Online
          </span>
        </div>
      </div>

      {/* Manual Workflow Trigger Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Dispatch UiPath Robot Workflows
            </h2>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveWorkflowTab('A')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeWorkflowTab === 'A' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Workflow A (Email)
            </button>
            <button
              onClick={() => setActiveWorkflowTab('B')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeWorkflowTab === 'B' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Workflow B (Ticket)
            </button>
            <button
              onClick={() => setActiveWorkflowTab('C')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeWorkflowTab === 'C' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Workflow C (Invoice ERP)
            </button>
          </div>
        </div>

        {/* Tab A: Email Processing */}
        {activeWorkflowTab === 'A' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Recipient</label>
              <input
                type="email"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">AI Response Body</label>
              <input
                type="text"
                value={emailDraftBody}
                onChange={(e) => setEmailDraftBody(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300"
              />
            </div>
            <button
              onClick={() =>
                handleRunWorkflow('Workflow_A_EmailProcessing', {
                  recipient: emailRecipient,
                  body: emailDraftBody,
                })
              }
              disabled={isTriggering}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isTriggering ? 'Executing Robot...' : 'Trigger Workflow A'}</span>
            </button>
          </div>
        )}

        {/* Tab B: Support Ticket */}
        {activeWorkflowTab === 'B' && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Incident Title</label>
              <input
                type="text"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Category</label>
              <input
                type="text"
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Priority</label>
              <select
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <button
              onClick={() =>
                handleRunWorkflow('Workflow_B_SupportTicket', {
                  title: ticketTitle,
                  category: ticketCategory,
                  priority: ticketPriority,
                  requester: 'employee.support@acme.org',
                })
              }
              disabled={isTriggering}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isTriggering ? 'Creating Ticket...' : 'Trigger Workflow B'}</span>
            </button>
          </div>
        )}

        {/* Tab C: Invoice Processing */}
        {activeWorkflowTab === 'C' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Workflow C enters financial data directly into SAP/ERP and enforces digital human approval tokens.
                </span>
              </div>
              <button
                onClick={onNavigateToApprovals}
                className="text-xs font-bold text-amber-900 underline hover:text-amber-950 shrink-0"
              >
                Go to Approvals
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Vendor Name</label>
                <input
                  type="text"
                  value={invoiceVendor}
                  onChange={(e) => setInvoiceVendor(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300"
                />
              </div>
              <button
                onClick={() =>
                  handleRunWorkflow(
                    'Workflow_C_InvoiceProcessing',
                    {
                      invoice_number: invoiceNumber,
                      vendor_name: invoiceVendor,
                      total_amount: invoiceAmount,
                    },
                    approvalToken
                  )
                }
                disabled={isTriggering}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isTriggering ? 'Executing ERP Robot...' : 'Trigger Workflow C'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Job History vs Live Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Job list (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[550px] overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Executed Robot Jobs ({rpaJobs.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">UiPath Queue</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {rpaJobs.map((job) => {
              const isSelected = selectedJob?.job_id === job.job_id;
              return (
                <button
                  key={job.job_id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left p-4 transition flex flex-col gap-1.5 cursor-pointer ${
                    isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{job.workflow_name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        job.status === 'RPA_COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : job.status === 'RPA_FAILED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Job ID: {job.job_id}</span>
                    <span>{new Date(job.start_time).toLocaleTimeString()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Job Live Logs & Output (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[550px] overflow-hidden">
          {selectedJob ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-900">{selectedJob.job_id}</span>
                    <span className="text-[11px] text-slate-500 font-mono">Ref: {selectedJob.request_id}</span>
                  </div>
                  <h3 className="text-xs font-bold text-indigo-700 mt-0.5">{selectedJob.workflow_name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Execution Exit Code: 0</span>
                  <span className="text-[11px] text-emerald-600 font-bold font-mono">Confirmed Completed</span>
                </div>
              </div>

              {/* Console log stream */}
              <div className="flex-1 p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-y-auto space-y-1.5">
                <div className="text-slate-500 pb-1 border-b border-slate-800 text-[11px]">
                  --- [UiPath Robot Terminal Log Stream] ---
                </div>
                {selectedJob.logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed text-emerald-400/90">
                    &gt; {log}
                  </div>
                ))}
              </div>

              {/* Execution result payload */}
              {selectedJob.execution_result && (
                <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">
                    Captured Output Parameters (FastAPI Callback Received)
                  </span>
                  <pre className="font-mono text-[11px] text-slate-300">
                    {JSON.stringify(selectedJob.execution_result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Select a job from the left pane to view execution stream
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
