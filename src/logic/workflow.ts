/**
 * Core workflow and business logic models for AutoFlow AI.
 * Decoupled from React UI for deterministic unit testing.
 */

export type RequestCategory =
  | 'HR_POLICY'
  | 'IT_SUPPORT'
  | 'INVOICE_PROCESSING'
  | 'REIMBURSEMENT'
  | 'GENERAL_ENQUIRY'
  | 'OTHER_UNKNOWN';

export type PriorityLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type RPAStatus =
  | 'RPA_NOT_CONFIGURED'
  | 'RPA_PENDING'
  | 'RPA_RUNNING'
  | 'RPA_COMPLETED'
  | 'RPA_FAILED'
  | 'AWAITING_APPROVAL';

export type UserRole = 'ADMIN' | 'REVIEWER' | 'OPERATOR';

export interface EmailClassification {
  requestId: string;
  category: RequestCategory;
  subcategory: string;
  priority: PriorityLevel;
  requiresRag: boolean;
  requiresHumanApproval: boolean;
  confidence: number;
  extractedFields: Record<string, any>;
  missingFields: string[];
  summary: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  vendorName: string;
  invoiceDate: string;
  totalAmount: number;
  currency: string;
  discrepancies: string[];
}

/**
 * Validates and classifies incoming email content using deterministic rules
 * (used in testing and as validation for LLM output).
 */
export function classifyRequestRules(text: string, subject: string = ''): Partial<EmailClassification> {
  const combined = (subject + ' ' + text).toLowerCase();

  // Invoice processing detection
  if (
    combined.includes('invoice') ||
    combined.includes('bill') ||
    combined.includes('payment due') ||
    combined.includes('vendor amount')
  ) {
    const isHighAmount = /([$€£]\s*[5-9][0-9,]{3,}|[$€£]\s*\d{4,}|amount:\s*[$€£]?[5-9][0-9,]{3,})/i.test(combined);
    return {
      category: 'INVOICE_PROCESSING',
      subcategory: 'ACCOUNTS_PAYABLE',
      priority: isHighAmount ? 'HIGH' : 'NORMAL',
      requiresRag: true,
      requiresHumanApproval: true, // Invoices always require human approval before ERP entry
      confidence: 0.94,
    };
  }

  // Reimbursement detection
  if (
    combined.includes('reimburse') ||
    combined.includes('expense claim') ||
    combined.includes('travel expense') ||
    combined.includes('receipt')
  ) {
    return {
      category: 'REIMBURSEMENT',
      subcategory: 'TRAVEL_AND_EXPENSE',
      priority: 'NORMAL',
      requiresRag: true,
      requiresHumanApproval: true, // Reimbursements require review
      confidence: 0.92,
    };
  }

  // IT support detection
  if (
    combined.includes('vpn') ||
    combined.includes('password') ||
    combined.includes('laptop') ||
    combined.includes('software access') ||
    combined.includes('cannot connect') ||
    combined.includes('it support') ||
    combined.includes('system down')
  ) {
    const isUrgent = combined.includes('system down') || combined.includes('urgent') || combined.includes('critical');
    return {
      category: 'IT_SUPPORT',
      subcategory: combined.includes('vpn') ? 'NETWORK_VPN' : 'ACCESS_MANAGEMENT',
      priority: isUrgent ? 'URGENT' : 'NORMAL',
      requiresRag: true,
      requiresHumanApproval: false, // Standard IT ticket can auto-create
      confidence: 0.96,
    };
  }

  // HR policy detection
  if (
    combined.includes('work-from-home') ||
    combined.includes('wfh') ||
    combined.includes('remote work') ||
    combined.includes('leave') ||
    combined.includes('vacation') ||
    combined.includes('policy') ||
    combined.includes('benefits') ||
    combined.includes('maternity') ||
    combined.includes('paternity')
  ) {
    return {
      category: 'HR_POLICY',
      subcategory: combined.includes('leave') || combined.includes('vacation') ? 'LEAVE_POLICY' : 'REMOTE_WORK',
      priority: 'NORMAL',
      requiresRag: true,
      requiresHumanApproval: false, // Read-only policy Q&A does not modify business data
      confidence: 0.95,
    };
  }

  return {
    category: 'GENERAL_ENQUIRY',
    subcategory: 'GENERAL',
    priority: 'LOW',
    requiresRag: true,
    requiresHumanApproval: false,
    confidence: 0.8,
  };
}

