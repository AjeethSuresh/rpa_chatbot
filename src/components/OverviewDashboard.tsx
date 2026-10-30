import React from 'react';
import {
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Cpu,
  Bot,
  ArrowUpRight,
  FileText,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { TabType, EmailItem, RPAJob, ApprovalItem } from '../types';

interface OverviewDashboardProps {
  emails: EmailItem[];
  rpaJobs: RPAJob[];
  approvals: ApprovalItem[];
  onNavigate: (tab: TabType) => void;
  onTriggerSampleEmail: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  emails,
  rpaJobs,
  approvals,
  onNavigate,
  onTriggerSampleEmail,
}) => {
  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const completedJobs = rpaJobs.filter((j) => j.status === 'RPA_COMPLETED');
  const totalVolume = emails.length + 384;
  const totalSuccessful = completedJobs.length + 365;

  const throughputData = [
    { day: 'Mon', emails: 45, rpa: 42, approvals: 6 },
    { day: 'Tue', emails: 68, rpa: 63, approvals: 9 },
    { day: 'Wed', emails: 82, rpa: 79, approvals: 12 },
    { day: 'Thu', emails: 94, rpa: 90, approvals: 14 },
    { day: 'Fri', emails: 73, rpa: 71, approvals: 8 },
    { day: 'Sat', emails: 22, rpa: 21, approvals: 2 },
    { day: 'Sun', emails: 18, rpa: 18, approvals: 1 },
  ];

  const categoryData = [
    { name: 'HR Policy', count: 142, fill: '#6366f1' },
    { name: 'IT Support', count: 118, fill: '#3b82f6' },
    { name: 'Invoices', count: 68, fill: '#f59e0b' },
    { name: 'Reimbursements', count: 44, fill: '#10b981' },
    { name: 'General Enquiries', count: 28, fill: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-semibold mb-3">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Multi-Agent Orchestration • UiPath Studio v2024.10</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enterprise Business Process Automation
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              AutoFlow AI receives incoming business emails, retrieves verified company policies via Pinecone vector RAG, synthesizes grounded actions with Groq & Gemini, and triggers UiPath unattended robots with human sign-off guardrails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onTriggerSampleEmail}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Inbox className="w-4 h-4 text-indigo-600" />
              <span>Process Test Email</span>
            </button>
            <button
              onClick={() => onNavigate('approvals')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition shadow-md shadow-indigo-900/40 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Review Approvals ({pendingApprovals.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Requests
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalVolume}</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +14.2%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Classified via Groq / Gemini</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              RPA Automated Jobs
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalSuccessful}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              98.6% Success
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">UiPath Robot execution confirmed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Approvals
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{pendingApprovals.length}</span>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Human-in-Loop
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">High-value invoices & sensitive claims</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Avg Processing Time
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">3.2s</span>
            <span className="text-xs text-slate-500">from email to RPA</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Zero latency backpressure</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Throughput (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Weekly Automation Throughput</h2>
              <p className="text-xs text-slate-500">Volume distribution: Ingested Emails vs RPA Executed Tasks</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              Real-time Sync
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={throughputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="emails" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEmails)" name="Incoming Emails" />
                <Area type="monotone" dataKey="rpa" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRpa)" name="RPA Executions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-900 text-base">Request Categories</h2>
                <p className="text-xs text-slate-500">Distribution of incoming requests</p>
              </div>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-3 mt-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat.name}</span>
                    <span className="font-semibold text-slate-900">{cat.count}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(cat.count / 142) * 100}%`,
                        backgroundColor: cat.fill,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('emails')}
            className="w-full mt-6 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Explore All Classified Emails</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Workflows & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core UiPath Workflows */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-base">Active UiPath Robots & Workflows</h2>
            <button
              onClick={() => onNavigate('rpa')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Robots</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  WA
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Workflow A: Email Processing</h3>
                  <p className="text-[11px] text-slate-500">Exchange / IMAP Mail Connector • Auto-Draft</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ACTIVE • 184 RUNS
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  WB
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Workflow B: Support Ticket Creation</h3>
                  <p className="text-[11px] text-slate-500">ITSM Portal Web Automation • Auto-dispatch</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ACTIVE • 122 RUNS
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  WC
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Workflow C: Invoice / ERP Posting</h3>
                  <p className="text-[11px] text-slate-500">SAP / Financial Ledger • Dual-Approval Guard</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                GUARDED • 78 RUNS
              </span>
            </div>
          </div>
        </div>

        {/* Live Robot Execution Feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <h2 className="font-bold text-slate-900 text-base">Live Automation Execution Feed</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">UiPath Agent Logs</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {rpaJobs.slice(0, 3).map((job) => (
                <div key={job.job_id} className="p-3 rounded-xl bg-slate-900 text-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-cyan-400 font-bold">{job.workflow_name}</span>
                    <span className="text-emerald-400 font-semibold">{job.status}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Job ID: <span className="text-slate-300">{job.job_id}</span> | Ref: {job.request_id}
                  </div>
                  <div className="text-[11px] text-slate-300 truncate">
                    &gt; {job.logs[job.logs.length - 1] || 'Execution completed successfully'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('rpa')}
            className="w-full mt-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Open UiPath RPA Execution Console</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
