import React, { useState } from 'react';
import {
  Mail,
  Send,
  Upload,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronRight,
  X,
  Code,
} from 'lucide-react';
import { EmailItem } from '../types';

interface EmailProcessingViewProps {
  emails: EmailItem[];
  onProcessEmail: (id: string) => Promise<any>;
  onUploadEmail: (email: { sender: string; subject: string; body: string; attachments?: string[] }) => void;
  onNavigateToApprovals: () => void;
  onNavigateToRpa: () => void;
}

export const EmailProcessingView: React.FC<EmailProcessingViewProps> = ({
  emails,
  onProcessEmail,
  onUploadEmail,
  onNavigateToApprovals,
  onNavigateToRpa,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(emails[0] || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<any | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Compose form state
  const [senderInput, setSenderInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');

  const sampleEmails = [
    {
      title: 'WFH Policy Query',
      sender: 'jennifer.lawrence@acme.org',
      subject: 'Inquiry on Work From Home Policy',
      body: 'Hello HR Team,\n\nI need clarification regarding the 2026 remote work policy. How many days per week are permitted to work from home, and what is the approval process?\n\nBest regards,\nJennifer',
    },
    {
      title: 'Cloud Infrastructure Invoice ($8,450)',
      sender: 'billing@cloudtech-solutions.io',
      subject: 'Vendor Invoice #INV-2026-9042 - Cloud Cluster',
      body: 'Dear Accounts Payable,\n\nPlease find attached Invoice #INV-2026-9042 for $8,450.00 for October cloud infrastructure compute capacity. Payment due in 30 days.\n\nRegards,\nCloudTech Billing',
      attachments: ['Invoice_INV_2026_9042.pdf'],
    },
    {
      title: 'Critical VPN Gateway Failure',
      sender: 'marcus.brody@acme.org',
      subject: 'Urgent: Production VPN Gateway Down',
      body: 'Hi IT Support,\n\nGlobalProtect VPN has gone completely offline after the latest patch. 15 remote engineers cannot connect to AWS databases. Please dispatch an urgent ticket.\n\nMarcus Brody',
    },
  ];

  const handleRunProcess = async (email: EmailItem) => {
    setIsProcessing(true);
    setProcessResult(null);
    try {
      const res = await onProcessEmail(email.id);
      setProcessResult(res);
      setSelectedEmail({
        ...email,
        status: res.requires_human_approval ? 'AWAITING_APPROVAL' : 'PROCESSED',
        category: res.category,
        priority: res.priority,
        request_id: res.request_id,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = (s: (typeof sampleEmails)[0]) => {
    setSenderInput(s.sender);
    setSubjectInput(s.subject);
    setBodyInput(s.body);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderInput || !subjectInput || !bodyInput) return;
    onUploadEmail({
      sender: senderInput,
      subject: subjectInput,
      body: bodyInput,
    });
    setShowComposeModal(false);
    setSenderInput('');
    setSubjectInput('');
    setBodyInput('');
  };

  const filteredEmails = emails.filter(
    (e) =>
      e.subject.toLowerCase().includes(filterQuery.toLowerCase()) ||
      e.sender.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (e.category && e.category.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI-Powered Email Ingestion & Processing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Incoming emails are extracted, classified via LLM, and validated with strict Pydantic schemas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComposeModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Upload or Compose Email</span>
          </button>
        </div>
      </div>

      {/* Main split view: Email List vs Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Email list pane (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[700px] overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by sender, subject, category..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-hidden text-slate-800"
            />
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredEmails.map((item) => {
              const isSelected = selectedEmail?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedEmail(item);
                    setProcessResult(null);
                  }}
                  className={`w-full text-left p-4 transition flex flex-col gap-1.5 cursor-pointer ${
                    isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 truncate max-w-[200px]">{item.sender}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-800 truncate">{item.subject}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{item.body}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {item.category ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                        {item.category}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        Unclassified
                      </span>
                    )}

                    {item.priority && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.priority === 'URGENT'
                            ? 'bg-red-100 text-red-800'
                            : item.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.priority}
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto ${
                        item.status === 'RPA_COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'AWAITING_APPROVAL'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : item.status === 'PROCESSED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Email Detailed Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[700px] overflow-hidden">
          {selectedEmail ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {selectedEmail.id}
                    </span>
                    {selectedEmail.request_id && (
                      <span className="text-xs font-mono text-slate-500">
                        Correlation: {selectedEmail.request_id}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{selectedEmail.subject}</h2>
                  <p className="text-xs text-slate-500">
                    From: <span className="font-medium text-slate-700">{selectedEmail.sender}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunProcess(selectedEmail)}
                    disabled={isProcessing}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                    <span>{isProcessing ? 'Analyzing with LLM...' : 'Classify & Process'}</span>
                  </button>
                </div>
              </div>

              {/* Email Content Body */}
              <div className="p-5 border-b border-slate-100 overflow-y-auto max-h-48 bg-slate-50/30 font-sans text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {selectedEmail.body}
              </div>

              {/* Structured AI Analysis / Pydantic Output */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Structured Pydantic Model Validation
                    </h3>
                  </div>

                  {(processResult || selectedEmail.category) && (
                    <button
                      onClick={() => setShowJsonModal(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Inspect Raw JSON</span>
                    </button>
                  )}
                </div>

                {processResult || selectedEmail.category ? (
                  <div className="space-y-4">
                    {/* Status grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Category</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">
                          {processResult?.category || selectedEmail.category}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Priority</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">
                          {processResult?.priority || selectedEmail.priority || 'NORMAL'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Confidence</span>
                        <p className="text-xs font-bold text-emerald-600 mt-0.5">
                          {processResult?.confidence ? `${(processResult.confidence * 100).toFixed(0)}%` : '96%'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">RAG Required</span>
                        <p className="text-xs font-bold text-indigo-600 mt-0.5">
                          {processResult?.requires_rag ?? true ? 'YES' : 'NO'}
                        </p>
                      </div>
                    </div>

                    {/* Human Approval Alert if needed */}
                    {(processResult?.requires_human_approval || selectedEmail.status === 'AWAITING_APPROVAL') && (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold">Human Approval Gate Triggered</h4>
                          <p className="text-xs text-amber-800 mt-0.5">
                            This high-impact request involves financial invoice posting or sensitive company policies. UiPath RPA execution is safely suspended until an authorized Reviewer approves it.
                          </p>
                          <button
                            onClick={onNavigateToApprovals}
                            className="mt-2 text-xs font-bold text-amber-900 underline hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open Approval Center</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Summary & Suggested Action */}
                    <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                          AI Decision &amp; Action Recommendation
                        </span>
                        <span className="text-emerald-400 font-mono text-[11px]">
                          {processResult?.suggested_action || 'EXECUTE_RPA_WORKFLOW'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {processResult?.summary ||
                          'Request classified and verified against company knowledge base. Structured data extracted for downstream workflow orchestration.'}
                      </p>
                    </div>

                    {/* Next step buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={onNavigateToRpa}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 cursor-pointer transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Inspect RPA Queue</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl">
                    <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-600">Email waiting for classification</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Click &quot;Classify &amp; Process&quot; above to trigger the LLM classifier and Pydantic validator.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Select an email from the left pane to view details
            </div>
          )}
        </div>
      </div>

      {/* Compose / Upload Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Upload or Test Incoming Business Email</h3>
              </div>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Test Samples */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase">1-Click Test Scenarios:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5">
                {sampleEmails.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLoadSample(sample)}
                    className="p-2.5 text-left rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 transition cursor-pointer text-xs"
                  >
                    <span className="font-bold text-slate-800 block truncate">{sample.title}</span>
                    <span className="text-[10px] text-slate-500 truncate block">{sample.subject}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Sender Email</label>
                <input
                  type="email"
                  required
                  placeholder="employee@company.com"
                  value={senderInput}
                  onChange={(e) => setSenderInput(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Subject line..."
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Body Content</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Paste email or .eml message content here..."
                  value={bodyInput}
                  onChange={(e) => setBodyInput(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Ingest Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raw JSON Inspection Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 text-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Validated Pydantic Structured Output JSON</h3>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-auto max-h-96 leading-relaxed">
              {JSON.stringify(
                processResult || {
                  request_id: selectedEmail?.request_id || 'REQ-1001',
                  category: selectedEmail?.category,
                  priority: selectedEmail?.priority,
                  status: 'CLASSIFIED',
                },
                null,
                2
              )}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