/**
 * Validates invoice fields and checks against business policy rules:
 * - Amount cannot exceed threshold ($5,000 requires two-tier approval)
 * - Required fields: invoice number, vendor, total amount, valid date
 */
export function validateInvoice(data: Partial<InvoiceData>): { isValid: boolean; discrepancies: string[]; requiresDirectorApproval: boolean } {
  const discrepancies: string[] = [];

  if (!data.invoiceNumber || data.invoiceNumber.trim() === '') {
    discrepancies.push('Missing invoice number');
  }
  if (!data.vendorName || data.vendorName.trim() === '') {
    discrepancies.push('Missing vendor name');
  }
  if (data.totalAmount === undefined || data.totalAmount <= 0) {
    discrepancies.push('Invalid total amount: must be greater than 0');
  }
  if (!data.invoiceDate || isNaN(Date.parse(data.invoiceDate))) {
    discrepancies.push('Missing or invalid invoice date');
  }

  const requiresDirectorApproval = Boolean(data.totalAmount && data.totalAmount > 5000);
  if (requiresDirectorApproval) {
    discrepancies.push('Amount exceeds $5,000 threshold: requires Senior Management / Reviewer approval');
  }

  return {
    isValid: discrepancies.filter((d) => !d.includes('threshold')).length === 0,
    discrepancies,
    requiresDirectorApproval,
  };
}

/**
 * State machine for RPA job execution.
 * Validates legal transitions and prevents duplicate runs.
 */
export function transitionRpaState(
  currentState: RPAStatus,
  action: 'SUBMIT' | 'START' | 'COMPLETE' | 'FAIL' | 'REQUIRE_APPROVAL' | 'APPROVE' | 'REJECT'
): RPAStatus {
  switch (currentState) {
    case 'RPA_NOT_CONFIGURED':
      if (action === 'SUBMIT') return 'RPA_PENDING';
      if (action === 'REQUIRE_APPROVAL') return 'AWAITING_APPROVAL';
      throw new Error(`Cannot perform ${action} on RPA_NOT_CONFIGURED`);

    case 'AWAITING_APPROVAL':
      if (action === 'APPROVE') return 'RPA_PENDING';
      if (action === 'REJECT') return 'RPA_FAILED';
      throw new Error(`Invalid action ${action} while awaiting approval`);

    case 'RPA_PENDING':
      if (action === 'START') return 'RPA_RUNNING';
      if (action === 'FAIL') return 'RPA_FAILED';
      throw new Error(`Invalid action ${action} from RPA_PENDING`);

    case 'RPA_RUNNING':
      if (action === 'COMPLETE') return 'RPA_COMPLETED';
      if (action === 'FAIL') return 'RPA_FAILED';
      throw new Error(`Invalid action ${action} from RPA_RUNNING`);

    case 'RPA_COMPLETED':
      // Idempotency: cannot transition completed job
      throw new Error('RPA job already completed. Duplicate execution prevented.');

    case 'RPA_FAILED':
      if (action === 'SUBMIT') return 'RPA_PENDING'; // Retry permitted
      throw new Error('RPA job is in failed state');

    default:
      return currentState;
  }
}

/**
 * Calculate similarity score between document chunk and query using term overlap & token matching.
 */
export function calculateTextMatchScore(query: string, chunkText: string): number {
  if (!query || !chunkText) return 0;
  const qTerms = query.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  const chunkLower = chunkText.toLowerCase();

  let matches = 0;
  for (const term of qTerms) {
    if (chunkLower.includes(term)) {
      matches++;
    }
  }

  return qTerms.length > 0 ? Number((matches / qTerms.length).toFixed(3)) : 0;
}
