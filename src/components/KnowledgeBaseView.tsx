import React, { useState } from 'react';
import {
  BookOpen,
  Upload,
  Search,
  Trash2,
  RefreshCw,
  FileText,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  Plus,
  X,
} from 'lucide-react';
import { DocumentItem, RAGResult } from '../types';

interface KnowledgeBaseViewProps {
  documents: DocumentItem[];
  onUploadDocument: (doc: { filename: string; file_type?: string; content_text: string }) => void;
  onDeleteDocument: (id: string) => void;
  onQueryRAG: (query: string) => Promise<RAGResult>;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  documents,
  onUploadDocument,
  onDeleteDocument,
  onQueryRAG,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(documents[0] || null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState('application/pdf');
  const [uploadContent, setUploadContent] = useState('');

  // RAG query simulator state
  const [ragQuery, setRagQuery] = useState('What is the company work from home policy and how many days are allowed?');
  const [isQuerying, setIsQuerying] = useState(false);
  const [ragResult, setRagResult] = useState<RAGResult | null>(null);

  const sampleQueries = [
    'What is the company work from home policy?',
    'What are the approval thresholds for employee travel reimbursements?',
    'How do I troubleshoot corporate VPN access when Okta MFA fails?',
    'Can contractors work remotely from another country?',
  ];

  const handleExecuteRAG = async (queryText: string) => {
    setIsQuerying(true);
    try {
      const res = await onQueryRAG(queryText);
      setRagResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName || !uploadContent) return;
    onUploadDocument({
      filename: uploadName,
      file_type: uploadType,
      content_text: uploadContent,
    });
    setShowUploadModal(false);
    setUploadName('');
    setUploadContent('');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">RAG-Based Company Knowledge Base</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official policy handbooks, SOPs, and guidelines stored in Pinecone vector index (768-dim embeddings).
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document (PDF/DOCX/TXT)</span>
        </button>
      </div>

      {/* RAG Query Simulator Panel */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-sm tracking-wide">Semantic Policy Query &amp; Retrieval Simulator</h2>
          </div>
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/50">
            Vector Cosine Similarity &ge; 0.70
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Ask any policy question grounded in company documentation..."
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => handleExecuteRAG(ragQuery)}
            disabled={isQuerying || !ragQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isQuerying ? 'animate-spin' : ''}`} />
            <span>{isQuerying ? 'Querying Pinecone...' : 'Search Knowledge Base'}</span>
          </button>
        </div>

        {/* Quick Sample Query Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Try queries:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setRagQuery(q);
                handleExecuteRAG(q);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {/* RAG Query Result Card */}
        {ragResult && (
          <div className="mt-4 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">Grounded Answer (LLM Synthesized)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-slate-400">Retrieval: {ragResult.retrieval_latency_ms}ms</span>
                <span className="text-slate-400">• Generation: {ragResult.generation_latency_ms}ms</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  {ragResult.confidence}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">{ragResult.answer}</p>

            {/* Source Citations */}
            {ragResult.sources && ragResult.sources.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Verified Source References ({ragResult.sources.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ragResult.sources.map((src, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-cyan-300 truncate max-w-[200px]">
                          {src.document}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          Score: {(src.score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic line-clamp-2">&quot;{src.snippet}&quot;</p>
                      <span className="text-[10px] text-slate-500 mt-1 font-mono">
                        Page {src.page} • Chunk: {src.chunk_id}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Library and Chunk Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document list (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[600px] overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Indexed Documents ({documents.length})
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {documents.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left p-4 transition flex flex-col gap-1.5 cursor-pointer ${
                    isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[220px]">
                        {doc.filename}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {doc.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{doc.total_chunks} Chunks (768d vectors)</span>
                    <span>{(doc.file_size_bytes / 1024).toFixed(0)} KB</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Document Details & Chunks (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[600px] overflow-hidden">
          {selectedDoc ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedDoc.filename}</h3>
                  <p className="text-[11px] text-slate-500">
                    Uploaded: {new Date(selectedDoc.uploaded_at).toLocaleDateString()} • Format: {selectedDoc.file_type}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteDocument(selectedDoc.id)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Remove document from index"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Chunks viewer */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Extracted Vector Chunks ({selectedDoc.chunks.length})
                  </span>
                </div>

                {selectedDoc.chunks.map((chk, i) => (
                  <div key={chk.chunk_id || i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {chk.chunk_id}
                      </span>
                      <span className="text-slate-500 font-medium">Page {chk.page}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-sans">{chk.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Select a document to inspect vector chunks
            </div>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Upload Knowledge Base Document</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Document Name (Filename)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Employee_Handbook_2026.pdf"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">File Format</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="application/pdf">PDF (.pdf)</option>
                  <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX (.docx)</option>
                  <option value="text/plain">Plain Text (.txt)</option>
                  <option value="text/csv">CSV (.csv)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Document Content / Text</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste or type document policy text here. It will automatically split into overlapping chunks and generate embeddings..."
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Index in Pinecone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
