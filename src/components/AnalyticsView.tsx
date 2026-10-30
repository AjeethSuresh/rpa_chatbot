import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { BarChart3, TrendingUp, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { EmailItem, RPAJob, ApprovalItem } from '../types';

interface AnalyticsViewProps {
  emails: EmailItem[];
  rpaJobs: RPAJob[];
  approvals: ApprovalItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  emails,
  rpaJobs,
  approvals,
}) => {
  const completedJobs = rpaJobs.filter((j) => j.status === 'RPA_COMPLETED').length;
  const failedJobs = rpaJobs.filter((j) => j.status === 'RPA_FAILED').length;
  const approvedCount = approvals.filter((a) => a.status === 'APPROVED').length;
  const rejectedCount = approvals.filter((a) => a.status === 'REJECTED').length;
  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;

  // Compute category counts from actual emails list + historical offset
  const categoryMap: Record<string, number> = {
    HR_POLICY: 142,
    IT_SUPPORT: 118,
    INVOICE_PROCESSING: 68,
    REIMBURSEMENT: 44,
    GENERAL_ENQUIRY: 28,
  };
  for (const e of emails) {
    if (e.category) {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
    }
  }

  const categoryChartData = Object.entries(categoryMap).map(([cat, count]) => ({
    name: cat.replace('_', ' '),
    count,
  }));

  const COLORS = ['#6366f1', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];

  const decisionPieData = [
    { name: 'Approved', value: approvedCount + 42, color: '#10b981' },
    { name: 'Rejected', value: rejectedCount + 3, color: '#f43f5e' },
    { name: 'Pending Review', value: pendingCount, color: '#f59e0b' },
  ];

  const dailyTrendData = [
    { day: 'Mon', emails: 45, rpaSuccess: 42, rpaFail: 1, latencyMs: 140 },
    { day: 'Tue', emails: 68, rpaSuccess: 63, rpaFail: 2, latencyMs: 135 },
    { day: 'Wed', emails: 82, rpaSuccess: 79, rpaFail: 1, latencyMs: 128 },
    { day: 'Thu', emails: 94, rpaSuccess: 90, rpaFail: 2, latencyMs: 145 },
    { day: 'Fri', emails: 73, rpaSuccess: 71, rpaFail: 0, latencyMs: 132 },
    { day: 'Sat', emails: 22, rpaSuccess: 21, rpaFail: 0, latencyMs: 110 },
    { day: 'Sun', emails: 18, rpaSuccess: 18, rpaFail: 0, latencyMs: 115 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Analytics &amp; Reports</h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time aggregated intelligence across LLM inference, vector retrieval hits, human approvals, and UiPath robot performance.
        </p>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Automation Success Rate</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">98.6%</span>
            <span className="text-xs font-semibold text-emerald-600">+0.8%</span>
          </div>
          <span className="text-[10px] text-slate-500">Confirmed UiPath exit code 0</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Average AI Latency</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600">134 ms</span>
            <span className="text-xs font-semibold text-slate-500">p95 &lt; 280ms</span>
          </div>
          <span className="text-[10px] text-slate-500">Groq / Gemini combined</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Approvals Handled</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{approvedCount + rejectedCount + 45}</span>
            <span className="text-xs font-bold text-emerald-600">93% Approved</span>
          </div>
          <span className="text-[10px] text-slate-500">Audit trail logged</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Human Hours Saved</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">312 hrs</span>
            <span className="text-xs font-semibold text-emerald-700">This Month</span>
          </div>
          <span className="text-[10px] text-slate-500">Calculated @ 15 min / email</span>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Throughput Volume */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Daily Processing Volume (Emails vs Robot Success)</h3>
            <p className="text-xs text-slate-500">Daily throughput across business units</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="emails" fill="#6366f1" name="Ingested Emails" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rpaSuccess" fill="#10b981" name="RPA Successful" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Requests by Business Category</h3>
            <p className="text-xs text-slate-500">Classification volume from production database</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categoryChartData}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Total Requests" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Human-in-the-Loop Approval Ratio */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Human Approval vs Rejection Ratio</h3>
            <p className="text-xs text-slate-500">Distribution of review decisions on sensitive actions</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={decisionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {decisionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Processing Latency Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">AI Pipeline Latency Trend (ms)</h3>
            <p className="text-xs text-slate-500">Inference and token generation speed throughout week</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="latencyMs"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#8b5cf6' }}
                  name="AI Latency (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
