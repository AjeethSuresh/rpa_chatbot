import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyRequestRules,
  validateInvoice,
  transitionRpaState,
  calculateTextMatchScore,
} from './workflow';

test('classifyRequestRules correctly classifies HR Policy and Remote Work', () => {
  const result = classifyRequestRules(
    'Hello, I need information about the company work-from-home policy. Can you tell me how many days are allowed?',
    'WFH Inquiry'
  );
  assert.equal(result.category, 'HR_POLICY');
  assert.equal(result.subcategory, 'REMOTE_WORK');
  assert.equal(result.requiresRag, true);
  assert.equal(result.requiresHumanApproval, false);
});

test('classifyRequestRules classifies high-value invoice requiring approval', () => {
  const result = classifyRequestRules(
    'Attached is Vendor Invoice #INV-9021 for $8,400 for IT cloud hardware infrastructure. Payment due in 30 days.',
    'Vendor Invoice #INV-9021'
  );
  assert.equal(result.category, 'INVOICE_PROCESSING');
  assert.equal(result.priority, 'HIGH');
  assert.equal(result.requiresHumanApproval, true);
});

test('classifyRequestRules identifies critical IT support request', () => {
  const result = classifyRequestRules(
    'System down! The production VPN gateway is unreachable, urgent assistance required.',
    'Urgent VPN Failure'
  );
  assert.equal(result.category, 'IT_SUPPORT');
  assert.equal(result.priority, 'URGENT');
  assert.equal(result.requiresHumanApproval, false);
});

test('validateInvoice flags missing fields and high threshold amounts', () => {
  const invalid = validateInvoice({
    invoiceNumber: '',
    vendorName: 'Acme Corp',
    totalAmount: -50,
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.discrepancies.length >= 2);

  const highValue = validateInvoice({
    invoiceNumber: 'INV-4040',
    vendorName: 'TechSolutions Ltd',
    totalAmount: 12500,
    invoiceDate: '2026-10-15',
  });
  assert.equal(highValue.isValid, true);
  assert.equal(highValue.requiresDirectorApproval, true);
});

test('transitionRpaState enforces valid state lifecycle and idempotency', () => {
  let state = transitionRpaState('RPA_NOT_CONFIGURED', 'SUBMIT');
  assert.equal(state, 'RPA_PENDING');

  state = transitionRpaState(state, 'START');
  assert.equal(state, 'RPA_RUNNING');

  state = transitionRpaState(state, 'COMPLETE');
  assert.equal(state, 'RPA_COMPLETED');

  // Completed job prevents duplicate execution
  assert.throws(() => {
    transitionRpaState(state, 'START');
  }, /Duplicate execution prevented/);
});

test('transitionRpaState requires human approval flow correctly', () => {
  let state = transitionRpaState('RPA_NOT_CONFIGURED', 'REQUIRE_APPROVAL');
  assert.equal(state, 'AWAITING_APPROVAL');

  state = transitionRpaState(state, 'APPROVE');
  assert.equal(state, 'RPA_PENDING');
});

test('calculateTextMatchScore measures keyword relevance', () => {
  const query = 'work from home policy allowed days';
  const chunkText = 'The company work from home policy permits employees up to 2 days per week.';
  const score = calculateTextMatchScore(query, chunkText);
  assert.ok(score > 0.6);
});
