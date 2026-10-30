import React from 'react';
import { Bot, Cpu, ShieldCheck, UserCheck, Bell, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentUser: UserProfile;
  onRoleSwitch: (role: 'ADMIN' | 'REVIEWER' | 'OPERATOR') => void;
  pendingApprovalsCount: number;
  onOpenApprovals: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleSwitch,
  pendingApprovalsCount,
  onOpenApprovals,
  onToggleMobileMenu,
}) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand & Mobile Toggle */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight text-lg">AutoFlow AI</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200/60">
              Enterprise Suite
            </span>
          </div>
          <p className="text-xs text-slate-500">LLM • RAG • UiPath Robotic Process Automation</p>
        </div>
      </div>

      {/* Center Status Badges */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/70">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Orchestrator: Connected</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-medium border border-blue-200/70">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span>LLM: Groq + Gemini Fallback</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-800 text-xs font-medium border border-purple-200/70">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Pinecone RAG: Active (768d)</span>
        </div>
      </div>

      {/* Right Controls: Approvals Alert + User Role Selector */}
      <div className="flex items-center gap-4">
        {pendingApprovalsCount > 0 && (
          <button
            onClick={onOpenApprovals}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-300 hover:bg-amber-100 transition shadow-xs cursor-pointer"
            title="Pending human approval tasks"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            <span>{pendingApprovalsCount} Approval{pendingApprovalsCount > 1 ? 's' : ''} Needed</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </button>
        )}

        {/* Role Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Role:</span>
          </div>
          <select
            value={currentUser.role}
            onChange={(e) => onRoleSwitch(e.target.value as any)}
            className="text-xs font-semibold bg-white text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            aria-label="Select User Role"
          >
            <option value="REVIEWER">Reviewer ({currentUser.name})</option>
            <option value="ADMIN">Admin (Sarah Connor)</option>
            <option value="OPERATOR">Operator (David Miller)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
