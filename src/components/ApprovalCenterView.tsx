import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileText,
  UserCheck,
  DollarSign,
  ArrowRight,
  X,
  Bot,
} from 'lucide-react';
import { ApprovalItem, UserProfile } from '../types';

interface ApprovalCenterViewProps {
  approvals: ApprovalItem[];
  currentUser: UserProfile;
  onApprove: (id: string, reason: string) => Promise<any>;
  onReject: (id: string, reason: string) => Promise<any>;
  onNavigateToRpa: () => void;
}

export const ApprovalCenterView: React.FC<ApprovalCenterViewProps> = ({
  approvals,
  currentUser,
  onApprove,
  onReject,
  onNavigateToRpa,
}) => {
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(
    approvals.find((a) => a.status === 'PENDING') || approvals[0] || null
  );
  const [decisionModalType, setDecisionModalType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterTab, setFilterTab] = useState<'PENDING' | 'HISTORY'>('PENDING');

  const canDecide = currentUser.role === 'ADMIN' || currentUser.role === 'REVIEWER';

  const pendingList = approvals.filter((a) => a.status === 'PENDING');
  const historyList = approvals.filter((a) => a.status !== 'PENDING');
  const displayList = filterTab === 'PENDING' ? pendingList : historyList;

  const handleDecisionSubmit = async () => {
    if (!selectedItem || !decisionReason.trim()) return;
    setIsSubmitting(true);
    try {
      if (decisionModalType === 'APPROVE') {
        await onApprove(selectedItem.id, decisionReason);
      } else {
        await onReject(selectedItem.id, decisionReason);
      }
      setDecisionModalType(null);
      setDecisionReason('');
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Human-in-the-Loop Approval Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enforces policy oversight before robotic execution. Dual-approval required for actions &gt;$5,000.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setFilterTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterTab === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Triage ({pendingList.length})
            </button>
            <button
              onClick={() => setFilterTab('HISTORY')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterTab === 'HISTORY'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit History ({historyList.length})
            </button>
          </div>
        </div>
      </div>

      {/* Role permission check alert */}
      {!canDecide && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Your current role is <strong>{currentUser.role}</strong>. Only <strong>Reviewer</strong> and{' '}
              <strong>Admin</strong> roles are authorized to approve or reject actions. Use the role switcher in the navbar to test decisions.
            </span>
          </div>
        </div>
      )}

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left list (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {filterTab === 'PENDING' ? 'Awaiting Human Approval' : 'Historical Decisions'}
            </span>
            <span className="text-xs font-semibold text-slate-500">{displayList.length} Items</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {displayList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No items in this queue
              </div>
            ) : (
              displayList.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-4 transition flex flex-col gap-1.5 cursor-pointer ${
                      isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-indigo-700 font-bold">{item.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : item.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 truncate">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{item.summary}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Ref: {item.request_id}</span>
                      <span>{new Date(item.requested_at).toLocaleTimeString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right review pane (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {selectedItem ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selectedItem.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {selectedItem.category}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 mt-1.5">{selectedItem.title}</h2>
                  <p className="text-xs text-slate-500">Request ID: {selectedItem.request_id}</p>
                </div>

                {selectedItem.status === 'PENDING' && canDecide && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDecisionModalType('REJECT')}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setDecisionModalType('APPROVE')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve &amp; Run RPA</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Review sections */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {/* Decision history badge if already decided */}
                {selectedItem.status !== 'PENDING' && (
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      selectedItem.status === 'APPROVED'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <UserCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="text-xs space-y-1">
                      <div className="font-bold">
                        Decision: {selectedItem.status} by {selectedItem.decided_by}
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        Timestamp: {selectedItem.decided_at}
                      </div>
                      <div>
                        Reason: <span className="italic font-medium">&quot;{selectedItem.decision_reason}&quot;</span>
                      </div>
                      {selectedItem.rpa_job_id && (
                        <div className="pt-1 flex items-center gap-2 text-indigo-700 font-bold">
                          <Bot className="w-3.5 h-3.5" />
                          <span>Triggered UiPath Robot Job: {selectedItem.rpa_job_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Recommendation Banner */}
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>AI Autonomous Verification &amp; Recommendation</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {selectedItem.ai_recommendation}
                  </p>
                </div>

                {/* Extracted Fields */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Extracted Transaction Fields
                  </span>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono grid grid-cols-2 gap-2">
                    {Object.entries(selectedItem.extracted_data).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-slate-500 font-sans">{key}:</span>{' '}
                        <span className="font-bold text-slate-900">
                          {typeof val === 'number' ? `$${val.toLocaleString()}` : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Original Email / Request Text */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Original Request</span>
                  <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200 text-xs text-slate-700 font-sans leading-relaxed">
                    {selectedItem.original_text}
                  </div>
                </div>

                {/* Supporting policy citations */}
                {selectedItem.supporting_sources && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Governing Policy &amp; RAG Citations
                    </span>
                    {selectedItem.supporting_sources.map((src, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-200 text-xs">
                        <div className="font-bold text-indigo-900">{src.document} (Page {src.page})</div>
                        <p className="text-indigo-800 text-[11px] mt-0.5">{src.rule}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Select an approval request to inspect
            </div>
          )}
        </div>
      </div>

      {/* Decision Dialog Modal */}
      {decisionModalType && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {decisionModalType === 'APPROVE' ? 'Approve Request & Trigger UiPath Robot' : 'Reject Request'}
              </h3>
              <button
                onClick={() => setDecisionModalType(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {decisionModalType === 'APPROVE'
                ? `You are signing off on ${selectedItem.title}. This will immediately generate a digital approval token and execute UiPath Workflow C (Invoice / ERP posting).`
                : `You are rejecting ${selectedItem.title}. No robotic automation will be dispatched.`}
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Mandatory Reason / Audit Note <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder={
                  decisionModalType === 'APPROVE'
                    ? 'e.g., Verified against approved purchase order PO-9912 and budget line.'
                    : 'e.g., Discrepancy detected in vendor billing terms; returned to requester.'
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDecisionModalType(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDecisionSubmit}
                disabled={isSubmitting || !decisionReason.trim()}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50 ${
                  decisionModalType === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmitting ? 'Recording Audit...' : `Confirm ${decisionModalType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
