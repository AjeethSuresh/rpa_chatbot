export type TabType =
  | 'overview'
  | 'emails'
  | 'knowledge'
  | 'ai'
  | 'rpa'
  | 'approvals'
  | 'analytics'
  | 'settings';

export interface EmailItem {
  id: string;
  sender: string;
  subject: string;
  body: string;
  received_at: string;
  attachments: string[];
  status: 'RECEIVED' | 'PROCESSED' | 'AWAITING_APPROVAL' | 'RPA_COMPLETED';
  category?: string | null;
  priority?: string | null;
  request_id?: string | null;
}

export interface DocumentChunk {
  chunk_id: string;
  page: number;
  text: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  total_chunks: number;
  uploaded_at: string;
  status: 'INDEXED' | 'INDEXING' | 'FAILED';
  chunks: DocumentChunk[];
}

export interface SourceCitation {
  document: string;
  page: number;
  chunk_id: string;
  score: number;
  snippet: string;
}

export interface RAGResult {
  query: string;
  answer: string;
  sources: SourceCitation[];
  confidence: 'SUPPORTED' | 'PARTIAL' | 'UNSUPPORTED';
  requires_human_review: boolean;
  retrieval_latency_ms: number;
  generation_latency_ms: number;
}

export interface ApprovalItem {
  id: string;
  request_id: string;
  category: string;
  title: string;
  summary: string;
  original_text: string;
  extracted_data: Record<string, any>;
  ai_recommendation: string;
  supporting_sources: Array<{ document: string; page?: number; rule?: string }>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_at: string;
  decided_at?: string | null;
  decided_by?: string | null;
  decision_reason?: string | null;
  rpa_job_id?: string | null;
}

export interface RPAJob {
  job_id: string;
  request_id: string;
  workflow_name: string;
  status: 'RPA_PENDING' | 'RPA_RUNNING' | 'RPA_COMPLETED' | 'RPA_FAILED' | 'AWAITING_APPROVAL';
  start_time: string;
  end_time?: string | null;
  execution_result?: Record<string, any> | null;
  error_details?: string | null;
  logs: string[];
}

export interface UserProfile {
  email: string;
  name: string;
  role: 'ADMIN' | 'REVIEWER' | 'OPERATOR';
}
