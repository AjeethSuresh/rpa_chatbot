import React, { useState, useEffect } from 'react';
import { TabType, EmailItem, DocumentItem, ApprovalItem, RPAJob, UserProfile, RAGResult } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { EmailProcessingView } from './components/EmailProcessingView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { AiProcessingView } from './components/AiProcessingView';
import { RpaCenterView } from './components/RpaCenterView';
import { ApprovalCenterView } from './components/ApprovalCenterView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    email: 'reviewer@autoflow.ai',
    name: 'Alex Vance',
    role: 'REVIEWER',
  });

  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [rpaJobs, setRpaJobs] = useState<RPAJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initial data load
  const fetchData = async () => {
    try {
      const [emailsRes, docsRes, appRes, jobsRes, userRes] = await Promise.all([
        fetch('/api/v1/emails').then((r) => r.json()),
        fetch('/api/v1/documents').then((r) => r.json()),
        fetch('/api/v1/approvals').then((r) => r.json()),
        fetch('/api/v1/rpa/jobs').then((r) => r.json()),
        fetch('/api/v1/auth/me').then((r) => r.json()),
      ]);

      if (Array.isArray(emailsRes)) setEmails(emailsRes);
      if (Array.isArray(docsRes)) setDocuments(docsRes);
      if (Array.isArray(appRes)) setApprovals(appRes);
      if (Array.isArray(jobsRes)) setRpaJobs(jobsRes);
      if (userRes && userRes.role) setCurrentUser(userRes);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleRoleSwitch = async (role: 'ADMIN' | 'REVIEWER' | 'OPERATOR') => {
    const names = {
      ADMIN: 'Sarah Connor',
      REVIEWER: 'Alex Vance',
      OPERATOR: 'David Miller',
    };
    const name = names[role];
    setCurrentUser({ email: `${role.toLowerCase()}@autoflow.ai`, name, role });
    try {
      await fetch('/api/v1/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, name }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleProcessEmail = async (emailId: string) => {
    const res = await fetch(`/api/v1/emails/${emailId}/process`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Processing failed');
    const data = await res.json();
    await fetchData(); // refresh state
    return data;
  };

  const handleUploadEmail = async (email: { sender: string; subject: string; body: string; attachments?: string[] }) => {
    const res = await fetch('/api/v1/emails/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });
    if (res.ok) {
      await fetchData();
    }
  };

  const handleUploadDocument = async (doc: { filename: string; file_type?: string; content_text: string }) => {
    const res = await fetch('/api/v1/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    if (res.ok) {
      await fetchData();
    }
  };

  const handleDeleteDocument = async (id: string) => {
    const res = await fetch(`/api/v1/documents/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchData();
    }
  };

  const handleQueryRAG = async (query: string): Promise<RAGResult> => {
    const res = await fetch('/api/v1/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Query failed');
    return res.json();
  };

  const handleExecuteWorkflow = async (workflowName: string, requestId: string, inputArgs: any, approvalToken?: string) => {
    const res = await fetch('/api/v1/rpa/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflow_name: workflowName,
        request_id: requestId,
        input_arguments: inputArgs,
        approval_token: approvalToken,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Execution failed');
    }
    const data = await res.json();
    await fetchData();
    return data;
  };

  const handleApprove = async (id: string, reason: string) => {
    const res = await fetch(`/api/v1/approvals/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Approval failed');
    }
    await fetchData();
  };

  const handleReject = async (id: string, reason: string) => {
    const res = await fetch(`/api/v1/approvals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Rejection failed');
    }
    await fetchData();
  };

  const handleTriggerSampleEmail = async () => {
    const newSample = {
      sender: 'alexandra.daddario@enterprise-corp.com',
      subject: 'Inquiry: Vacation Rollover & Remote Work Allowance',
      body: 'Hello HR,\n\nCan you please confirm how many unused PTO vacation days can be rolled over to 2027 under company policy, and whether working remotely from abroad is permitted for up to two weeks?\n\nThank you,\nAlexandra',
    };
    await handleUploadEmail(newSample);
    setCurrentTab('emails');
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;
  const unprocessedEmailsCount = emails.filter((e) => e.status === 'RECEIVED').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenApprovals={() => setCurrentTab('approvals')}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          pendingApprovalsCount={pendingApprovalsCount}
          unprocessedEmailsCount={unprocessedEmailsCount}
          isOpenOnMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Workspace Canvas */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentTab === 'overview' && (
            <OverviewDashboard
              emails={emails}
              rpaJobs={rpaJobs}
              approvals={approvals}
              onNavigate={setCurrentTab}
              onTriggerSampleEmail={handleTriggerSampleEmail}
            />
          )}

          {currentTab === 'emails' && (
            <EmailProcessingView
              emails={emails}
              onProcessEmail={handleProcessEmail}
              onUploadEmail={handleUploadEmail}
              onNavigateToApprovals={() => setCurrentTab('approvals')}
              onNavigateToRpa={() => setCurrentTab('rpa')}
            />
          )}

          {currentTab === 'knowledge' && (
            <KnowledgeBaseView
              documents={documents}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
              onQueryRAG={handleQueryRAG}
            />
          )}

          {currentTab === 'ai' && <AiProcessingView />}

          {currentTab === 'rpa' && (
            <RpaCenterView
              rpaJobs={rpaJobs}
              onExecuteWorkflow={handleExecuteWorkflow}
              onNavigateToApprovals={() => setCurrentTab('approvals')}
            />
          )}

          {currentTab === 'approvals' && (
            <ApprovalCenterView
              approvals={approvals}
              currentUser={currentUser}
              onApprove={handleApprove}
              onReject={handleReject}
              onNavigateToRpa={() => setCurrentTab('rpa')}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView emails={emails} rpaJobs={rpaJobs} approvals={approvals} />
          )}

          {currentTab === 'settings' && (
            <SettingsView currentUser={currentUser} onRoleSwitch={handleRoleSwitch} />
          )}
        </main>
      </div>
    </div>
  );
}
